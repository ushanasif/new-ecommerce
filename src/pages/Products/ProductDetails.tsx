import type React from "react";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Heart,
  Star,
  Minus,
  Plus,
  ShoppingCart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Play,
  Truck,
  Shield,
  RotateCcw,
  Copy,
  Facebook,
  Twitter,
  MessageCircle,
  X,
  ZoomIn,
  CreditCard,
} from "lucide-react";
import {
  useGetProductByIdQuery,
  useGetProductsQuery,
} from "../../redux/features/product/productApi";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import type {
  IProduct,
  IReview,
  IFAQ,
} from "../../redux/features/product/product.types";
import toast from "react-hot-toast";
import {
  useAddToWishlistMutation,
  useDeleteWishlistItemMutation,
  useGetWishlistQuery,
} from "../../redux/features/wishlist/wishlistApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { useAppSelector } from "../../redux/hooks";

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

// Color name to hex mapping
const colorMap: Record<string, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#10b981",
  yellow: "#f59e0b",
  purple: "#8b5cf6",
  pink: "#ec4899",
  black: "#000000",
  white: "#ffffff",
  gray: "#6b7280",
  grey: "#6b7280",
  orange: "#f97316",
  brown: "#92400e",
  navy: "#1e3a8a",
  maroon: "#7f1d1d",
  gold: "#d97706",
  silver: "#9ca3af",
  beige: "#f5f5dc",
  cream: "#fffdd0",
  khaki: "#f0e68c",
  olive: "#808000",
};

// Optimized image URL generator with better compression
const optimizeCloudinaryUrl = (
  url: string,
  width?: number,
  height?: number,
  quality = "auto"
) => {
  if (!url || !url.includes("cloudinary.com")) return url;

  const transformations = [];
  if (width && height) {
    transformations.push(`w_${width},h_${height},c_fill`);
  } else if (width) {
    transformations.push(`w_${width}`);
  }

  // More aggressive optimization for better performance
  transformations.push(
    `q_${quality}`,
    "f_auto",
    "dpr_auto",
    "c_fill",
    "g_auto" // Smart cropping
  );

  const baseUrl = url.split("/upload/")[0];
  const imagePath = url.split("/upload/")[1];

  return `${baseUrl}/upload/${transformations.join(",")}/${imagePath}`;
};

// Generate multiple image sizes for responsive loading
const generateImageSrcSet = (url: string, baseWidth: number) => {
  if (!url || !url.includes("cloudinary.com")) return "";

  const sizes = [baseWidth, baseWidth * 2]; // 1x and 2x versions
  return sizes
    .map((size) => `${optimizeCloudinaryUrl(url, size, size)} ${size}w`)
    .join(", ");
};

// Function to get color hex from name or return the original if it's already a hex
const getColorHex = (color: string): string => {
  const lowerColor = color.toLowerCase().trim();

  // If it's already a hex color, return it
  if (lowerColor.startsWith("#")) {
    return lowerColor;
  }

  // If it's a known color name, return its hex
  if (colorMap[lowerColor]) {
    return colorMap[lowerColor];
  }

  // If it's an RGB color, return it as is
  if (lowerColor.startsWith("rgb")) {
    return lowerColor;
  }

  // Default to a neutral color if not found
  return "#6b7280";
};

// Function to get video embed URL
const getVideoEmbedUrl = (url: string): string => {
  if (!url) return "";

  // YouTube
  const youtubeRegex =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Vimeo
  const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // If it's already an embed URL or direct video file, return as is
  if (
    url.includes("embed") ||
    url.includes(".mp4") ||
    url.includes(".webm") ||
    url.includes(".ogg")
  ) {
    return url;
  }

  // Default return original URL
  return url;
};

// Cart utility functions
const getCartFromStorage = (): CartItem[] => {
  try {
    const cart = localStorage.getItem("cart");
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error("Error reading cart from localStorage:", error);
    return [];
  }
};

const saveCartToStorage = (cart: CartItem[]) => {
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("cartUpdated"));
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
};

