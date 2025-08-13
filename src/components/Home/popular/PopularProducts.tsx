
import useDataHook from "../../../redux/hooks/useDataHook";
import { useGetProductsQuery } from "../../../redux/features/product/productApi";
import ProductCard from "./ProductCard";
import { useEffect, useState } from "react";


const PopularProducts = () => {
  const { allCategories, isCategoryLoading } = useDataHook();
  const [activeCategory, setActiveCategory] = useState<string>("");
  
  const { data: productsRes, isLoading: loadingProducts } = useGetProductsQuery({category: activeCategory});
  const products = productsRes?.data?.data || [];
  

  useEffect(() => {
    if(allCategories){
        setActiveCategory(allCategories[0]?._id)
    }
  }, [allCategories]);


  if (isCategoryLoading) {
    return <p className="text-center">Loading categories...</p>;
  }

  if (!allCategories || allCategories.length === 0) {
    return <p className="text-center">No categories found.</p>;
  }

  return (
    <div className="w-full bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Popular Products
        </h2>

        {/* Category Tabs */}
        <div className="flex space-x-6 border-b border-gray-300">
          {allCategories?.map((cat: any) => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              className={`pb-2 text-sm font-medium transition-colors relative
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
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {loadingProducts ? (
            <p>Loading products...</p>
          ) : products?.length ? (
            products?.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))
          ) : (
            <p className="text-gray-500">
              No products found for this category.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopularProducts;
