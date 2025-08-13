// Single banner item
export interface IBanner {
  _id: string;
  bannerImage: string;
  bannerCategory: string;
  bannerSubCategory?: string;
  bannerOffer: string;
  // Add more fields if needed (e.g. timestamps or metadata)
}

// Full response from the API
export interface BannerApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IBanner[];
}
