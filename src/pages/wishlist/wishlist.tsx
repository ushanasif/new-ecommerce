/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Heart, ShoppingCart, X, Star, Trash2, Share2, RefreshCw } from "lucide-react"
import { useGetWishlistQuery, useDeleteWishlistItemMutation } from "../../redux/features/wishlist/wishlistApi"
import { useAppSelector } from "../../redux/hooks"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import toast from "react-hot-toast"
import { skipToken } from "@reduxjs/toolkit/query"
import { Skeleton } from "../../components/ui/skeleton"

// Cart item interface
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

// Cart utility functions
const getCartFromStorage = (): CartItem[] => {
  try {
    const cart = localStorage.getItem("cart")
    return cart ? JSON.parse(cart) : []
  } catch (error) {
    console.error("Error reading cart from localStorage:", error)
    return []
  }
}

const saveCartToStorage = (cart: CartItem[]) => {
  try {
    localStorage.setItem("cart", JSON.stringify(cart))
    window.dispatchEvent(new CustomEvent("cartUpdated"))
  } catch (error) {
    console.error("Error saving cart to localStorage:", error)
  }
}

 
export default function Wishlist() {
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      toast.error("Please login to view your wishlist")
      navigate("/login")
    }
  }, [user, navigate])

  const {
    data: wishlistResponse,
    isLoading,
    error,
    refetch,
    isFetching
  } = useGetWishlistQuery(user?._id ?? skipToken)

  const [deleteWishlistItem, { isLoading: isDeleting }] = useDeleteWishlistItemMutation()

  // Debug logging
  useEffect(() => {
    console.log("Wishlist Response:", wishlistResponse)
    console.log("User ID:", user?._id)
    console.log("Is Loading:", isLoading)
    console.log("Error:", error)
  }, [wishlistResponse, user, isLoading, error])

  const wishlist = wishlistResponse?.data
  const wishlistItems = wishlist?.products || []

  // Handle item removal
  const handleRemoveItem = async (productId: string) => {
    if (!user?._id) {
      toast.error("User not found")
      return
    }

    try {
      await deleteWishlistItem({
        customerId: user._id,
        productId,
      }).unwrap()

      toast.success("Item removed from wishlist!")
      setSelectedItems((prev) => prev.filter((id) => id !== productId))
      
      // Refetch wishlist data
      refetch()
    } catch (error: any) {
      console.error("Remove wishlist error:", error)
      const errorMessage = error?.data?.message || error?.message || "Failed to remove item"
      toast.error(errorMessage)
    }
  }

  // Handle bulk removal
  const handleRemoveSelected = async () => {
    if (!user?._id || selectedItems.length === 0) return

    try {
      const promises = selectedItems.map((productId) =>
        deleteWishlistItem({
          customerId: user._id,
          productId,
        }).unwrap(),
      )

      await Promise.all(promises)
      toast.success(`${selectedItems.length} items removed from wishlist!`)
      setSelectedItems([])
      refetch()
    } catch (error: any) {
      console.error("Bulk remove error:", error)
      toast.error("Failed to remove some items")
    }
  }

  // Handle add to cart
  const handleAddToCart = (product: any) => {
    if (!product) {
      toast.error("Product data not available")
      return
    }

     const ownerId =
      typeof product.OwnerId === "object" && product.OwnerId !== null
        ? product.OwnerId._id
        : product.OwnerId;

    const ownerName =
      typeof product.OwnerId === "object" && product.OwnerId !== null
        ? product.OwnerId.name
        : "Unknown Seller";

    const cartItem: CartItem = {
      productId: product._id,
      productName: product.productName,
      productCategory:  typeof product.productCategory === "object" &&
        product.productCategory?.categoryName
          ? product.productCategory.categoryName
          : "Unknown Category",
      price: product.productDiscount
        ? product.productOriginalPrice * (1 - product.productDiscount / 100)
        : product.productPrice || product.productOriginalPrice,
      quantity: 1,
      subTotal: product.productPrice * 1,
      image: product.productImages?.[0] || "/placeholder.svg",
      maxStock: product.remainingProducts || 1,
      OwnerId: ownerId,
      OwnerName: ownerName
    }

    const existingCart = getCartFromStorage()
    const existingItemIndex = existingCart.findIndex((item) => item.productId === cartItem.productId)

    if (existingItemIndex > -1) {
      const newQuantity = existingCart[existingItemIndex].quantity + 1
      if (newQuantity <= cartItem.maxStock) {
        existingCart[existingItemIndex].quantity = newQuantity
        saveCartToStorage(existingCart)
        toast.success("Cart updated!")
      } else {
        toast.error(`Only ${cartItem.maxStock} items available in stock`)
      }
    } else {
      existingCart.push(cartItem)
      saveCartToStorage(existingCart)
      toast.success("Added to cart!")
    }
  }

  // Handle move to cart (add to cart and remove from wishlist)
  const handleMoveToCart = async (product: any) => {
    handleAddToCart(product)
    await handleRemoveItem(product._id)
  }

  // Handle item selection
  const handleSelectItem = (productId: string) => {
    setSelectedItems((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.length === wishlistItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(wishlistItems.map((item: any) => item._id))
    }
  }

  // Handle share
  const handleShare = async (product: any) => {
    const url = `${window.location.origin}/products/${product._id}`
    const title = product.productName
    const text = `Check out this product: ${title}`

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
      } catch (err) {
        console.log("Share cancelled")
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        toast.success("Product link copied to clipboard!")
      } catch (err) {
        toast.error("Failed to copy link")
      }
    }
  }

  // Manual refresh function
  const handleRefresh = () => {
    refetch()
    toast.success("Wishlist refreshed!")
  }

  // Loading state
  if (isLoading || isFetching) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    const errorMessage = (error as any)?.data?.message || (error as any)?.message || "Failed to load wishlist"
    const isConnectionError = (error as any)?.status === "FETCH_ERROR" || (error as any)?.name === "FetchError"

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {isConnectionError ? "Connection Error" : "Wishlist Unavailable"}
            </h2>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <div className="space-y-3">
              <Button onClick={handleRefresh} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={() => navigate("/products")} className="w-full bg-transparent">
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Empty wishlist state
  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
              <p className="text-gray-600">Save items you love for later</p>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm" className="bg-transparent">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Empty state */}
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-6">Start adding items you love to your wishlist</p>
              <Button onClick={() => navigate("/products")} className="w-full">
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
            <p className="text-gray-600">{wishlistItems.length} items saved</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm" className="bg-transparent">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Bulk actions */}
        {wishlistItems.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedItems.length === wishlistItems.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Select all ({selectedItems.length}/{wishlistItems.length})
                </span>
              </label>
            </div>

            {selectedItems.length > 0 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveSelected}
                  disabled={isDeleting}
                  className="bg-transparent"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Selected ({selectedItems.length})
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((product: any) => {
            if (!product || !product._id) {
              return null // Skip invalid products
            }

            const discountedPrice = product.productDiscount
              ? product.productOriginalPrice * (1 - product.productDiscount / 100)
              : product.productPrice || product.productOriginalPrice

            return (
              <Card key={product._id} className="group hover:shadow-lg transition-shadow duration-200">
                <div className="relative">
                  {/* Selection checkbox */}
                  <div className="absolute top-3 left-3 z-10">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(product._id)}
                      onChange={() => handleSelectItem(product._id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white shadow-sm"
                    />
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemoveItem(product._id)}
                    disabled={isDeleting}
                    className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4 text-gray-600 hover:text-red-600" />
                  </button>

                  {/* Product Image */}
                  <div
                    className="relative aspect-square cursor-pointer"
                    onClick={() => navigate(`/products/${product._id}`)}
                  >
                    <img
                      src={product.productImages?.[0] || "/placeholder.svg?height=300&width=300"}
                      alt={product.productName || "Product"}
                      className="w-full h-full object-cover rounded-t-lg"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=300&width=300"
                      }}
                    />

                    {/* Discount badge */}
                    {product.productDiscount && (
                      <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-red-500 text-white text-xs">{product.productDiscount}% OFF</Badge>
                      </div>
                    )}

                    {/* Stock status */}
                    {product.remainingProducts === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-lg">
                        <span className="text-white font-semibold">Out of Stock</span>
                      </div>
                    )}
                  </div>
                </div>

                <CardContent className="p-4">
                  {/* Product Info */}
                  <div className="mb-4">
                    <h3
                      className="font-medium text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600"
                      onClick={() => navigate(`/products/${product._id}`)}
                    >
                      {product.productName || "Unnamed Product"}
                    </h3>

                    {/* Rating and Reviews */}
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{product.productRating?.toFixed(1) || "0.0"}</span>
                      </div>
                      <span className="text-sm text-gray-500">({product.reviews?.length || 0} reviews)</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-lg font-bold text-gray-900">৳{discountedPrice?.toFixed(0) || "0"}</span>
                      {product.productDiscount && product.productOriginalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ৳{product.productOriginalPrice?.toFixed(0)}
                        </span>
                      )}
                    </div>

                    {/* Stock info */}
                    <div className="text-sm text-gray-600 mb-3">
                      {(product.remainingProducts || 0) > 0 ? (
                        <span className="text-green-600">{product.remainingProducts} in stock</span>
                      ) : (
                        <span className="text-red-600">Out of stock</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.remainingProducts || product.remainingProducts === 0}
                        variant="outline"
                        size="sm"
                        className="bg-transparent"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Add to Cart
                      </Button>
                      <Button
                        onClick={() => handleMoveToCart(product)}
                        disabled={!product.remainingProducts || product.remainingProducts === 0}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Move to Cart
                      </Button>
                    </div>

                    <Button
                      onClick={() => handleShare(product)}
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Continue Shopping */}
        <div className="mt-12 text-center">
          <Button onClick={() => navigate("/products")} variant="outline" className="bg-transparent">
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  )
}