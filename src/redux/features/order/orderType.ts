/* eslint-disable @typescript-eslint/no-explicit-any */
export type DeliveryAddress = {
  division: string;
  district: string;
  city: string;
  addressDetails: string;
};

export type OrderItem = {
  productId: string; // Frontend uses string for product ID
  productName: string;
  productCategory: string;
  price: number;
  discount?: number;
  quantity: number;
  subTotal: number;
  image: string;
  color?: string;
  size?: string;
  maxStock: number;
  OwnerId: string; // Frontend uses string for owner ID
  OwnerName: string; // Added OwnerName
};

export interface CreateOrderPayload {
  customerName: string;
  customerEmail?: string;
  customerId: string;
  phone: string;
  cuopon?: string;
  items: OrderItem[];
  totalPrice: number;
  paymentMethod: "cash" | "card" | "bKash" | "ssl" | "cod";
  deliveryFee: number
  deliveryAddress: DeliveryAddress;
}

export type OrderRequestPayload = {
  _id: string; // ✅ Add this line
  customerName: string;
  customerEmail: string;
  customerId: string;
  phone: string;
  cuopon?: string;
  items: OrderItem[];
  totalPrice: number;
  paymentMethod: "cod" | "ssl" | "cash" | "card";
  deliveryFee: number
  paymentNumber?: string;
  paymentStatus: "paid" | "unpaid"
  deliveryAddress: DeliveryAddress;
  status: string;
  createdAt: Date;
};

export type OrderResponse = {
  message: string;
  data: {
    url?: string;
    order?: any;
  };
};

// ShippingFeeData is now directly imported from admin.types,
// and ShippingFeeResponse is removed as it's not used by useGetShippingFeesQuery
// as per the provided adminApi.ts
