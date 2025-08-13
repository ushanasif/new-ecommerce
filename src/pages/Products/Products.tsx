/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react"
import { Heart, Filter, X } from "lucide-react"
import { skipToken } from "@reduxjs/toolkit/query"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useGetCategoriesQuery } from "../../redux/features/category/categoryApi"
import { useGetSubCategoriesQuery } from "../../redux/features/subcategory/subcategoryApi"
import { useGetSubSubCategoriesQuery } from "../../redux/features/subsubcategory/subsubcategoryApi"
import { useGetProductsQuery } from "../../redux/features/product/productApi"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../../components/ui/sheet"
import CategoryBar from "../../components/CategoryBar/CategoryBar"
import { Card, CardContent } from "../../components/ui/card"
import ProductPagination from "../../components/ProductPagination/ProductPagination"
import { Slider } from "../../components/ui/slider"

// Helper function to optimize Cloudinary images with responsive sizing
const getOptimizedImageUrl = (originalUrl: string, width: number, height: number) => {
  if (!originalUrl || !originalUrl.includes('cloudinary.com')) {
    return originalUrl
  }
  
  // Extract the part after '/upload/'
  const uploadIndex = originalUrl.indexOf('/upload/')
  if (uploadIndex === -1) return originalUrl
  
  const beforeUpload = originalUrl.substring(0, uploadIndex + 8)
  const afterUpload = originalUrl.substring(uploadIndex + 8)
  
  // Add Cloudinary transformations for maximum optimization
  const transformations = `w_${width},h_${height},c_fill,f_auto,q_auto:low,dpr_1.0`
  
  return `${beforeUpload}${transformations}/${afterUpload}`
}

// Helper function to get responsive image sizes based on screen size
const getResponsiveImageSizes = () => {
  if (typeof window !== 'undefined') {
    const screenWidth = window.innerWidth
    // Mobile: 160x120, Tablet: 200x150, Desktop: 250x188
    if (screenWidth < 768) return { width: 160, height: 120 }
    if (screenWidth < 1024) return { width: 200, height: 150 }
    return { width: 250, height: 188 }
  }
  // Default to mobile size for SSR
  return { width: 160, height: 120 }
}

