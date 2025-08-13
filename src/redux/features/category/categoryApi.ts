import { baseApi } from "../../api/baseApi"
import type { ICategory, CreateCategoryRequest, UpdateCategoryRequest, CategoryApiResponse, categoryName } from "./category.types"

const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all categories
    getCategories: builder.query<CategoryApiResponse<ICategory[]>, void>({
      query: () => "/categories",
      providesTags: ["Category"],
    }),

    // Get category by ID
    getCategoryById: builder.query<CategoryApiResponse<ICategory>, string>({
      query: (id) => `/categories/${id}`,
      providesTags: ["Category"],
    }),

    getCategoryByName: builder.query<categoryName, void>({
      query: () => "/categories/get-names",
      providesTags: ["Category"],
    }),

    // Create category
    createCategory: builder.mutation<CategoryApiResponse<ICategory>, CreateCategoryRequest>({
      query: (data) => {
        const formData = new FormData()
        formData.append("categoryName", data.categoryName)
        formData.append("categoryImage", data.categoryImage)

        return {
          url: "/categories",
          method: "POST",
          body: formData,
        }
      },
      invalidatesTags: ["Category"],
    }),

    // Update category
    updateCategory: builder.mutation<CategoryApiResponse<ICategory>, UpdateCategoryRequest>({
      query: ({ id, ...data }) => {
        const formData = new FormData()
        if (data.categoryName) formData.append("categoryName", data.categoryName)
        if (data.categoryImage) formData.append("categoryImage", data.categoryImage)

        return {
          url: `/categories/${id}`,
          method: "PUT",
          body: formData,
        }
      },
      invalidatesTags: ["Category"],
    }),

    // Delete category
    deleteCategory: builder.mutation<CategoryApiResponse<{ deletedProductsCount: number }>, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
  }),
})

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoryByNameQuery
} = categoryApi

export default categoryApi
