import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const roleApi = createApi({
  reducerPath: "api",
  baseQuery:baseQuery('roles'),
  refetchOnMountOrArgChange: 30,
  endpoints: (builder) => ({
    addRole: builder.mutation({
      query: (newRole) => ({
        url: "/addrole",
        method: "POST",
        body: newRole,
      }),
    }),
    getAllRoles: builder.query({
      query: () => "/getallroles",
    }),
    getRoleById: builder.query({
      query: (roleId) => `/getrole/${roleId}`,
    }),
    updateRole: builder.mutation({
      query: ({ id, roleName, description, permissions }) => ({
        url: `/editrole/${id}`,
        method: "PUT",
        body: { roleName, description, permissions },
      }),
    }),
    deleteRole: builder.mutation({
      query: (roleId) => ({
        url: `/deleterole/${roleId}`,
        method: "DELETE",
      }),
    }),

    getFilteredRoles: builder.query({
      query: ({ search = '', page = 1, limit = 10 }) => ({
        url: '/getfilteredroles',
        params: { search, page, limit },
      }),
    }),
  }),
});

export const {
  useAddRoleMutation,
  useGetAllRolesQuery,
  useGetRoleByIdQuery,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetFilteredRolesQuery,
} = roleApi;