export default function Products() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedSubCategory, setSelectedSubCategory] = useState("")
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState("")
  const [selectedDiscount, setSelectedDiscount] = useState("")
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [imageSize, setImageSize] = useState({ width: 160, height: 120 })

  // Update image size on screen resize
  useEffect(() => {
    const updateImageSize = () => {
      setImageSize(getResponsiveImageSizes())
    }
    
    updateImageSize()
    window.addEventListener('resize', updateImageSize)
    return () => window.removeEventListener('resize', updateImageSize)
  }, [])

  const { data: categoriesRes } = useGetCategoriesQuery()
  const categories = categoriesRes?.data || []

  // Handle URL parameters on component mount and when searchParams change
  useEffect(() => {
    const categoryParam = searchParams.get("category")
    const subCategoryParam = searchParams.get("subCategory")
    const subSubCategoryParam = searchParams.get("subSubCategory")
    const discountParam = searchParams.get("discount")
    // const searchParam = searchParams.get("search")

    // Handle category from URL (could be ID or name from old system)
    if (categoryParam && categories.length > 0) {
      // First try to find by ID (new system)
      let foundCategory = categories.find(cat => cat._id === categoryParam)
      
      // If not found by ID, try to find by name (old system compatibility)
      if (!foundCategory) {
        foundCategory = categories.find(
          (cat) =>
            (typeof cat.categoryName === "string" && cat.categoryName === categoryParam) ||
            (typeof cat === "object" && cat.categoryName === categoryParam),
        )
      }
      
      if (foundCategory) {
        setSelectedCategory(foundCategory._id)
      }
    } else if (!categoryParam) {
      // Clear category if not in URL
      setSelectedCategory("")
    }

    // Handle subcategory from URL
    if (subCategoryParam) {
      setSelectedSubCategory(subCategoryParam)
    } else if (!subCategoryParam) {
      setSelectedSubCategory("")
    }

    // Handle sub-subcategory from URL
    if (subSubCategoryParam) {
      setSelectedSubSubCategory(subSubCategoryParam)
    } else if (!subSubCategoryParam) {
      setSelectedSubSubCategory("")
    }

    // Handle discount from URL
    if (discountParam) {
      setSelectedDiscount(discountParam)
    } else if (!discountParam) {
      setSelectedDiscount("")
    }

    // Reset page when URL params change
    setPage(1)
  }, [searchParams, categories])

  const { data: subCategoriesRes } = useGetSubCategoriesQuery(selectedCategory || skipToken)
  const subCategories = subCategoriesRes?.data || []

  const { data: subSubCategoriesRes } = useGetSubSubCategoriesQuery(selectedSubCategory || skipToken)
  const subSubCategories = subSubCategoriesRes?.data || []

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value)
    // Don't clear the input fields, instead sync them with slider values
    setMinPrice(value[0].toString())
    setMaxPrice(value[1].toString())
    setPage(1)
  }

  const handleMinPriceChange = (value: string) => {
    setMinPrice(value)
    // Update slider when input changes
    const numValue = Number(value) || 0
    if (numValue >= 0 && numValue <= 10000) {
      setPriceRange([numValue, Math.max(numValue, priceRange[1])])
    }
    setPage(1)
  }

  const handleMaxPriceChange = (value: string) => {
    setMaxPrice(value)
    // Update slider when input changes
    const numValue = Number(value) || 10000
    if (numValue >= 0 && numValue <= 10000) {
      setPriceRange([Math.min(priceRange[0], numValue), numValue])
    }
    setPage(1)
  }

  // Build query parameters - include search from URL and other filters
  const searchQuery = searchParams.get("search") || ""
  
  const queryParams = {
    page,
    limit: 10,
    ...(searchQuery && { search: searchQuery }),
    ...(selectedCategory && { category: selectedCategory }),
    ...(selectedSubCategory && { subCategory: selectedSubCategory }),
    ...(selectedSubSubCategory && { subSubCategory: selectedSubSubCategory }),
    ...(minPrice && Number(minPrice) > 0 && { minPrice: Number(minPrice) }),
    ...(maxPrice && Number(maxPrice) < 10000 && { maxPrice: Number(maxPrice) }),
    ...(selectedDiscount && { discount: Number(selectedDiscount) }),
  }

  const { data: productsResponse, isLoading, error } = useGetProductsQuery(queryParams)

  const products = productsResponse?.data?.data || []
  console.log(products);
  const pagination = {
    page: productsResponse?.data?.page || 1,
    pages: productsResponse?.data?.pages || 1,
    total: productsResponse?.data?.total || 0,
    count: productsResponse?.data?.count || 0,
  }

  const clearFilters = () => {
    setSelectedCategory("")
    setSelectedSubCategory("")
    setSelectedSubSubCategory("")
    setSelectedDiscount("")
    setPriceRange([0, 10000])
    setMinPrice("")
    setMaxPrice("")
    setPage(1)
    
    // Clear URL parameters except search
    const newSearchParams = new URLSearchParams()
    if (searchQuery) {
      newSearchParams.set("search", searchQuery)
    }
    navigate(`/products?${newSearchParams.toString()}`)
  }

  // Count active filters
  const activeFiltersCount = [
    selectedCategory,
    selectedSubCategory,
    selectedSubSubCategory,
    selectedDiscount,
    minPrice,
    maxPrice,
    priceRange[0] > 0 || priceRange[1] < 10000 ? "priceRange" : null,
  ].filter(Boolean).length

  const FilterContent = () => (
    <div className="flex flex-col gap-4">
      {/* Active Filters Display */}
      {(activeFiltersCount > 0 || searchQuery) && (
        <div className="w-full p-3 border rounded bg-blue-50 shadow-sm">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">
            Active Filters ({activeFiltersCount + (searchQuery ? 1 : 0)}):
          </h3>
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                Search: "{searchQuery}"
              </span>
            )}
            {selectedCategory && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                Category: {categories.find((c) => c._id === selectedCategory)?.categoryName}
              </span>
            )}
            {selectedSubCategory && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                Sub: {subCategories.find((c) => c._id === selectedSubCategory)?.subCategoryName}
              </span>
            )}
            {selectedSubSubCategory && (
              <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                Sub-Sub: {subSubCategories.find((c) => c._id === selectedSubSubCategory)?.subSubCategoryName}
              </span>
            )}
            {selectedDiscount && (
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                Discount: {selectedDiscount}% OFF
              </span>
            )}
            {(minPrice || maxPrice || priceRange[0] > 0 || priceRange[1] < 10000) && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                Price: ৳{minPrice || priceRange[0]} - ৳{maxPrice || priceRange[1]}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Price Filter */}
      <div className="w-full p-4 border rounded bg-white shadow-sm">
        <h2 className="text-lg font-semibold border-b pb-1 mb-3">Price Range</h2>
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-gray-600 mb-2 block">
              Range: Tk {minPrice || priceRange[0]} - Tk {maxPrice || priceRange[1]}
            </Label>
            <Slider
              value={priceRange}
              onValueChange={handlePriceRangeChange}
              max={10000}
              min={0}
              step={50}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="minPrice" className="text-sm text-gray-600">
                Min Price
              </Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => handleMinPriceChange(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="maxPrice" className="text-sm text-gray-600">
                Max Price
              </Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => handleMaxPriceChange(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="w-full p-4 border rounded bg-white shadow-sm">
        <h2 className="text-lg font-semibold border-b pb-1 mb-3">Categories</h2>
        <ul className="space-y-2 max-h-80 overflow-y-auto pr-2">
          {categories.map((category, idx) => (
            <li
              onClick={() => {
                setSelectedCategory(category._id)
                setSelectedSubCategory("") // Reset subcategory when category changes
                setSelectedSubSubCategory("") // Reset sub-subcategory when category changes
                setPage(1)
              }}
              key={idx}
              className={`cursor-pointer hover:text-blue-600 p-2 rounded transition-colors ${
                category._id === selectedCategory ? "font-bold bg-blue-50 text-blue-600" : ""
              }`}
            >
              {category.categoryName}
            </li>
          ))}
        </ul>
      </div>

      {/* Subcategories */}
      {selectedCategory && subCategories.length > 0 && (
        <div className="w-full p-4 border rounded bg-white shadow-sm">
          <h2 className="text-lg font-semibold border-b pb-1 mb-3">Sub Categories</h2>
          <ul className="space-y-2 max-h-80 overflow-y-auto pr-2">
            {subCategories.map((sub, idx) => (
              <li
                onClick={() => {
                  setSelectedSubCategory(sub._id)
                  setSelectedSubSubCategory("") // Reset sub-subcategory when subcategory changes
                  setPage(1)
                }}
                key={idx}
                className={`cursor-pointer hover:text-blue-600 p-2 rounded transition-colors ${
                  sub._id === selectedSubCategory ? "font-bold bg-blue-50 text-blue-600" : ""
                }`}
              >
                {sub.subCategoryName}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sub-Subcategories */}
      {selectedSubCategory && subSubCategories.length > 0 && (
        <div className="w-full p-4 border rounded bg-white shadow-sm">
          <h2 className="text-lg font-semibold border-b pb-1 mb-3">Sub Sub-Categories</h2>
          <ul className="space-y-2 max-h-80 overflow-y-auto pr-2">
            {subSubCategories.map((sub, idx) => (
              <li
                onClick={() => {
                  setSelectedSubSubCategory(sub._id)
                  setPage(1)
                }}
                key={idx}
                className={`cursor-pointer hover:text-blue-600 p-2 rounded transition-colors ${
                  sub._id === selectedSubSubCategory ? "font-bold bg-blue-50 text-blue-600" : ""
                }`}
              >
                {sub.subSubCategoryName}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Clear Filters Button */}
      {activeFiltersCount > 0 && (
        <Button onClick={clearFilters} variant="outline" className="w-full bg-transparent">
          <X className="w-4 h-4 mr-2" />
          Clear All Filters ({activeFiltersCount})
        </Button>
      )}
    </div>
  )

  // Error handling
  if (error) {
    console.error("Products API Error:", error)
    return (
      <div className="w-full bg-gray-50">
        <CategoryBar
          setSelectedCategory={setSelectedCategory}
          setPage={setPage}
          setSelectedSubCategory={setSelectedSubCategory}
        />
        <div className="w-full px-5 py-20">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-500 mb-4">Error loading products</p>
              <p className="text-sm text-gray-600 mb-4">{(error as any)?.data?.message || "Unknown error occurred"}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-gray-50">
      <CategoryBar
        setSelectedCategory={setSelectedCategory}
        setPage={setPage}
        setSelectedSubCategory={setSelectedSubCategory}
      />
      <div className="w-full px-5 py-20 md:flex md:gap-6">
        {/* Desktop Sidebar */}
        <div className="hidden md:block basis-[25%] py-4">
          <FilterContent />
        </div>

        {/* Mobile Filter Button */}
        <div className="md:hidden mb-4">
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full bg-transparent">
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {(activeFiltersCount > 0 || searchQuery) && (
                  <span className="ml-2 bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs">
                    {activeFiltersCount + (searchQuery ? 1 : 0)}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main Product Grid */}
        <div className="md:basis-[70%] px-3 py-2">
          {/* Results Info */}
          <div className="mb-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                Showing {products.length} of {pagination.total} products
                {searchQuery && ` for "${searchQuery}"`}
                {selectedDiscount && ` with ${selectedDiscount}% discount`}
              </p>
              {(activeFiltersCount > 0 || searchQuery) && (
                <p className="text-xs text-blue-600 mt-1">
                  {activeFiltersCount + (searchQuery ? 1 : 0)} filter{(activeFiltersCount + (searchQuery ? 1 : 0)) > 1 ? "s" : ""} applied
                </p>
              )}
            </div>
            {/* Debug info - remove in production */}
            <div className="text-xs text-gray-400">Page {page} | Limit: 10</div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500 text-lg mb-2">No products found</p>
                {(activeFiltersCount > 0 || searchQuery) ? (
                  <div>
                    <p className="text-sm text-gray-400 mb-4">
                      {searchQuery 
                        ? `No products found for "${searchQuery}". Try removing some filters or searching for different terms.`
                        : "Try removing some filters to see more products"
                      }
                    </p>
                    <Button onClick={clearFilters} variant="outline">
                      Clear all filters
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No products available at the moment</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((val) => (
                <div
                  key={val._id}
                  className="bg-white shadow-xs border border-gray-200 overflow-hidden duration-300 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/products/${val._id}`)}
                >
                  {/* Image Container with Fixed Dimensions */}
                  <div className="relative w-full aspect-[4/3] bg-gray-100">
                    <img
                      src={getOptimizedImageUrl(val.productImages[0], imageSize.width, imageSize.height) || "/placeholder.svg"}
                      alt={val.productName}
                      className="w-full h-full object-cover"
                      width={imageSize.width}
                      height={imageSize.height}
                      loading="lazy"
                      sizes="(max-width: 480px) 160px, (max-width: 768px) 180px, (max-width: 1024px) 200px, 250px"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />
                    {/* Discount badge */}
                    {val.productDiscount && (
                      <div className="absolute top-2 left-2">
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-bold text-white ${
                            selectedDiscount && val.productDiscount.toString() === selectedDiscount
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        >
                          {val.productDiscount}% OFF
                        </div>
                      </div>
                    )}
                    {/* Wishlist button */}
                    <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Content with Fixed Height */}
                  <div className="p-4 min-h-[140px] flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-800 mb-1 line-clamp-2 min-h-[40px]">{val.productName}</h3>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center bg-green-600 text-white px-2 py-1 rounded text-xs">
                            <span className="font-semibold">{val.productRating.toFixed(1)}</span>
                            <span className="ml-1">★</span>
                          </div>
                          <span className="text-xs text-gray-500">({val.reviews.length})</span>
                        </div>
                        <div className="text-xs text-gray-500">{val.sales} Sold</div>
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">Tk {val.productPrice.toFixed(0)}</span>
                      {val.productOriginalPrice && (
                        <span className="text-sm text-gray-500 line-through">Tk {val.productOriginalPrice}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <ProductPagination
              paginationPage={pagination.page}
              paginationPages={pagination.pages}
              page={page}
              setPage={setPage}
            />
          )}
        </div>
      </div>
    </div>
  )
}