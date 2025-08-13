import type { ICategory } from "../category/category.types"
import type { ISubCategory } from "../subcategory/subcategory.types"

export interface ISubSubCategory {
  _id: string
  subSubCategoryName: string
  subSubCategoryImage: string
  categoryId: string | ICategory
  subCategoryId: string | ISubCategory
  createdAt: string
  updatedAt: string
}

export interface CreateSubSubCategoryRequest {
  subSubCategoryName: string
  categoryId: string
  subCategoryId: string
  subSubCategoryImage: File
}

export interface UpdateSubSubCategoryRequest {
  id: string
  subSubCategoryName?: string
  categoryId?: string
  subCategoryId?: string
  subSubCategoryImage?: File
}

export interface SubSubCategoryApiResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
}
