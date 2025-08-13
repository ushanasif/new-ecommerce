export interface UserType {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export type UsersApiResponse = {
  success: boolean;
  message: string;
  data: UserType[];
};

export interface SearchParams {
  searchTerm?: string;
  role?: string;
}

export interface ChangeRolePayload {
  userId: string;
  role: string
}

export interface ShippingFeeData {
  shippingFee?: number;
  shippingFeeOutside?: number;
  shippingFeeInternational: number
}