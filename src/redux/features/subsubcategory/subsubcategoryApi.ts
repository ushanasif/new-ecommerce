import { baseApi } from "../../api/baseApi"
import type {
  ISubSubCategory,
  CreateSubSubCategoryRequest,
  UpdateSubSubCategoryRequest,
  SubSubCategoryApiResponse,
} from "./subsubcategory.types"

const subsubcategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all sub-subcategories
    getSubSubCategories: builder.query<SubSubCategoryApiResponse<ISubSubCategory[]>, string | undefined>({
      query: (subCategoryId) => ({
        url: "/subsubcategories",
        params: subCategoryId ? { subCategoryId } : {},
      }),
      providesTags: ["SubSubCategory"],
    }),

    // Get sub-subcategory by ID
    getSubSubCategoryById: builder.query<SubSubCategoryApiResponse<ISubSubCategory>, string>({
      query: (id) => `/subsubcategories/${id}`,
      providesTags: ["SubSubCategory"],
    }),

    // Create sub-subcategory
    createSubSubCategory: builder.mutation<SubSubCategoryApiResponse<ISubSubCategory>, CreateSubSubCategoryRequest>({
      query: (data) => {
        const formData = new FormData()
        formData.append("subSubCategoryName", data.subSubCategoryName)
        formData.append("categoryId", data.categoryId)
        formData.append("subCategoryId", data.subCategoryId)
        formData.append("subSubCategoryImage", data.subSubCategoryImage)

        return {
          url: "/subsubcategories",
          method: "POST",
          body: formData,
        }
      },
      invalidatesTags: ["SubSubCategory"],
    }),

    // Update sub-subcategory
    updateSubSubCategory: builder.mutation<SubSubCategoryApiResponse<ISubSubCategory>, UpdateSubSubCategoryRequest>({
      query: ({ id, ...data }) => {
        const formData = new FormData()
        if (data.subSubCategoryName) formData.append("subSubCategoryName", data.subSubCategoryName)
        if (data.categoryId) formData.append("categoryId", data.categoryId)
        if (data.subCategoryId) formData.append("subCategoryId", data.subCategoryId)
        if (data.subSubCategoryImage) formData.append("subSubCategoryImage", data.subSubCategoryImage)

        return {
          url: `/subsubcategories/${id}`,
          method: "PUT",
          body: formData,
        }
      },
      invalidatesTags: ["SubSubCategory"],
    }),

    // Delete sub-subcategory
    deleteSubSubCategory: builder.mutation<SubSubCategoryApiResponse<{ deletedProductsCount: number }>, string>({
      query: (id) => ({
        url: `/subsubcategories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SubSubCategory"],
    }),
  }),
})

export const {
  useGetSubSubCategoriesQuery,
  useGetSubSubCategoryByIdQuery,
  useCreateSubSubCategoryMutation,
  useUpdateSubSubCategoryMutation,
  useDeleteSubSubCategoryMutation,
} = subsubcategoryApi

export default subsubcategoryApi
