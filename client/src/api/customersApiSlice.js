import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const customerApi = createApi({
  reducerPath: "customerApi",
  baseQuery: baseQuery("customer"),
  refetchOnMountOrArgChange: 30,
  endpoints: (builder) => ({
    CustomerLogin: builder.mutation({
      query: (credentials) => ({
        url: "/logincustomer",
        method: "POST",
        body: credentials,
      }),
    }),

    addCustomer: builder.mutation({
      query: (newCustomer) => ({
        url: "/addnewcustomer",
        method: "POST",
        body: newCustomer,
      }),
    }),
    getCustomerById: builder.query({
      query: (customerId) => `/getcustomer/${customerId}`,
    }),
    updateCustomer: builder.mutation({
      query: ({ id, ...updateData }) => ({
        url: `/editcustomer/${id}`,
        method: "PUT",
        body: updateData,
      }),
    }),
    deleteCustomer: builder.mutation({
      query: (customerId) => ({
        url: `/deletecustomer/${customerId}`,
        method: "DELETE",
      }),
    }),
    getAllFilteredCustomers: builder.query({
      query: ({ search = "", page = 1, limit = 10 }) => ({
        url: "/listofcustomers",
        params: { search, page, limit },
      }),
    }),
    fetchPlanOptions: builder.query({
      query: () => "/getplanvalues",
    }),

    getUniqueCustomerCode: builder.query({
      query: () => '/getcustomercode',  
    }),

    getSingleCustomer: builder.query({
      query: (id) => `/getsinglecustomer/${id}`, 
      // You can add providesTags if you need to invalidate or refetch data
      providesTags: (result, error, id) => [{ type: 'Customer', id }],
    }),
  }),
});

export const {
  useAddCustomerMutation,
  useGetCustomerByIdQuery,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useGetAllFilteredCustomersQuery,
  useFetchPlanOptionsQuery,
  useGetUniqueCustomerCodeQuery,
  useCustomerLoginMutation,
  useGetSingleCustomerQuery,
} = customerApi;
