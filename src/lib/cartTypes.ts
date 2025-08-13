// types/cartTypes.ts
export interface CartItem {
  productId: string;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
  itemPrice: number; // total price for this item (quantity * price)
  addedAt: string;
}

export interface CartData {
  customerId: string;
  items: CartItem[];
}