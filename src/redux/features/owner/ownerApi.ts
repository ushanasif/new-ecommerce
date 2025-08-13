import { baseApi } from "../../api/baseApi";
import type { PaginatedProductResponse } from "../product/product.types";

const ownerApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
            // Get products by owner
  getProductsByOwner: builder.query<PaginatedProductResponse, { ownerId: string; page?: number; limit?: number; search?: string; category?: string }>({
  query: ({ ownerId, page, limit, search, category }) => {
    const params = new URLSearchParams()

    if (page) params.append("page", page.toString())
    if (limit) params.append("limit", limit.toString())
    if (search) params.append("search", search)
    if (category) params.append("category", category)

    return `/products/owner/${ownerId}?${params.toString()}`
  },
  providesTags: ["Product"],
}),
    })
});

export const {useGetProductsByOwnerQuery} = ownerApi;

export default ownerApi;