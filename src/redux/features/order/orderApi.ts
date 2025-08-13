import { baseApi } from "../../api/baseApi";
import type { CreateOrderPayload } from "./orderType";

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    postOrder: builder.mutation<{ data: { url: string } }, CreateOrderPayload>({
      query: (orderData) => ({
        url: "/order/post-order",
        method: "POST",
        body: orderData,
      }),
    }),

    getOrder: builder.query({
      query: (id) => `/order/get-order-by-customerId/${id}`,
      providesTags: ["Order"],
    }),

    cancelOrder: builder.mutation<void, { orderId: string; status: string }>({
      query: ({ orderId, status }) => ({
        url: `/order/update-status/${orderId}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Order"],
    }),
  }),
});

export const {
  usePostOrderMutation,
  useGetOrderQuery,
  useCancelOrderMutation,
} = orderApi;
