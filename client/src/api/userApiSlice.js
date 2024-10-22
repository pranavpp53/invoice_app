import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery:baseQuery('users'),
  refetchOnMountOrArgChange: 30,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/loginuser",
        method: "POST",
        body: credentials,
      }),
    }),

    getUserStatus: builder.query({
      query: (userId) => ({
        url: `/status/${userId}`,
        method: 'GET',
      }),
    }),

    addUser: builder.mutation({
      query: (userDetails) => ({
        url: "/adduser",
        method: "POST",
        body: userDetails,
      }),
    }),
    editUser: builder.mutation({
      query: ({ id, ...updatedDetails }) => ({
        url: `/editsubuser/${id}`, 
        method: "PUT",
        body: updatedDetails,
      }),
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/deletesubuser/${id}`,
        method: "DELETE",
      }),
    }),
    getAllSubUsers: builder.query({
      query: () => ({
        url: "/getsubusers",
        method: "GET",
      }),
    }),
    getUser: builder.query({
      query: (id) => ({
        url: `/getuser/${id}`,
        method: "GET",
      }),
    }),

    blockUser: builder.mutation({
      query: (id) => ({
        url: `/isblocked/${id}`,
        method: 'PATCH',
      }),
    }),
  

    changePassword: builder.mutation({
      query: ({ oldPassword, newPassword }) => ({
        url: '/change-password',
        method: 'PATCH',
        body: { oldPassword, newPassword },
      }),
    }),

    getFilteredSubUsers: builder.query({
      query: ({ search = '', page = 1, limit = 10 }) => ({
        url: '/filteredsubusers',
        params: { search, page, limit },
      }),
    }),
  }),
})


export const {
  useLoginMutation,
  useAddUserMutation,
  useEditUserMutation,
  useDeleteUserMutation,
  useGetAllSubUsersQuery, 
  useGetUserQuery,
  useChangePasswordMutation,
  useGetUserStatusQuery,
  useBlockUserMutation,
  useGetFilteredSubUsersQuery,
} = userApi;
