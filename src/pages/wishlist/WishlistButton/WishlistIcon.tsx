// "use client"

// import { Heart } from "lucide-react"
// import { useNavigate } from "react-router-dom"
// import { skipToken } from "@reduxjs/toolkit/query"
// import { useAppSelector } from "../../../redux/hooks"
// import { useGetWishlistQuery } from "../../../redux/features/wishlist/wishlistApi"
// import { Button } from "../../../components/ui/button"
// import { Badge } from "../../../components/ui/badge"

// interface WishlistIconProps {
//   mobileView?: boolean
//   className?: string
// }

// export default function WishlistIcon({ mobileView = false, className = "" }: WishlistIconProps) {
//   const navigate = useNavigate()
//   const { user } = useAppSelector((state) => state.auth)

//   const { data: wishListRes, error: wishlistError } = useGetWishlistQuery(user?._id ?? skipToken, {
//     skip: !user,
//     refetchOnMountOrArgChange: false,
//     refetchOnFocus: false,
//     refetchOnReconnect: false,
//   })

//   const wishlist = wishListRes?.data || null
//   const wishlistCount = wishlist?.products?.length || 0

//   const handleWishlistClick = () => {
//     if (!user) {
//       navigate("/login")
//       return
//     }
//     navigate("/wishlist")
//   }

//   return (
//     <Button
//       variant="ghost"
//       size="icon"
//       onClick={handleWishlistClick}
//       className={`relative hover:bg-transparent hover:text-white ${
//         mobileView ? "text-white" : "hidden lg:inline-flex"
//       } ${className}`}
//       aria-label="Wishlist"
//     >
//       <Heart className="h-5 w-5" />
//       {user && wishlistCount > 0 && !wishlistError && (
//         <Badge
//           className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 rounded-full"
//           variant="destructive"
//         >
//           {wishlistCount > 99 ? "99+" : wishlistCount}
//         </Badge>
//       )}
//     </Button>
//   )
// }
