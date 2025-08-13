import type { OrderRequestPayload } from "../order/orderType";


export interface IRefund {
  orderId: OrderRequestPayload; // or you can use: Types.ObjectId | IOrder if needed
  refundMethod: "card" | "bkash" | "nagad" | "rocket";
  refundNumber: string;
  refundStatus: "Pending" | "Completed" | "Rejected" | "Failed";
}