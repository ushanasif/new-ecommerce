import { ShoppingCart, Minus, Plus, X } from "lucide-react"
import { Link } from "react-router-dom"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "../ui/sheet"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { useState, useEffect } from "react"

interface CartItem {
  productId: string;
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
  OwnerId: string;
  OwnerName: string;
}

interface CartSidebarProps {
  mobileView?: boolean
}

const CartSidebar = ({ mobileView = false }: CartSidebarProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // Load cart from localStorage
  const loadCart = () => {
    try {
      const cart = localStorage.getItem("cart")
      return cart ? JSON.parse(cart) : []
    } catch (error) {
      console.error("Error loading cart:", error)
      return []
    }
  }

  // Save cart to localStorage
  const saveCart = (cart: CartItem[]) => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart))
      setCartItems(cart)
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent("cartUpdated"))
    } catch (error) {
      console.error("Error saving cart:", error)
    }
  }

  // Update quantity
  const updateQuantity = (itemId: string, color: string | undefined, size: string | undefined, newQuantity: number) => {
    const updatedCart = cartItems
      .map((item) => {
        if (item.productId === itemId && item.color === color && item.size === size) {
          if (newQuantity <= 0) {
            return null // Will be filtered out
          }
          if (newQuantity > item.maxStock) {
            return { ...item, quantity: item.maxStock }
          }
          return { ...item, quantity: newQuantity, subTotal: item.price * newQuantity }
        }
        return item
      })
      .filter(Boolean) as CartItem[]

    saveCart(updatedCart)
  }

  // Remove item
  const removeItem = (itemId: string, color: string | undefined, size: string | undefined) => {
    const updatedCart = cartItems.filter((item) => !(item.productId === itemId && item.color === color && item.size === size))
    saveCart(updatedCart)
  }

  // Load cart on component mount and listen for updates
  useEffect(() => {
    setCartItems(loadCart())

    const handleCartUpdate = () => {
      setCartItems(loadCart())
    }

    window.addEventListener("cartUpdated", handleCartUpdate)
    return () => window.removeEventListener("cartUpdated", handleCartUpdate)
  }, [])

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative hover:bg-transparent hover:text-white ${
            mobileView ? "text-white" : "hidden lg:inline-flex"
          }`}
          aria-label="Shopping cart"
        >
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 rounded-full"
              variant="destructive"
            >
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:w-96 flex flex-col p-0">
        <SheetHeader className="flex items-center justify-between border-b p-4">
          <SheetTitle>Your Cart ({totalItems})</SheetTitle>
          <SheetDescription className="sr-only">
            Shopping cart with {totalItems} items. Total: ৳{subtotal.toFixed(0)}
          </SheetDescription>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto py-2 px-4">
          {cartItems.length > 0 ? (
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div
                  key={`${item.productId}-${item.color || "no-color"}-${item.size || "no-size"}-${index}`}
                  className="flex items-start gap-4 py-4 border-b"
                >
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.productName}
                    className="h-16 w-16 object-cover rounded"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{item.productName}</h3>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>৳{item.price.toFixed(0)}</p>
                      {item.color && <p>Color: {item.color}</p>}
                      {item.size && <p>Size: {item.size}</p>}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity - 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-medium px-2">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity + 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                        disabled={item.quantity >= item.maxStock}
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium whitespace-nowrap">৳{(item.price * item.quantity).toFixed(0)}</p>
                    <button
                      onClick={() => removeItem(item.productId, item.color, item.size)}
                      className="text-red-500 hover:text-red-700 mt-1"
                      aria-label="Remove item"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 gap-4">
              <ShoppingCart className="h-12 w-12 text-gray-400" />
              <p className="text-gray-500">Your cart is empty</p>
              <SheetClose asChild>
                <Button className="w-full mt-4" asChild>
                  <Link to="/products">Continue Shopping</Link>
                </Button>
              </SheetClose>
            </div>
          )}
        </div>

        {/* Cart Summary */}
        {cartItems.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Subtotal:</span>
              <span className="font-bold">৳{subtotal.toFixed(0)}</span>
            </div>
            <SheetClose asChild>
              <Button className="w-full" asChild>
                <Link to="/checkout" state={{ cartItems, subtotal, from: "cart" }}>
                  Proceed to Checkout
                </Link>
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link to="/cart">View Full Cart</Link>
              </Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default CartSidebar