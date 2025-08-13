export interface IFAQ {
  question: string
  answer: string
}

export interface IReview {
  userId: string | UserInfo;
  stars: number;
  text: string;
  date: Date | string;
}

interface UserInfo {
  _id: string;
  name: string;
  email: string;
  profileImg: string;
}

export interface IProduct {
  _id: string
  productName: string
  productCategory:
    | string
    | {
        _id: string
        categoryName: string
        categoryImage: string
      }
  productSubCategory:
    | string
    | {
        _id: string
        subCategoryName: string
        subCategoryImage: string
      }
  productSubSubCategory?:
    | string
    | {
        _id: string
        subSubCategoryName: string
        subSubCategoryImage: string
      }
  OwnerId:
    | string
    | {
        _id: string
        name: string
        email: string
      }
  OwnerName: string
  productOriginalPrice: number
  productPrice: number
  productDiscount?: number
  productDescription: string
  productColors: string[]
  productSizes: string[]
  productImages: string[]
  productDetails: string[]
  searchTags: string[]
  popularProducts: string
  faqs: IFAQ[]
  reviews: IReview[]
  remainingProducts: number
  sales: number
  productRating: number
  video?: string
  quantity?: string
  createdAt: string
  updatedAt: string
}

export interface CreateProductRequest {
  name: string
  originalPrice: number
  discount?: number
  description: string
  quantity?: string
  productDetails: string
  colors: string
  sizes: string
  searchTags: string
  category: string
  subCategory: string
  subSubCategory?: string
  faqs: IFAQ[]
  remainingProducts: number
  OwnerName: string
  OwnerId: string
  video?: string
  productImages: File[]
}

export interface UpdateProductRequest {
  id: string
  productName?: string
  productOriginalPrice?: number
  productDiscount?: number
  productDescription?: string
  productDetails?: string
  productColors?: string
  productSizes?: string
  productCategory?: string
  productSubCategory?: string
  productSubSubCategory?: string
  searchTags?: string
  faqs?: IFAQ[]
  remainingProducts?: number
  OwnerName?: string
  video?: string
  quantity?: string
  productImages?: File[]
}

export interface ProductQuery {
  page?: number
  limit?: number
  search?: string
  category?: string
  subCategory?: string
  subSubCategory?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  size?: string
  discount?: number
}

export interface ProductApiResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
}

// Updated interface for paginated response
export interface PaginatedProductResponse {
  success: boolean
  message: string
  data: {
    success: boolean
    message: string
    count: number
    total: number
    page: number
    pages: number
    data: IProduct[]
  }
}