// High-performance Image Component with advanced optimizations
const OptimizedImage: React.FC<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  priority?: boolean;
}> = ({
  src,
  alt,
  width,
  height,
  className,
  style,
  onClick,
  priority = false,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const optimizedSrc = useMemo(
    () => optimizeCloudinaryUrl(src, width, height, priority ? "85" : "auto"),
    [src, width, height, priority]
  );

  const srcSet = useMemo(
    () => generateImageSrcSet(src, width || 500),
    [src, width]
  );

  const sizes = useMemo(() => {
    if (width) return `${width}px`;
    return "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 500px";
  }, [width]);

  // Intersection Observer for lazy loading optimization
  useEffect(() => {
    if (!priority && imgRef.current && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = optimizedSrc;
            if (srcSet) img.srcset = srcSet;
            observer.unobserve(img);
          }
        },
        { rootMargin: "50px" }
      );

      observer.observe(imgRef.current);
      return () => observer.disconnect();
    }
  }, [optimizedSrc, srcSet, priority]);

  return (
    <div className={`relative overflow-hidden ${className}`} onClick={onClick}>
      {/* Ultra-low quality placeholder for immediate display */}
      {!loaded && !error && (
        <img
          src={optimizeCloudinaryUrl(
            src,
            Math.floor((width || 400) / 8),
            Math.floor((height || 400) / 8),
            "20"
          )}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-105 transition-all duration-300"
          loading="eager"
          decoding="sync"
        />
      )}

      {/* Main optimized image */}
      <img
        ref={imgRef}
        src={priority ? optimizedSrc : undefined}
        srcSet={priority ? srcSet : undefined}
        sizes={sizes}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        style={style}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
      />

      {/* Loading skeleton with reduced animation */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin opacity-50" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded" />
            <p className="text-xs">Failed to load</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const {
    data: productResponse,
    isLoading,
    error,
  } = useGetProductByIdQuery(id || "");
  const product: IProduct | undefined = productResponse?.data;

  console.log(product);

  // Memoize product category ID
  const categoryId = useMemo(() => {
    if (!product) return undefined;
    return typeof product.productCategory === "string"
      ? product.productCategory
      : product.productCategory._id;
  }, [product]);

  // Fetch related products from the same category
  const { data: relatedProductsResponse } = useGetProductsQuery(
    categoryId
      ? {
          category: categoryId,
          limit: 8,
        }
      : undefined
  );

  const relatedProducts = useMemo(
    () =>
      relatedProductsResponse?.data?.data?.filter(
        (p) => p._id !== product?._id
      ) || [],
    [relatedProductsResponse, product]
  );

  const [addToWishlist] = useAddToWishlistMutation();
  const [deleteWishlistItem] = useDeleteWishlistItemMutation();
  const { data: wishListRes, isSuccess: wishlistLoaded } = useGetWishlistQuery(
    user?._id ?? skipToken
  );

  const wishlist = wishListRes?.data || null;

  // Memoize calculated values
  const discountedPrice = useMemo(() => {
    if (!product) return 0;
    if (product.productDiscount) {
      return product.productOriginalPrice * (1 - product.productDiscount / 100);
    }
    return product.productPrice;
  }, [product]);

  const videoEmbedUrl = useMemo(
    () => (product?.video ? getVideoEmbedUrl(product.video) : ""),
    [product?.video]
  );

  useEffect(() => {
    if (product) {
      // Set default selections only if options exist and have values
      if (
        product.productColors &&
        Array.isArray(product.productColors) &&
        product.productColors.length > 0
      ) {
        setSelectedColor(product.productColors[0]);
      } else {
        setSelectedColor(""); // Reset if no colors
      }

      if (
        product.productSizes &&
        Array.isArray(product.productSizes) &&
        product.productSizes.length > 0
      ) {
        setSelectedSize(product.productSizes[0]);
      } else {
        setSelectedSize(""); // Reset if no sizes
      }
    }
  }, [product]);

  useEffect(() => {
    if (wishlistLoaded && product && wishlist) {
      const isInWishlist = wishlist?.products?.some(
        (wishlistProduct: any) => wishlistProduct._id === product._id
      );
      setIsWishlisted(isInWishlist || false);
    } else {
      setIsWishlisted(false);
    }
  }, [wishlist, product, wishlistLoaded]);

  const handleWishlistToggle = useCallback(async () => {
    if (!user || !product) {
      toast.error("Please login to manage your wishlist");
      navigate("/login");
      return;
    }

    try {
      if (isWishlisted) {
        await deleteWishlistItem({
          customerId: user._id,
          productId: product._id,
        }).unwrap();

        setIsWishlisted(false);
        toast.success("Removed from wishlist!");
      } else {
        await addToWishlist({
          customerId: user._id,
          productId: product._id,
        }).unwrap();

        setIsWishlisted(true);
        toast.success("Added to wishlist!");
      }
    } catch (error: any) {
      console.error("Wishlist error details:", error.message);
      toast.error("Failed to update wishlist");
    }
  }, [
    user,
    product,
    isWishlisted,
    deleteWishlistItem,
    addToWishlist,
    navigate,
  ]);

  const handleQuantityChange = useCallback(
    (change: number) => {
      const newQuantity = quantity + change;
      if (
        newQuantity >= 1 &&
        newQuantity <= (product?.remainingProducts || 1)
      ) {
        setQuantity(newQuantity);
      }
    },
    [quantity, product?.remainingProducts]
  );

  const handleAddToCart = useCallback(async () => {
    if (!product) return;

    if(!user?._id){
      navigate("/login", { state: { from: location.pathname } });
      toast.error("Please Login to buy");
      return;
    }

    const ownerId =
      typeof product.OwnerId === "object" && product.OwnerId !== null
        ? product.OwnerId._id
        : product.OwnerId;

    const ownerName =
      typeof product.OwnerId === "object" && product.OwnerId !== null
        ? product.OwnerId.name
        : "Unknown Seller";
    // Create cart item
    const cartItem: CartItem = {
      productId: product._id,
      productName: product.productName,
      productCategory:
        typeof product.productCategory === "object" &&
        product.productCategory?.categoryName
          ? product.productCategory.categoryName
          : "Unknown Category",
      price: discountedPrice,
      quantity,
      subTotal: product.productPrice * quantity,
      maxStock: product.remainingProducts,
      image: product.productImages[0] || "/placeholder.svg",
      ...(selectedColor &&
        product.productColors?.length > 0 && { color: selectedColor }),
      ...(selectedSize &&
        product.productSizes?.length > 0 && { size: selectedSize }),
      OwnerId: ownerId,
      OwnerName: ownerName,
    };

    // Get existing cart
    const existingCart = getCartFromStorage();

    // Check if item already exists (considering color and size)
    const existingItemIndex = existingCart.findIndex(
      (item) =>
        item.productId === cartItem.productId &&
        item.color === cartItem.color &&
        item.size === cartItem.size
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      const newQuantity = existingCart[existingItemIndex].quantity + quantity;
      if (newQuantity <= product.remainingProducts) {
        existingCart[existingItemIndex].quantity = newQuantity;
        saveCartToStorage(existingCart);
        toast.success("Cart updated!");
      } else {
        toast.error(
          `Only ${product.remainingProducts} items available in stock`
        );
      }
    } else {
      // Add new item to cart
      existingCart.push(cartItem);
      saveCartToStorage(existingCart);
      toast.success("Added to cart!");
    }
  }, [product, discountedPrice, quantity, selectedColor, selectedSize]);

  const handleBuyNow = useCallback(() => {
    if (!product) return;


    if(!user?._id){
      navigate("/login", { state: { from: location.pathname} });
      toast.error("Please Login to buy");
      return;
    }

    const cartItems: CartItem[] = [];

    const ownerId =
      typeof product.OwnerId === "object" && product.OwnerId !== null
        ? product.OwnerId._id
        : product.OwnerId;

    const ownerName =
      typeof product.OwnerId === "object" && product.OwnerId !== null
        ? product.OwnerId.name
        : "Unknown Seller";

    // Create cart item
    const cartItem: CartItem = {
      productId: product._id,
      productName: product.productName,
      productCategory:
        typeof product.productCategory === "object" &&
        product.productCategory?.categoryName
          ? product.productCategory.categoryName
          : "Unknown Category",
      price: discountedPrice,
      quantity,
      subTotal: product.productPrice * quantity,
      maxStock: product.remainingProducts,
      image: product.productImages[0] || "/placeholder.svg",
      ...(selectedColor &&
        product.productColors?.length > 0 && { color: selectedColor }),
      ...(selectedSize &&
        product.productSizes?.length > 0 && { size: selectedSize }),
      OwnerId: ownerId,
      OwnerName: ownerName,
    };
    const subtotal = cartItem.price * quantity;
    cartItems.push(cartItem);

    setTimeout(() => {
      navigate("/checkout", {
        state: { cartItems, subtotal, from: "buy now" },
      });
    }, 500);
  }, [
    product,
    discountedPrice,
    quantity,
    selectedColor,
    selectedSize,
    location,
    navigate,
  ]);

  // Share functionality
  const handleShare = useCallback(
    async (platform?: string) => {
      const url = window.location.href;
      const title = product?.productName || "Check out this product";
      const text = `${title} - Only ৳${discountedPrice.toFixed(0)}`;

      if (platform === "copy") {
        try {
          await navigator.clipboard.writeText(url);
          toast.success("Link copied to clipboard!");
          setShowShareModal(false);
        } catch (err: any) {
          toast.error("Failed to copy link");
        }
      } else if (platform === "facebook") {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
          )}`,
          "_blank"
        );
      } else if (platform === "twitter") {
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            url
          )}&text=${encodeURIComponent(text)}`,
          "_blank"
        );
      } else if (platform === "whatsapp") {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
          "_blank"
        );
      } else if (navigator.share) {
        try {
          await navigator.share({
            title,
            text,
            url,
          });
        } catch (err: any) {
          console.log("Share cancelled");
        }
      } else {
        setShowShareModal(true);
      }
    },
    [product?.productName, discountedPrice]
  );

  // Image zoom functionality
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsZooming(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsZooming(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-500 mb-4">Product not found</p>
            <Button onClick={() => navigate("/products")}>
              Back to Products
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Critical Resource Hints */}
      {product.productImages[0] && (
        <>
          <link
            rel="preload"
            as="image"
            href={optimizeCloudinaryUrl(
              product.productImages[0],
              500,
              500,
              "85"
            )}
            fetchPriority="high"
          />
          <link rel="preconnect" href="https://res.cloudinary.com" />
          <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        </>
      )}

      {/* Above-the-fold content optimization */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .aspect-square { aspect-ratio: 1; }
          .animate-spin { animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `,
        }}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button
              onClick={() => navigate("/")}
              className="hover:text-blue-600"
            >
              Home
            </button>
            <span>/</span>
            <button
              onClick={() => navigate("/products")}
              className="hover:text-blue-600"
            >
              Products
            </button>
            <span>/</span>
            <span className="text-gray-900">{product.productName}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
              {showVideo && videoEmbedUrl ? (
                <div className="w-full h-full">
                  {videoEmbedUrl.includes("youtube.com") ||
                  videoEmbedUrl.includes("vimeo.com") ? (
                    <iframe
                      src={videoEmbedUrl}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={videoEmbedUrl}
                      controls
                      className="w-full h-full object-cover"
                      onEnded={() => setShowVideo(false)}
                    />
                  )}
                </div>
              ) : (
                <div
                  ref={imageRef}
                  className="relative w-full h-full cursor-zoom-in group"
                  onMouseMove={handleMouseMove}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => setShowImageModal(true)}
                >
                  <OptimizedImage
                    src={
                      product.productImages[selectedImageIndex] ||
                      "/placeholder.svg?height=500&width=500"
                    }
                    alt={product.productName}
                    width={500}
                    height={500}
                    priority={true}
                    className={`w-full h-full transition-transform duration-200 ${
                      isZooming ? "scale-150" : "scale-100"
                    }`}
                    style={
                      isZooming
                        ? {
                            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                          }
                        : {}
                    }
                  />
                  {/* Zoom indicator */}
                  <div className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-4 h-4" />
                  </div>
                </div>
              )}

              {/* Navigation Arrows */}
              {product.productImages.length > 1 && !showVideo && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImageIndex((prev) =>
                        prev === 0 ? product.productImages.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImageIndex((prev) =>
                        prev === product.productImages.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Video Play Button */}
              {videoEmbedUrl && !showVideo && (
                <button
                  onClick={() => setShowVideo(true)}
                  className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/80 text-white rounded-full p-3"
                >
                  <Play className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Thumbnail Images */}
            <div className="flex space-x-2 overflow-x-auto">
              {product.productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedImageIndex(index);
                    setShowVideo(false);
                  }}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === index && !showVideo
                      ? "border-blue-600"
                      : "border-gray-200"
                  }`}
                >
                  <OptimizedImage
                    src={image || "/placeholder.svg?height=80&width=80"}
                    alt={`${product.productName} ${index + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.productName}
              </h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.productRating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.productRating.toFixed(1)} ({product.reviews.length}{" "}
                    reviews)
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {product.sales} sold
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-gray-900">
                  ৳{discountedPrice.toFixed(0)}
                </span>
                {product.productDiscount && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ৳{product.productOriginalPrice.toFixed(0)}
                    </span>
                    <Badge className="bg-red-500 text-white">
                      {product.productDiscount}% OFF
                    </Badge>
                    {product.quantity && (
                      <p className="text-sm text-gray-600">
                        {product.quantity}
                      </p>
                    )}
                  </>
                )}
              </div>
              {product.productDiscount && (
                <p className="text-sm text-green-600">
                  You save ৳
                  {(product.productOriginalPrice - discountedPrice).toFixed(0)}
                </p>
              )}
            </div>

            {/* Colors - Only show if colors exist and have values */}
            {product.productColors &&
              Array.isArray(product.productColors) &&
              product.productColors.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Color
                  </h3>
                  <div className="flex space-x-3">
                    {product.productColors.map((color) => {
                      const colorHex = getColorHex(color);
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`relative w-10 h-10 rounded-full border-2 ${
                            selectedColor === color
                              ? "border-blue-600 ring-2 ring-blue-200"
                              : "border-gray-300"
                          }`}
                          style={{ backgroundColor: colorHex }}
                          title={color}
                        >
                          {/* White border for light colors */}
                          {(colorHex === "#ffffff" ||
                            colorHex === "#fffdd0" ||
                            colorHex === "#f5f5dc") && (
                            <div className="absolute inset-1 rounded-full border border-gray-200"></div>
                          )}
                          {/* Checkmark for selected color */}
                          {selectedColor === color && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  colorHex === "#ffffff" ||
                                  colorHex === "#fffdd0" ||
                                  colorHex === "#f5f5dc"
                                    ? "bg-gray-800"
                                    : "bg-white"
                                }`}
                              ></div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Sizes - Only show if sizes exist and have values */}
            {product.productSizes &&
              Array.isArray(product.productSizes) &&
              product.productSizes.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Size
                  </h3>
                  <div className="flex space-x-2">
                    {product.productSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border rounded-md text-sm font-medium ${
                          selectedSize === size
                            ? "border-blue-600 bg-blue-50 text-blue-600"
                            : "border-gray-300 text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            {/* Quantity */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Quantity
              </h3>
              <div className="flex items-center space-x-3">
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 border-x">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.remainingProducts}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  {product.remainingProducts} available
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleAddToCart}
                  variant="outline"
                  className="py-3 bg-transparent"
                  disabled={product.remainingProducts === 0}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  onClick={handleBuyNow}
                  className="bg-orange-600 hover:bg-orange-700 text-white py-3"
                  disabled={product.remainingProducts === 0}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Buy Now
                </Button>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleWishlistToggle}
                  className="flex-1 bg-transparent"
                >
                  <Heart
                    className={`w-5 h-5 mr-2 ${
                      isWishlisted ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                  Wishlist
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShare()}
                  className="flex-1 bg-transparent"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <Truck className="w-6 h-6 text-blue-600" />
                  <span className="text-xs text-gray-600">Free Delivery</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <Shield className="w-6 h-6 text-blue-600" />
                  <span className="text-xs text-gray-600">Secure Payment</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <RotateCcw className="w-6 h-6 text-blue-600" />
                  <span className="text-xs text-gray-600">Easy Returns</span>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Sold by
              </h3>
              <p className="text-sm text-gray-600">
                {typeof product.OwnerId === "object" && product.OwnerId !== null
                  ? product.OwnerId.name
                  : "Unknown Seller"}
              </p>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="reviews">
                Reviews ({product.reviews.length})
              </TabsTrigger>
              <TabsTrigger value="faq">FAQ ({product.faqs.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {product.productDescription}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {product.productDetails.map((detail, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700">{detail}</p>
                      </div>
                    ))}
                  </div>

                  {product.searchTags.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {product.searchTags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {product.reviews.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No reviews yet
                      </p>
                    ) : (
                      product.reviews.map((review: IReview, index) => (
                        <div
                          key={index}
                          className="border-b pb-6 last:border-b-0"
                        >
                          <div className="flex items-start space-x-4">
                            <OptimizedImage
                              src={
                                typeof review.userId !== "string"
                                  ? review.userId.profileImg
                                  : "/placeholder.svg?height=40&width=40"
                              }
                              alt={
                                typeof review.userId !== "string"
                                  ? review.userId.name
                                  : "User"
                              }
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900">
                                  {typeof review.userId === "object"
                                    ? review.userId.name
                                    : "User"}
                                </h4>
                                <span className="text-sm text-gray-500">
                                  {new Date(review.date).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.stars
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-gray-700">{review.text}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="faq" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {product.faqs.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No FAQs available
                      </p>
                    ) : (
                      product.faqs.map((faq: IFAQ, index) => (
                        <div
                          key={index}
                          className="border-b pb-6 last:border-b-0"
                        >
                          <h4 className="font-medium text-gray-900 mb-2">
                            {faq.question}
                          </h4>
                          <p className="text-gray-700">{faq.answer}</p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products - Lazy load only visible ones */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Related Products
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 8).map((relatedProduct, index) => (
                <div
                  key={relatedProduct._id}
                  className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/products/${relatedProduct._id}`)}
                >
                  <div className="relative aspect-square">
                    <OptimizedImage
                      src={
                        relatedProduct.productImages[0] ||
                        "/placeholder.svg?height=200&width=200"
                      }
                      alt={relatedProduct.productName}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                      priority={index < 2} // Only prioritize first 2 related products
                    />
                    {relatedProduct.productDiscount && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-red-500 text-white text-xs">
                          {relatedProduct.productDiscount}% OFF
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">
                      {relatedProduct.productName}
                    </h3>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600">
                          {relatedProduct.productRating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {relatedProduct.sales} sold
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">
                        ৳{relatedProduct.productPrice.toFixed(0)}
                      </span>
                      {relatedProduct.productOriginalPrice &&
                        relatedProduct.productDiscount && (
                          <span className="text-sm text-gray-500 line-through">
                            ৳{relatedProduct.productOriginalPrice.toFixed(0)}
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share this product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleShare("copy")}
                className="flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Link</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare("facebook")}
                className="flex items-center space-x-2 text-blue-600"
              >
                <Facebook className="w-4 h-4" />
                <span>Facebook</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare("twitter")}
                className="flex items-center space-x-2 text-blue-400"
              >
                <Twitter className="w-4 h-4" />
                <span>Twitter</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare("whatsapp")}
                className="flex items-center space-x-2 text-green-600"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <div className="relative">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
            >
              <X className="w-5 h-5" />
            </button>
            <OptimizedImage
              src={
                product.productImages[selectedImageIndex] ||
                "/placeholder.svg?height=800&width=800"
              }
              alt={product.productName}
              width={800}
              height={800}
              className="w-full h-auto max-h-[85vh] object-contain"
            />
            {product.productImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {product.productImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-3 h-3 rounded-full ${
                      selectedImageIndex === index ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
