import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/** API origin — same machine: use your machine LAN IP for physical device / emulator. */
export const BASE_URL = 'https://daycare-backend-bdecee4507c1.herokuapp.com/api';

/** Path constants — combined with BASE_URL (includes /api/). */
export const API = {
  AUTH_LOGIN: '/auth/login',
  CLASS_TYPES: 'classrooms/class-types',
  STUDENTS_CREATE: 'students/create',
  CARPOOL_GET_ALL: 'carpool/get-all',
  CARPOOL_CREATE: 'carpool/create-carpool',
  CARPOOL_SEND_REQUEST: 'carpool/send-request',
  CARPOOL_REQUEST_ACTION: 'carpool/request/action',
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
  tagTypes: ['Auth', 'Users', 'Classrooms', 'Students', 'Carpools'],
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
    createStudent: build.mutation({
      query: (body) => ({
        url: API.STUDENTS_CREATE,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Students'],
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
  }),
});

export const {
  useLoginParentMutation,
  useGetClassTypesQuery,
  useCreateStudentMutation,
  useGetAllCarpoolsQuery,
  useCreateCarpoolMutation,
  useSendCarpoolRequestMutation,
  useCarpoolRequestActionMutation,
} = baseApi;
