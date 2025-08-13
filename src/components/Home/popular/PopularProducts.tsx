import useDataHook from "../../../redux/hooks/useDataHook";
import { useGetProductsByCategoryQuery } from "../../../redux/features/product/productApi";
import ProductCard from "./ProductCard";
import { useState } from "react";

const PopularProducts = () => {
  const { allCategories, isCategoryLoading } = useDataHook();
  const [activeCategory, setActiveCategory] = useState<string>("");

  const { data: productsRes, isLoading: loadingProducts } =
    useGetProductsByCategoryQuery();
  const products = productsRes?.data || [];
  const filteredProducts = products?.find(
    (val) => val.category?._id === activeCategory
  );

  if (isCategoryLoading) {
    return <p className="text-center py-4">Loading categories...</p>;
  }

  if (!allCategories || allCategories.length === 0) {
    return <p className="text-center py-4">No categories found.</p>;
  }

  return (
    <div className="w-full bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 text-center sm:text-left">
          Popular Products
        </h2>

        {/* Category Tabs - scrollable on mobile */}
        <div className="flex space-x-4 sm:space-x-6 border-b border-gray-300 overflow-x-auto scrollbar-hide pb-2">
          {allCategories?.map((cat: any) => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              className={`pb-2 text-sm sm:text-base font-medium transition-colors relative whitespace-nowrap
                ${
                  activeCategory === cat._id
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }
              `}
            >
              {cat.categoryName}
              {activeCategory === cat._id && (
                <span className="absolute left-0 -bottom-[1px] w-full h-[2px] bg-blue-600 rounded"></span>
              )}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {loadingProducts ? (
            <p className="col-span-full text-center text-gray-500">Loading products...</p>
          ) : filteredProducts?.products?.length ? (
            filteredProducts?.products?.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              No products found for this category.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopularProducts;
