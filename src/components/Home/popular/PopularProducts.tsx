// import useDataHook from "../../../redux/hooks/useDataHook";
// import { useGetProductsQuery } from "../../../redux/features/product/productApi";
// import ProductCard from "./ProductCard";
// import { useEffect, useState } from "react";

// const PopularProducts = () => {
//   const { allCategories, isCategoryLoading } = useDataHook();
//   const [activeCategory, setActiveCategory] = useState<string>("");
  
//   const { data: productsRes, isLoading: loadingProducts } = useGetProductsQuery({page: 1, limit: 10, category: activeCategory});
//   const products = productsRes?.data?.data || [];

//   useEffect(() => {
//     if(allCategories && allCategories.length > 0){
//         setActiveCategory(allCategories[0]?._id)
//     }
//   }, [allCategories]);

//   if (isCategoryLoading) {
//     return <p className="text-center py-4">Loading categories...</p>;
//   }

//   if (!allCategories || allCategories.length === 0) {
//     return <p className="text-center py-4">No categories found.</p>;
//   }

//   return (
//     <div className="w-full bg-gray-50 py-4 md:py-6">
//       <div className="max-w-7xl mx-auto px-3 sm:px-4">
//         <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
//           Popular Products
//         </h2>

//         {/* Scrollable Category Tabs */}
//         <div className="overflow-x-auto pb-1 hide-scrollbar">
//           <div className="flex space-x-4 border-b border-gray-300 min-w-max">
//             {allCategories?.map((cat: any) => (
//               <button
//                 key={cat._id}
//                 onClick={() => setActiveCategory(cat._id)}
//                 className={`pb-2 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap
//                   ${
//                     activeCategory === cat._id
//                       ? "text-blue-600"
//                       : "text-gray-600 hover:text-blue-600"
//                   }
//                 `}
//               >
//                 {cat.categoryName}
//                 {activeCategory === cat._id && (
//                   <span className="absolute left-0 -bottom-[1px] w-full h-[2px] bg-blue-600 rounded"></span>
//                 )}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Responsive Products Grid */}
//         <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
//           {loadingProducts ? (
//             [...Array(4)].map((_, i) => (
//               <div key={i} className="bg-gray-200 border rounded-lg h-48 sm:h-56 animate-pulse" />
//             ))
//           ) : products?.length ? (
//             products?.map((product: any) => (
//               <ProductCard key={product._id} product={product} />
//             ))
//           ) : (
//             <div className="col-span-full text-center py-8">
//               <p className="text-gray-500">
//                 No products found for this category.
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PopularProducts;



const PopularProducts = () => {
  return (
    <div>PopularProducts</div>
  )
}

export default PopularProducts