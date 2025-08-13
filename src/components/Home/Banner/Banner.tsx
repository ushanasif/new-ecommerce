"use client"

import { useGetBannerQuery } from "../../../redux/features/banner/bannerApi"
import { useNavigate } from "react-router-dom"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination, Navigation } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"
import { Helmet } from "react-helmet-async"

// Extend the HTML attributes to include needed properties
declare module "react" {
  interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
    fetchPriority?: "high" | "low" | "auto"
  }

  interface LinkHTMLAttributes<T> extends HTMLAttributes<T> {
    imagesrcset?: string
    imagesizes?: string
    fetchpriority?: "high" | "low" | "auto"
  }
}

interface BannerItem {
  _id: string
  bannerImage: string
  bannerCategory: string | { categoryName: string }
  bannerOffer?: string | number
}

const Banner = () => {
  const { data: getBannerResponse } = useGetBannerQuery()
  const banner: BannerItem[] = getBannerResponse?.data || []
  const navigate = useNavigate()

  if (banner.length === 0) return null

  const handleBannerClick = (bannerItem: BannerItem) => {
    const categoryName = getCategoryName(bannerItem)
    const offer = bannerItem.bannerOffer

    const params = new URLSearchParams()

    if (categoryName) {
      params.append("category", categoryName)
    }

    if (offer) {
      params.append("discount", offer.toString())
    }

    const queryString = params.toString()
    navigate(`/products${queryString ? `?${queryString}` : ""}`)
  }

  const getCategoryName = (bannerItem: BannerItem): string | undefined => {
    if (typeof bannerItem.bannerCategory === "string") {
      return bannerItem.bannerCategory
    }
    return bannerItem.bannerCategory?.categoryName
  }

  const optimizeImage = (url: string, width: number, height: number, quality = "auto") => {
    if (!url.includes("res.cloudinary.com")) return url

    const parts = url.split("/upload/")
    if (parts.length < 2) return url

    const transformation = `w_${width},h_${height},c_fill,q_${quality},f_auto`
    return `${parts[0]}/upload/${transformation}/${parts[1]}`
  }

  // Get LCP image URL before rendering
  const lcpImageUrl = banner[0]?.bannerImage ? optimizeImage(banner[0].bannerImage, 1200, 400, "80") : null



  return (
    <>
      {/* Preload LCP image in head with higher priority */}
      {lcpImageUrl && (
        <Helmet>
          <link
            rel="preload"
            as="image"
            href={lcpImageUrl}
            imageSrcSet={`${lcpImageUrl} 1200w, ${optimizeImage(banner[0].bannerImage, 1600, 533, "80")} 1600w`}
            imageSizes="(max-width: 1200px) 100vw, 1200px"
            fetchPriority="high"
          />
        </Helmet>
      )}

      <div className="max-w-[1200px] mx-auto px-4">
        {/* Full Width Slider */}
        <div className="relative w-full aspect-[1200/400] rounded-md overflow-hidden">
          <Swiper
            spaceBetween={0}
            slidesPerView={1}
            loop={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              el: ".swiper-pagination",
              bulletClass: "swiper-pagination-bullet",
              bulletActiveClass: "swiper-pagination-bullet-active",
            }}
            modules={[Autoplay, Pagination, Navigation]}
            className="h-full w-full"
          >
            {banner?.map((item, idx) => {
              const optimizedSrc = optimizeImage(item.bannerImage, 1200, 400, idx === 0 ? "80" : "auto")
              const optimizedSrc2x = optimizeImage(item.bannerImage, 1600, 533, idx === 0 ? "80" : "auto")

              return (
                <SwiperSlide key={item._id || idx}>
                  <div className="w-full h-full cursor-pointer" onClick={() => handleBannerClick(item)}>
                    <div className="relative w-full h-full">
                      {/* Skeleton loader */}
                      <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-md" />
                      <img
                        src={optimizedSrc || "/placeholder.svg"}
                        srcSet={`${optimizedSrc} 1200w, ${optimizedSrc2x} 1600w`}
                        alt={`Banner ${idx + 1} - ${getCategoryName(item) || "Product"} ${item.bannerOffer ? `${item.bannerOffer}% off` : ""}`}
                        className="absolute inset-0 w-full h-full object-cover rounded-md"
                        loading={idx === 0 ? "eager" : "lazy"}
                        width="1200"
                        height="400"
                        decoding={idx === 0 ? "sync" : "async"}
                        fetchPriority={idx === 0 ? "high" : "low"}
                        sizes="(max-width: 1200px) 100vw, 1200px"
                      />

                      {/* Optional: Display offer badge on banner */}
                      {item.bannerOffer && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          {item.bannerOffer}% OFF
                        </div>
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              )
            })}
          </Swiper>
          <div className="absolute bottom-4 z-50 flex w-full items-center justify-center gap-1 swiper-pagination"></div>
        </div>
      </div>

      <style>{`
                .swiper-pagination-bullet {
                    background: white;
                    width: 8px;
                    height: 8px;
                    opacity: 0.5;
                    margin: 0 4px;
                    transition: all 0.3s ease;
                }
                .swiper-pagination-bullet-active {
                    background: white;
                    opacity: 1;
                    width: 12px;
                    height: 12px;
                }
            `}</style>
    </>
  )
}

export default Banner
