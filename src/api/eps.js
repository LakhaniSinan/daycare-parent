import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// export const BASE_URL = 'https://daycare-backend-bdecee4507c1.herokuapp.com/api';
// export const BASE_URL = 'http://192.168.100.37:3000/api';
export const BASE_URL = 'https://0g01d8wd-3000.inc1.devtunnels.ms/api';

export const API = {
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  CLASS_TYPES: 'classrooms/class-types',
  CLASSROOMS: 'classrooms',
  STUDENTS_CREATE: 'students/create',
  CARPOOL_GET_ALL: 'carpool/get-all',
  CARPOOL_CREATE: 'carpool/create-carpool',
  CARPOOL_SEND_REQUEST: 'carpool/send-request',
  CARPOOL_REQUESTS: 'carpool/requests',
  CARPOOL_GET_OWN_REQUESTS: 'carpool/request/get-own',
  CARPOOL_REQUEST_ACTION: 'carpool/request/action',
  PARENT_MY_CHILDREN: 'parent/my-children',
  PARENT_STUDENT_CLASSES: 'parent/student-classes',
  PARENT_CLASS_DETAILS: 'parent/student/class-details',
  PARENT_DASHBOARD: 'parent/dashboard',
  DONATION_OPEN: 'donation/open',
  DONATION_CREATE_PAYMENT_INTENT: 'donation/create-payment-intent',
  DONATION_DONATE: 'donation/donate',
  TEACHER_CALENDAR: 'parent/calendar',
  USER_DETAILS: 'user/userDetails',
  PROFILE_UPDATE: 'profile/update',
};

function formatTeacherName(teacher) {
  if (!teacher) return '';
  if (typeof teacher === 'string') return teacher;
  const first = teacher.firstName?.trim() || '';
  const last = teacher.lastName?.trim() || '';
  return [first, last].filter(Boolean).join(' ');
}

function normalizeCalendarSession(item, index) {
  const childName = item?.childName?.trim() || '';
  const childId = item?.childId ?? null;
  const className = item?.className ?? item?.name ?? item?.class?.className ?? 'Class';
  const startTime = item?.startTime ?? item?.start ?? '';

  return {
    id:
      item?._id ??
      item?.id ??
      `${className}-${childId ?? childName}-${startTime}-${index}`,
    className,
    childId,
    childName,
    startTime,
    endTime: item?.endTime ?? item?.end ?? '',
    classType: item?.classTypeId?.name ?? item?.classType ?? item?.type ?? '',
    teacherName: formatTeacherName(item?.teacherId ?? item?.teacher),
  };
}

function extractDateKey(entry) {
  const raw = entry?.date ?? entry?.day ?? entry?.dateString ?? entry?.scheduledDate;
  if (!raw) return null;
  if (typeof raw === 'string') {
    return raw.slice(0, 10);
  }
  if (raw instanceof Date) {
    return raw.toISOString().slice(0, 10);
  }
  return null;
}

function sessionsFromEntry(entry) {
  const nested =
    entry?.classes ??
    entry?.sessions ??
    entry?.classList ??
    entry?.items ??
    entry?.schedules;

  if (Array.isArray(nested) && nested.length > 0) {
    return nested.map(normalizeCalendarSession);
  }

  if (entry?.className || entry?.startTime || entry?.name) {
    return [normalizeCalendarSession(entry, 0)];
  }

  return [];
}

export function normalizeTeacherCalendarResponse(response) {
  const raw = response?.data ?? response;
  let entries = [];

  if (Array.isArray(raw)) {
    entries = raw;
  } else if (Array.isArray(raw?.events)) {
    entries = raw.events;
  } else if (Array.isArray(raw?.days)) {
    entries = raw.days;
  } else if (Array.isArray(raw?.calendar)) {
    entries = raw.calendar;
  } else if (Array.isArray(raw?.classes)) {
    entries = raw.classes;
  } else if (raw && typeof raw === 'object') {
    entries = Object.entries(raw).flatMap(([dateKey, value]) => {
      if (!/^\d{4}-\d{2}-\d{2}/.test(dateKey)) {
        return [];
      }
      const dayKey = dateKey.slice(0, 10);
      if (Array.isArray(value)) {
        return value.map((item) => ({ ...item, date: dayKey }));
      }
      return [{ ...(value ?? {}), date: dayKey }];
    });
  }

  const byDate = {};

  entries.forEach((entry) => {
    const dayKey = extractDateKey(entry);
    if (!dayKey) return;

    const sessions = sessionsFromEntry(entry);
    if (!sessions.length) return;

    if (!byDate[dayKey]) {
      byDate[dayKey] = [];
    }
    byDate[dayKey].push(...sessions);
  });

  Object.keys(byDate).forEach((dayKey) => {
    byDate[dayKey].sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)));
  });

  return byDate;
}

