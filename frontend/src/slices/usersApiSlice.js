import { apiSlice } from './apiSlice';
import { USERS_URL } from '../constants';

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/login`,
        method: 'POST',
        body: data,
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/register`,
        method: 'POST',
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: 'POST',
      }),
    }),
    forgotpassword: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/forgot-password`,
        method: 'POST',
      }),
    }),
   
    }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
} = userApiSlice;