import { baseApi } from "../../api/baseApi";


export const refundApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createRefund: builder.mutation({
      query: (refundData) => ({
        url: "/refund/post",
        method: "POST",
        body: refundData,
      }),
      invalidatesTags: ["Refund", "Order"]
    }),

    getRefund: builder.query({
      query: () => "/refund",
      providesTags: ["Refund"],
    }),

    updateRefundStatus: builder.query({
         query: ({ id, status}) => {
       
        return {
          url: `/refund/${id}`,
          method: "PATCH",
          body: {id, status},
        }
      },
      providesTags: ["Refund"],
    }),
  }),
});

export const {useCreateRefundMutation, useGetRefundQuery, useUpdateRefundStatusQuery } = refundApi;
