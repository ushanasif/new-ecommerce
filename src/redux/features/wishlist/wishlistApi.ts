import { baseApi } from "../../api/baseApi"
import type { IWishList, IWishlistResponse } from "./wishlist.types"

export const wishlistApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    addToWishlist: builder.mutation<IWishList, { customerId: string; productId: string }>({
      query: ({ customerId, productId }) => ({
        url: `/wishlist/add-to-wishlist/${customerId}`,
        method: "POST",
        body: { productId }, 
      }),
      invalidatesTags: ["Wishlist"],
    }),

    // Other wishlist endpoints can go here
    getWishlist: builder.query<IWishlistResponse, string>({
      query: (customerId) => `/wishlist/get-wishlist/${customerId}`,
      providesTags: ["Wishlist"],
    }),

    deleteWishlistItem: builder.mutation<void, { customerId: string; productId: string }>({
      query: ({ customerId, productId }) => ({
        url: `/wishlist/remove/${customerId}/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Wishlist"],
    }),
  }),
})

export const { useAddToWishlistMutation, useGetWishlistQuery, useDeleteWishlistItemMutation } = wishlistApi