function normalizeCarpoolRequestsList(response) {
  if (!response) return [];

  const payload = response?.data ?? response;

  if (Array.isArray(payload?.requests)) {
    return payload.requests.filter(Boolean);
  }
  if (Array.isArray(payload)) {
    return payload.filter(Boolean);
  }
  if (Array.isArray(response?.requests)) {
    return response.requests.filter(Boolean);
  }

  return [];
}

function normalizeOwnCarpoolRequestsList(response) {
  if (!response) return [];

  const payload = response?.data ?? response;

  if (Array.isArray(payload)) {
    return payload.filter(Boolean);
  }
  if (Array.isArray(payload?.data)) {
    return payload.data.filter(Boolean);
  }

  return [];
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token;

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Auth', 'Users', 'Classrooms', 'Students', 'Carpools', 'Donations', 'Calendar', 'Dashboard'],
  endpoints: (build) => ({
    loginParent: build.mutation({
      query: ({ email, password }) => ({
        url: API.AUTH_LOGIN,
        method: 'POST',
        body: { email, password },
      }),
    }),
    registerParent: build.mutation({
      query: (body) => ({
        url: API.AUTH_REGISTER,
        method: 'POST',
        body,
      }),
    }),
    getClassTypes: build.query({
      query: () => API.CLASS_TYPES,
      transformResponse: (response) => {
        const raw = response?.data;
        return Array.isArray(raw) ? raw : [];
      },
      providesTags: ['Classrooms'],
    }),
    getClassrooms: build.query({
      query: () => API.CLASSROOMS,
      transformResponse: (response) => {
        const raw = response?.data;
        return Array.isArray(raw) ? raw : [];
      },
      providesTags: ['Classrooms'],
    }),
    createStudent: build.mutation({
      query: (body) => ({
        url: API.STUDENTS_CREATE,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Students'],
    }),
    getMyChildren: build.query({
      query: () => API.PARENT_MY_CHILDREN,
      transformResponse: (response) => {
        const raw = response?.data;
        return Array.isArray(raw) ? raw : [];
      },
      providesTags: ['Students'],
    }),
    getStudentClasses: build.query({
      query: (studentId) => `${API.PARENT_STUDENT_CLASSES}/${studentId}`,
      transformResponse: (response) => {
        const raw = response?.data;
        const classes = Array.isArray(raw) ? raw : [];
        return {
          totalClasses: Number(response?.totalClasses) || classes.length,
          classes,
        };
      },
      providesTags: (_result, _error, studentId) => [
        { type: 'Students', id: `classes-${studentId}` },
      ],
    }),
    getClassDetails: build.query({
      query: ({ studentId, classroomId, date }) => ({
        url: `${API.PARENT_CLASS_DETAILS}/${studentId}/${classroomId}`,
        params: { date },
      }),
      transformResponse: (response) => response?.data ?? response,
      providesTags: (_result, _error, { studentId, classroomId, date }) => [
        { type: 'Students', id: `details-${studentId}-${classroomId}-${date}` },
      ],
    }),
    getParentDashboard: build.query({
      query: () => API.PARENT_DASHBOARD,
      transformResponse: (response) => {
        const top = response?.data ?? response;
        const raw =
          top?.allClasses != null ||
          top?.todayClasses != null ||
          top?.totalChildren != null ||
          top?.totalClasses != null
            ? top
            : top?.data ?? top;

        return {
          totalChildren: Number(raw?.totalChildren) || 0,
          totalClasses: Number(raw?.totalClasses) || 0,
          allClasses: Array.isArray(raw?.allClasses) ? raw.allClasses : [],
          todayClasses: Array.isArray(raw?.todayClasses) ? raw.todayClasses : [],
        };
      },
      providesTags: ['Dashboard'],
    }),
    getAllCarpools: build.query({
      query: () => API.CARPOOL_GET_ALL,
      transformResponse: (response) => {
        const raw = response?.data;
        return Array.isArray(raw) ? raw : [];
      },
      providesTags: ['Carpools'],
    }),
    createCarpool: build.mutation({
      query: (body) => ({
        url: API.CARPOOL_CREATE,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Carpools'],
    }),
    sendCarpoolRequest: build.mutation({
      query: (body) => ({
        url: API.CARPOOL_SEND_REQUEST,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Carpools'],
    }),
    getCarpoolRequests: build.query({
      query: (carpoolId) => `${API.CARPOOL_REQUESTS}/${carpoolId}`,
      transformResponse: (response) => {
        const payload = response?.data ?? response;
        return {
          requests: normalizeCarpoolRequestsList(response),
          carpool: payload?.carpool ?? null,
        };
      },
      providesTags: (_result, _error, carpoolId) => [
        { type: 'Carpools', id: `requests-${carpoolId}` },
      ],
    }),
    getMyOwnCarpoolRequests: build.query({
      query: () => API.CARPOOL_GET_OWN_REQUESTS,
      transformResponse: (response) => normalizeOwnCarpoolRequestsList(response),
      providesTags: ['Carpools'],
    }),
    carpoolRequestAction: build.mutation({
      query: ({ requestId, action }) => ({
        url: API.CARPOOL_REQUEST_ACTION,
        method: 'POST',
        body: {
          requestId: String(requestId),
          action: String(action),
        },
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: ['Carpools'],
    }),
    getOpenDonations: build.query({
      query: () => API.DONATION_OPEN,
      transformResponse: (response) => {
        const body = response?.data ?? response;
        const donations = Array.isArray(body?.donations)
          ? body.donations
          : Array.isArray(response?.donations)
            ? response.donations
            : [];
        const kpis = body?.kpis ?? response?.kpis ?? {};

        return {
          donations,
          kpis: {
            openDonations: Number(kpis.openDonations) || 0,
            donorsCount: Number(kpis.donorsCount) || 0,
            totalCollection: Number(kpis.totalCollection) || 0,
          },
        };
      },
      providesTags: ['Donations'],
    }),
    createDonationPaymentIntent: build.mutation({
      query: (body) => ({
        url: API.DONATION_CREATE_PAYMENT_INTENT,
        method: 'POST',
        body,
      }),
    }),
    getUserDetails: build.query({
      query: (userId) => `${API.USER_DETAILS}/${userId}`,
      transformResponse: (response) => response?.data ?? response,
      providesTags: (_result, _error, userId) => [{ type: 'Users', id: userId }],
    }),
    updateProfile: build.mutation({
      query: ({ firstName, lastName }) => ({
        url: API.PROFILE_UPDATE,
        method: 'PUT',
        body: {
          firstName: String(firstName ?? '').trim(),
          lastName: String(lastName ?? '').trim(),
        },
      }),
      invalidatesTags: ['Users'],
    }),
    getTeacherCalendar: build.query({
      query: ({ month, year }) => ({
        url: API.TEACHER_CALENDAR,
        params: { month, year },
      }),
      transformResponse: (response) => normalizeTeacherCalendarResponse(response),
      providesTags: ['Calendar'],
    }),
    recordDonation: build.mutation({
      // amount: dollars (e.g. 25), not cents — must match create-payment-intent
      query: ({ donationId, amount, paymentMethodId }) => ({
        url: `${API.DONATION_DONATE}/${donationId}`,
        method: 'POST',
        body: {
          amount: Number(amount),
          paymentMethodId: String(paymentMethodId ?? ''),
        },
      }),
      invalidatesTags: ['Donations'],
    }),
  }),
});

export const {
  useLoginParentMutation,
  useRegisterParentMutation,
  useGetClassTypesQuery,
  useGetClassroomsQuery,
  useCreateStudentMutation,
  useGetMyChildrenQuery,
  useGetStudentClassesQuery,
  useGetClassDetailsQuery,
  useGetParentDashboardQuery,
  useGetAllCarpoolsQuery,
  useCreateCarpoolMutation,
  useSendCarpoolRequestMutation,
  useGetCarpoolRequestsQuery,
  useGetMyOwnCarpoolRequestsQuery,
  useCarpoolRequestActionMutation,
  useGetUserDetailsQuery,
  useUpdateProfileMutation,
  useGetTeacherCalendarQuery,
  useGetOpenDonationsQuery,
  useCreateDonationPaymentIntentMutation,
  useRecordDonationMutation,
} = baseApi;
