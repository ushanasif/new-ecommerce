/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGetCategoriesQuery } from "../../../redux/features/category/categoryApi"
import { Helmet } from "react-helmet-async"
import { useNavigate } from "react-router-dom"
import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode } from "swiper/modules"
import "swiper/css"
import "swiper/css/free-mode"

// Optimize image URLs with Cloudinary transformations
const optimizeImage = (url: string, width: number, height: number, quality = "auto") => {
  if (!url.includes("res.cloudinary.com")) return url

  const parts = url.split("/upload/")
  if (parts.length < 2) return url

  return `${parts[0]}/upload/w_${width},h_${height},q_${quality},f_auto/${parts[1]}`
}

const Categories = () => {
  const navigate = useNavigate()
  const { data: categoriesProductResponse } = useGetCategoriesQuery()
  const categories = categoriesProductResponse?.data || []

  // Preload first few category images
  const preloadImages = categories.slice(0, 5).map((category) => optimizeImage(category.categoryImage, 96, 96))

  const handleCategoryClick = (category: any) => {
    // Navigate to products page with category filter
    navigate(`/products?category=${encodeURIComponent(category.categoryName)}`)
  }

  return (
    <>
      {/* Preload important category images */}
      <Helmet>
        {preloadImages.map((imageUrl, index) => (
          <link key={index} rel="preload" as="image" href={imageUrl} />
        ))}
      </Helmet>
      <div className="w-full bg-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Swiper slidesPerView="auto" spaceBetween={16} freeMode={true} modules={[FreeMode]} className="!pb-4">
            {categories.map((category) => {
              const optimizedSrc = optimizeImage(category.categoryImage, 96, 96)
              return (
                <SwiperSlide key={category._id} className="!w-auto">
                  <div
                    className="flex flex-col items-center justify-center p-4 cursor-pointer transition-all duration-300 ease-in-out hover:bg-gray-50 rounded-lg group"
                    onClick={() => handleCategoryClick(category)}
                  >
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center hover:shadow-xl transition-shadow duration-300 group-hover:shadow-lg">
                      <img
                        src={optimizedSrc || "/placeholder.svg"}
                        alt={category.categoryName}
                        className="w-full h-full rounded-full object-cover transition-transform group-hover:scale-110 duration-300"
                        loading="lazy"
                        width="96"
                        height="96"
                        decoding="async"
                      />
                    </div>
                    <h3 className="mt-3 text-xs font-semibold text-gray-800 text-center leading-tight uppercase tracking-wide group-hover:text-blue-600 transition-colors duration-300">
                      {category.categoryName}
                    </h3>
                  </div>
                </SwiperSlide>
              )
            })}
          </Swiper>
        </div>
      </div>
    </>
  )
}

export default Categories
