import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const ledgerApi = createApi({
  reducerPath: "ledgerApi",
  baseQuery: baseQuery("ledger"),
  refetchOnMountOrArgChange: 30,
  endpoints: (builder) => ({
    createLedger: builder.mutation({
      query: (ledgerData) => ({
        url: "/addledger",
        method: "POST",
        body: ledgerData,
      }),
    }),
    getAllLedgers: builder.query({
      query: () => "/getallledger",
      transformResponse: (response) => response,
    }),

    editLedger: builder.mutation({
      query: ({ id, ledgerData }) => ({
        url: `/editledger/${id}`,
        method: "PUT",
        body: ledgerData,
      }),
      invalidatesTags: ["Ledger"], 
    }),
    deleteLedger: builder.mutation({
      query: (id) => ({
        url: `/deleteledger/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Ledger"],
    }),
  }),
});

export const {
  useCreateLedgerMutation,
  useGetAllLedgersQuery,
  useEditLedgerMutation,
  useDeleteLedgerMutation,
} = ledgerApi;
