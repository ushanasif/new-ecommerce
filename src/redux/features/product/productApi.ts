/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "../../api/baseApi"
import type {
  IProduct,
  CreateProductRequest,
  UpdateProductRequest,
  ProductQuery,
  ProductApiResponse,
  PaginatedProductResponse,
} from "./product.types"

const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all products - Fixed query type
    getProducts: builder.query<PaginatedProductResponse, ProductQuery | undefined>({
      query: (params) => ({
        url: "/products",
        params: params || {},
      }),
      providesTags: ["Product"],
      transformResponse: (response: any) => {
        
        return {
          success: response.success,
          message: response.message,
          data: {
            success: response.success,
            message: response.message,
            count: response.data?.count || 0,
            total: response.data?.total || 0,
            page: response.data?.page || 1,
            pages: response.data?.pages || 1,
            data: response.data?.data || [],
          },
        }
      },
    }),

    // Get product by ID
    getProductById: builder.query<ProductApiResponse<IProduct>, string>({
      query: (id) => `/products/${id}`,
      providesTags: ["Product"],
    }),

    // Create product
    createProduct: builder.mutation<ProductApiResponse<IProduct>, CreateProductRequest>({
      query: (data) => {
        const formData = new FormData()
        formData.append("name", data.name)
        formData.append("originalPrice", data.originalPrice.toString())
        if (data.discount) formData.append("discount", data.discount.toString())
        formData.append("description", data.description)
        if (data.quantity) formData.append("quantity", data.quantity)
        formData.append("productDetails", data.productDetails)
        formData.append("colors", data.colors)
        formData.append("sizes", data.sizes)
        formData.append("searchTags", data.searchTags)
        formData.append("category", data.category)
        formData.append("subCategory", data.subCategory)
        if (data.subSubCategory) formData.append("subSubCategory", data.subSubCategory)
        formData.append("faqs", JSON.stringify(data.faqs))
        formData.append("remainingProducts", data.remainingProducts.toString())
        formData.append("OwnerName", data.OwnerName)
        formData.append("OwnerId", data.OwnerId)
        if (data.video) formData.append("video", data.video)

        // Append images
        data.productImages.forEach((image) => {
          formData.append("productImages", image)
        })

        return {
          url: "/products",
          method: "POST",
          body: formData,
        }
      },
      invalidatesTags: ["Product"],
    }),

    // Update product
    updateProduct: builder.mutation<ProductApiResponse<IProduct>, UpdateProductRequest>({
      query: ({ id, ...data }) => {
        const formData = new FormData()
        if (data.productName) formData.append("productName", data.productName)
        if (data.productOriginalPrice) formData.append("productOriginalPrice", data.productOriginalPrice.toString())
        if (data.productDiscount) formData.append("productDiscount", data.productDiscount.toString())
        if (data.productDescription) formData.append("productDescription", data.productDescription)
        if (data.productDetails) formData.append("productDetails", data.productDetails)
        if (data.productColors) formData.append("productColors", data.productColors)
        if (data.productSizes) formData.append("productSizes", data.productSizes)
        if (data.searchTags) formData.append("searchTags", data.searchTags)
        if (data.productCategory) formData.append("productCategory", data.productCategory)
        if (data.productSubCategory) formData.append("productSubCategory", data.productSubCategory)
        if (data.productSubSubCategory) formData.append("productSubSubCategory", data.productSubSubCategory)
        if (data.faqs) formData.append("faqs", JSON.stringify(data.faqs))
        if (data.remainingProducts) formData.append("remainingProducts", data.remainingProducts.toString())
        if (data.OwnerName) formData.append("OwnerName", data.OwnerName)
        if (data.video !== undefined) formData.append("video", data.video)
        if (data.quantity !== undefined) formData.append("quantity", data.quantity)

        // Append new images if provided
        if (data.productImages && data.productImages.length > 0) {
          data.productImages.forEach((image) => {
            formData.append("productImages", image)
          })
        }

        return {
          url: `/products/${id}`,
          method: "PUT",
          body: formData,
        }
      },
      invalidatesTags: ["Product"],
    }),

    // Delete product
    deleteProduct: builder.mutation<ProductApiResponse<void>, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),

    // Get products by category
    getProductsByCategory: builder.query<ProductApiResponse<any[]>, void>({
      query: () => "/products/categories-with-products",
      providesTags: ["Product"],
    }),

    postReview: builder.mutation({
        query: ({productId, review}) => {
            console.log(productId, review);
           return { 
            url: `/products/${productId}/reviews`,
            method: "POST",
            body: {review}
          }  
        },
        invalidatesTags: ["Product"]
    })
  }),
})

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductsByCategoryQuery,
  usePostReviewMutation,
} = productApi

export default productApi
