/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IWishList {
  _id: string
  customerId: string
  products: IWishlistProduct[]
  createdAt: string
  updatedAt: string
}

export interface IWishlistProduct {
  _id: string
  productName: string
  productPrice: number
  productOriginalPrice?: number
  productDiscount?: number
  productImages: string[]
  productRating: number
  reviews: any[]
  remainingProducts: number
  sales: number
  productCategory: string | any
  productSubCategory?: string | any
  productSubSubCategory?: string | any
  productColors?: string[]
  productSizes?: string[]
  productDescription: string
  productDetails: string[]
  searchTags: string[]
  faqs: any[]
  video?: string
  quantity?: string
  OwnerName: string
  createdAt: string
  updatedAt: string
}

export interface IWishlistResponse {
  success: boolean
  message: string
  data: IWishList | null
}
