import { memo } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { IProduct } from "../../../redux/features/product/product.types";

const ProductCard = ({ product }: { product: IProduct }) => {
  const navigate = useNavigate();

  const getOptimizedImageUrl = (originalUrl: string, width: number, height: number) => {
    if (!originalUrl || !originalUrl.includes("cloudinary.com")) return originalUrl;
    const uploadIndex = originalUrl.indexOf("/upload/");
    if (uploadIndex === -1) return originalUrl;

    const beforeUpload = originalUrl.substring(0, uploadIndex + 8);
    const afterUpload = originalUrl.substring(uploadIndex + 8);
    const transformations = `w_${width},h_${height},c_fill,f_auto,q_auto:low,dpr_auto`;

    return `${beforeUpload}${transformations}/${afterUpload}`;
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
      onClick={() => navigate(`/products/${product._id}`)}
    >
      {/* Image Section */}
      <div className="relative w-full aspect-[4/3] bg-gray-100">
        <img
          src={getOptimizedImageUrl(product.productImages[0], 250, 200) || "/placeholder.svg"}
          alt={product.productName}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
        {/* Discount Badge */}
        {product.productDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {product.productDiscount}% OFF
          </div>
        )}
        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Handle wishlist toggle here
          }}
          className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
        >
          <Heart className="w-4 h-4 text-gray-700" />
        </button>
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col justify-between min-h-[140px]">
        {/* Name */}
        <h3 className="text-sm font-medium text-gray-800 mb-1 line-clamp-2">
          {product?.productName}
        </h3>

        {/* Rating & Sales */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <div className="flex items-center space-x-2">
            <span className="flex items-center bg-green-600 text-white px-2 py-0.5 rounded">
              {product?.productRating?.toFixed(1)} ★
            </span>
            <span>({product?.reviews?.length})</span>
          </div>
          <span>{product?.sales} Sold</span>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-gray-900">
            Tk {product?.productPrice?.toFixed(0)}
          </span>
          {product.productOriginalPrice && (
            <span className="text-sm text-gray-500 line-through">
              Tk {product?.productOriginalPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(ProductCard);
