// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client"

// import type React from "react"

// import { useState, useEffect } from "react"
// import { Heart } from "lucide-react"
// import { useNavigate } from "react-router-dom"
// import {
//   useAddToWishlistMutation,
//   useDeleteWishlistItemMutation,
//   useGetWishlistQuery,
// } from "../../../redux/features/wishlist/wishlistApi"
// import toast from "react-hot-toast"
// import { skipToken } from "@reduxjs/toolkit/query"
// import { useAppSelector } from "../../../redux/hooks"
// import { Button } from "../../../components/ui/button"

// interface WishlistButtonProps {
//   productId: string
//   className?: string
//   size?: "sm" | "md" | "lg"
//   showText?: boolean
// }

// export default function WishlistButton({
//   productId,
//   className = "",
//   size = "md",
//   showText = false,
// }: WishlistButtonProps) {
//   const navigate = useNavigate()
//   const { user } = useAppSelector((state) => state.auth)
//   const [isWishlisted, setIsWishlisted] = useState(false)
//   const [wishlistError, setWishlistError] = useState(false)

//   const {
//     data: wishListRes,
//     isSuccess: wishlistLoaded,
//     error: wishlistQueryError,
//   } = useGetWishlistQuery(user?._id ?? skipToken, {
//     skip: !user || wishlistError,
//     refetchOnMountOrArgChange: false,
//     refetchOnFocus: false,
//     refetchOnReconnect: false,
//   })

//   const [addToWishlist, { isLoading: isAdding }] = useAddToWishlistMutation()
//   const [deleteWishlistItem, { isLoading: isRemoving }] = useDeleteWishlistItemMutation()

//   const wishlist = wishListRes?.data || null

//   // Handle wishlist query errors
//   useEffect(() => {
//     if (wishlistQueryError) {
//       console.error("Wishlist query error:", wishlistQueryError)
//       const error = wishlistQueryError as any

//       if (error.status === "FETCH_ERROR" || error.status === 500) {
//         setWishlistError(true)
//       }
//     }
//   }, [wishlistQueryError])

//   // Check if product is in wishlist
//   useEffect(() => {
//     if (wishlistLoaded && wishlist && !wishlistError) {
//       try {
//         const isInWishlist = wishlist?.products?.some((wishlistProduct: any) => {
//           const productIdInWishlist = typeof wishlistProduct === "string" ? wishlistProduct : wishlistProduct._id
//           return productIdInWishlist === productId
//         })
//         setIsWishlisted(isInWishlist || false)
//       } catch (error) {
//         console.error("Error checking wishlist status:", error)
//         setIsWishlisted(false)
//       }
//     } else {
//       setIsWishlisted(false)
//     }
//   }, [wishlist, productId, wishlistLoaded, wishlistError])

//   const handleWishlistToggle = async (e: React.MouseEvent) => {
//     e.preventDefault()
//     e.stopPropagation()

//     if (!user) {
//       toast.error("Please login to manage your wishlist")
//       navigate("/login")
//       return
//     }

//     if (wishlistError) {
//       toast.error("Wishlist service is temporarily unavailable")
//       return
//     }

//     try {
//       if (isWishlisted) {
//         await deleteWishlistItem({
//           customerId: user._id,
//           productId,
//         }).unwrap()

//         setIsWishlisted(false)
//         toast.success("Removed from wishlist!")
//       } else {
//         await addToWishlist({
//           customerId: user._id,
//           productId,
//         }).unwrap()

//         setIsWishlisted(true)
//         toast.success("Added to wishlist!")
//       }
//     } catch (error: any) {
//       console.error("Wishlist error:", error)

//       let errorMessage = "Failed to update wishlist"

//       if (error?.status === "FETCH_ERROR") {
//         errorMessage = "Unable to connect to server"
//         setWishlistError(true)
//       } else if (error?.status === 500) {
//         errorMessage = "Server error. Please try again later."
//         setWishlistError(true)
//       } else if (error?.message?.includes("already exists")) {
//         setIsWishlisted(true)
//         toast("Item is already in your wishlist", { icon: "❤️" })
//         return
//       } else if (error?.status === 401) {
//         errorMessage = "Please login again"
//         navigate("/login")
//         return
//       }

//       toast.error(errorMessage)
//     }
//   }

//   const sizeClasses = {
//     sm: "h-8 w-8",
//     md: "h-10 w-10",
//     lg: "h-12 w-12",
//   }

//   const iconSizes = {
//     sm: "w-4 h-4",
//     md: "w-5 h-5",
//     lg: "w-6 h-6",
//   }

//   const isLoading = isAdding || isRemoving

//   if (showText) {
//     return (
//       <Button
//         onClick={handleWishlistToggle}
//         disabled={wishlistError || isLoading}
//         variant="outline"
//         className={`bg-transparent ${className}`}
//       >
//         <Heart
//           className={`${iconSizes[size]} mr-2 ${
//             isWishlisted ? "fill-red-500 text-red-500" : ""
//           } ${isLoading ? "animate-pulse" : ""}`}
//         />
//         {wishlistError ? "Unavailable" : isWishlisted ? "Wishlisted" : "Add to Wishlist"}
//       </Button>
//     )
//   }

//   return (
//     <button
//       onClick={handleWishlistToggle}
//       disabled={wishlistError || isLoading}
//       className={`${sizeClasses[size]} rounded-full bg-white shadow-sm hover:shadow-md transition-shadow flex items-center justify-center disabled:opacity-50 ${className}`}
//       title={wishlistError ? "Wishlist unavailable" : isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
//     >
//       <Heart
//         className={`${iconSizes[size]} ${
//           isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
//         } ${isLoading ? "animate-pulse" : ""}`}
//       />
//     </button>
//   )
// }
