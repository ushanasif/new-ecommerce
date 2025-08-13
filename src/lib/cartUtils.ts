
import type { CartData, CartItem } from "./cartTypes";

export const getCart = (): CartData | null => {
  const cartJson = localStorage.getItem('cart');
  return cartJson ? JSON.parse(cartJson) : null;
};

export const saveCart = (cart: CartData) => {
  localStorage.setItem('cart', JSON.stringify(cart));
};

export const addToCart = (item: Omit<CartItem, 'itemPrice' | 'addedAt'>, price: number) => {
  const cart = getCart() || { customerId: '', items: [] };
  
  // Calculate item price
  const itemPrice = price * item.quantity;
  const fullItem = {
    ...item,
    itemPrice,
    addedAt: new Date().toISOString()
  };
  
  // Check if item exists
  const existingIndex = cart.items.findIndex(i => 
    i.productId === item.productId &&
    i.selectedColor === item.selectedColor &&
    i.selectedSize === item.selectedSize
  );
  
  if (existingIndex !== -1) {
    // Update existing item
    cart.items[existingIndex].quantity += item.quantity;
    cart.items[existingIndex].itemPrice += itemPrice;
  } else {
    // Add new item
    cart.items.push(fullItem);
  }
  
  saveCart(cart);
  return cart;
};

export const clearCart = () => {
  localStorage.removeItem('cart');
};

export const getCartItemCount = (): number => {
  const cart = getCart();
  return cart ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;
};