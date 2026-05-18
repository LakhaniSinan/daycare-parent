import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// export const BASE_URL = 'https://daycare-backend-bdecee4507c1.herokuapp.com/api';
export const BASE_URL = 'http://192.168.100.37:3000/api';

export const API = {
  AUTH_LOGIN: '/auth/login',
  CLASS_TYPES: 'classrooms/class-types',
  CLASSROOMS: 'classrooms',
  STUDENTS_CREATE: 'students/create',
  CARPOOL_GET_ALL: 'carpool/get-all',
  CARPOOL_CREATE: 'carpool/create-carpool',
  CARPOOL_SEND_REQUEST: 'carpool/send-request',
  CARPOOL_REQUEST_ACTION: 'carpool/request/action',
  PARENT_MY_CHILDREN: 'parent/my-children',
  DONATION_OPEN: 'donation/open',
  DONATION_CREATE_PAYMENT_INTENT: 'donation/create-payment-intent',
  DONATION_DONATE: 'donation/donate',
};

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
  tagTypes: ['Auth', 'Users', 'Classrooms', 'Students', 'Carpools', 'Donations'],
  endpoints: (build) => ({
    loginParent: build.mutation({
      query: ({ email, password }) => ({
        url: API.AUTH_LOGIN,
        method: 'POST',
        body: { email, password },
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
    carpoolRequestAction: build.mutation({
      query: (body) => ({
        url: API.CARPOOL_REQUEST_ACTION,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Carpools'],
    }),
    getOpenDonations: build.query({
      query: () => API.DONATION_OPEN,
      transformResponse: (response) => {
        const raw = response?.donations ?? response?.data?.donations ?? response?.data;
        return Array.isArray(raw) ? raw : [];
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
  useGetClassTypesQuery,
  useGetClassroomsQuery,
  useCreateStudentMutation,
  useGetMyChildrenQuery,
  useGetAllCarpoolsQuery,
  useCreateCarpoolMutation,
  useSendCarpoolRequestMutation,
  useCarpoolRequestActionMutation,
  useGetOpenDonationsQuery,
  useCreateDonationPaymentIntentMutation,
  useRecordDonationMutation,
} = baseApi;
