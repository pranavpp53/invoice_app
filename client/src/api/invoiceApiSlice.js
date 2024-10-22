import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const invoiceApi = createApi({
  reducerPath: "invoiceApi",
  baseQuery: baseQuery("openai"),
  refetchOnMountOrArgChange: 30,
  endpoints: (builder) => ({
    uploadInvoice: builder.mutation({
      query: (formData) => {
        return {
          url: "/invoicedataprocess",
          method: "POST",
          body: formData,
        };
      },
    }),

    getAllDocuments: builder.query({
      query: ({
        search = "",
        page = 1,
        limit = 10,
        documentType = "",
        userId,
        documentNumber,
        startDate,
        endDate,  
      }) => ({
        url: "/getalldocuments",
        params: { 
          search, 
          page, 
          limit, 
          documentType, 
          userId, 
          documentNumber,
          startDate, 
          endDate, 
        },
      }),
      transformResponse: (response) => {
        return {
          documents: response.data,
          totalPages: response.totalPages,
          currentPage: response.currentPage,
        };
      },
    }),
    

    getCustomerWiseDocuments: builder.query({
      query: ({
        customerId,
        search = "",
        page = 1,
        limit = 10,
        documentType = "",
      }) => ({
        url: `/documentsofcustomer/${customerId}`,
        params: { search, page, limit, documentType },
      }),
      transformResponse: (response) => response.data,
    }),

    getDocumentWiseInvoices: builder.query({
      query: ({ id, search = "", page = 1, limit = 10 }) => ({
        url: `/invoicesindocument/${id}`,
        params: { search, page, limit },
      }),
      transformResponse: (response) => response.data,
    }),

    deleteInvoiceById: builder.mutation({
      query: (invoiceId) => ({
        url: `/deleteinvoicedata/${invoiceId}`,
        method: "DELETE",
      }),
    }),

    getInvoiceById: builder.query({
      query: (invoiceId) => ({
        url: `/getsingleinvoice/${invoiceId}`,
      }),
      transformResponse: (response) => response.data,
    }),

    updateInvoiceById: builder.mutation({
      query: ({ invoiceId, invoiceData }) => ({
        url: `/editsingleinvoice/${invoiceId}`,
        method: "PATCH",
        body: invoiceData,
      }),
    }),

    deleteSingleDocument: builder.mutation({
      query: (id) => ({
        url: `/deletedocument/${id}`,
        method: "DELETE",
      }),
    }),

    editSingleDocument: builder.mutation({
      query: ({ id, documentData }) => ({
        url: `/editsingledocument/${id}`,
        method: "PATCH",
        body: documentData,
      }),
    }),

    getSingleDocument: builder.query({
      query: (id) => `/getsingledocument/${id}`,
    }),

    getUniqueDocumentName: builder.query({
      query: () => "/uniquetitlecode",
    }),

    getAllInvoices: builder.query({
      query: ({ 
          dateFormat, 
          startDate, 
          endDate, 
          billType, 
          companyName 
      }) => ({
          url: "/getallinvoices",
          method: "GET",
          params: { 
              dateFormat, 
              startDate, 
              endDate, 
              billType, 
              companyName 
          },
      }),
      transformResponse: (response) => response.data,
  }),
  
    
  }),
});

export const {
  useUploadInvoiceMutation,
  useGetAllDocumentsQuery,
  useGetCustomerWiseDocumentsQuery,
  useGetDocumentWiseInvoicesQuery,
  useDeleteInvoiceByIdMutation,
  useGetInvoiceByIdQuery,
  useUpdateInvoiceByIdMutation,
  useDeleteSingleDocumentMutation,
  useEditSingleDocumentMutation,
  useGetSingleDocumentQuery,
  useGetUniqueDocumentNameQuery,
 useGetAllInvoicesQuery
} = invoiceApi;
