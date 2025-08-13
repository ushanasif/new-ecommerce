import { baseApi } from "../../api/baseApi"
import type {
  ISubCategory,
  CreateSubCategoryRequest,
  UpdateSubCategoryRequest,
  SubCategoryApiResponse,
} from "./subcategory.types"

const subcategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all subcategories
    getSubCategories: builder.query<SubCategoryApiResponse<ISubCategory[]>, string | undefined>({
      query: (categoryId) => ({
        url: "/subcategories",
        params: categoryId ? { categoryId } : {},
      }),
      providesTags: ["SubCategory"],
    }),

    // Get subcategory by ID
    getSubCategoryById: builder.query<SubCategoryApiResponse<ISubCategory>, string>({
      query: (id) => `/subcategories/${id}`,
      providesTags: ["SubCategory"],
    }),

    // Create subcategory
    createSubCategory: builder.mutation<SubCategoryApiResponse<ISubCategory>, CreateSubCategoryRequest>({
      query: (data) => {
        const formData = new FormData()
        formData.append("subCategoryName", data.subCategoryName)
        formData.append("categoryId", data.categoryId)
        formData.append("subCategoryImage", data.subCategoryImage)

        return {
          url: "/subcategories",
          method: "POST",
          body: formData,
        }
      },
      invalidatesTags: ["SubCategory"],
    }),

    // Update subcategory
    updateSubCategory: builder.mutation<SubCategoryApiResponse<ISubCategory>, UpdateSubCategoryRequest>({
      query: ({ id, ...data }) => {
        const formData = new FormData()
        if (data.subCategoryName) formData.append("subCategoryName", data.subCategoryName)
        if (data.categoryId) formData.append("categoryId", data.categoryId)
        if (data.subCategoryImage) formData.append("subCategoryImage", data.subCategoryImage)

        return {
          url: `/subcategories/${id}`,
          method: "PUT",
          body: formData,
        }
      },
      invalidatesTags: ["SubCategory"],
    }),

    // Delete subcategory
    deleteSubCategory: builder.mutation<SubCategoryApiResponse<{ deletedProductsCount: number }>, string>({
      query: (id) => ({
        url: `/subcategories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SubCategory"],
    }),
  }),
})

export const {
  useGetSubCategoriesQuery,
  useGetSubCategoryByIdQuery,
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
  useDeleteSubCategoryMutation,
} = subcategoryApi

export default subcategoryApi
