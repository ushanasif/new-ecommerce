import type { ICategory } from "../category/category.types"

export interface ISubCategory {
  _id: string
  subCategoryName: string
  subCategoryImage: string
  categoryId: string | ICategory
  createdAt: string
  updatedAt: string
}

export interface CreateSubCategoryRequest {
  subCategoryName: string
  categoryId: string
  subCategoryImage: File
}

export interface UpdateSubCategoryRequest {
  id: string
  subCategoryName?: string
  categoryId?: string
  subCategoryImage?: File
}

export interface SubCategoryApiResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
}
