import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './index';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3001/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Task', 'User', 'ReportType', 'StatusType', 'Settings'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: 'auth/profile/password',
        method: 'PATCH',
        body: data,
      }),
    }),
    getTasks: builder.query({
      query: (params) => ({ url: 'tasks', params }),
      providesTags: ['Task'],
    }),
    getTaskById: builder.query({
      query: (id) => `tasks/${id}`,
      providesTags: ['Task'],
    }),
    createTask: builder.mutation({
      query: (data) => ({ url: 'tasks', method: 'POST', body: data }),
      invalidatesTags: ['Task'],
    }),
    updateTask: builder.mutation({
      query: ({ id, ...data }) => ({ url: `tasks/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['Task'],
    }),
    getUsers: builder.query({
      query: (params) => ({ url: 'admin/users', params }),
      providesTags: ['User'],
    }),
    createUser: builder.mutation({
      query: (data) => ({ url: 'admin/users', method: 'POST', body: data }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...data }) => ({ url: `admin/users/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({ url: `admin/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),
    getReportTypes: builder.query({
      query: () => 'report-types',
      providesTags: ['ReportType'],
    }),
    createReportType: builder.mutation({
      query: (data) => ({ url: 'admin/report-types', method: 'POST', body: data }),
      invalidatesTags: ['ReportType'],
    }),
    updateReportType: builder.mutation({
      query: ({ id, ...data }) => ({ url: `admin/report-types/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['ReportType'],
    }),
    deleteReportType: builder.mutation({
      query: (id) => ({ url: `admin/report-types/${id}`, method: 'DELETE' }),
      invalidatesTags: ['ReportType'],
    }),
    getStatusTypes: builder.query({
      query: () => 'status-types',
      providesTags: ['StatusType'],
    }),
    createStatusType: builder.mutation({
      query: (data) => ({ url: 'admin/status-types', method: 'POST', body: data }),
      invalidatesTags: ['StatusType'],
    }),
    updateStatusType: builder.mutation({
      query: ({ id, ...data }) => ({ url: `admin/status-types/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['StatusType'],
    }),
    deleteStatusType: builder.mutation({
      query: (id) => ({ url: `admin/status-types/${id}`, method: 'DELETE' }),
      invalidatesTags: ['StatusType'],
    }),
    getSettings: builder.query({
      query: () => 'admin/settings',
      providesTags: ['Settings'],
    }),
    updateSettings: builder.mutation({
      query: (data) => ({ url: `admin/settings`, method: 'PATCH', body: data }),
      invalidatesTags: ['Settings'],
    }),
  }),
});

export const {
  useLoginMutation, useChangePasswordMutation,
  useGetTasksQuery, useGetTaskByIdQuery, useCreateTaskMutation, useUpdateTaskMutation,
  useGetUsersQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation,
  useGetReportTypesQuery, useCreateReportTypeMutation, useUpdateReportTypeMutation, useDeleteReportTypeMutation,
  useGetStatusTypesQuery, useCreateStatusTypeMutation, useUpdateStatusTypeMutation, useDeleteStatusTypeMutation,
  useGetSettingsQuery, useUpdateSettingsMutation,
} = api;
