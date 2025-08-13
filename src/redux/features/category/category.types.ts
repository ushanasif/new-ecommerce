export interface ICategory {
  _id: string
  categoryName: string
  categoryImage: string
  createdAt: string
  updatedAt: string
}

export interface categoryName {
    data: string[]
}
export interface CreateCategoryRequest {
  categoryName: string
  categoryImage: File
}

export interface UpdateCategoryRequest {
  id: string
  categoryName?: string
  categoryImage?: File
}

export interface CategoryApiResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
}
