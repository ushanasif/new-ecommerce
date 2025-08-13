
import { useState } from "react"
import { ChevronDown, List } from "lucide-react"
import { skipToken } from "@reduxjs/toolkit/query"
import { useGetCategoriesQuery } from "../../redux/features/category/categoryApi"
import { useGetSubCategoriesQuery } from "../../redux/features/subcategory/subcategoryApi"

interface CategoryBarProps {
  setSelectedCategory: (categoryId: string) => void
  setPage: (pageNumber: number) => void
  setSelectedSubCategory: (subCategoryId: string) => void
}

export default function CategoryBar({ setSelectedCategory, setPage, setSelectedSubCategory }: CategoryBarProps) {
  const [hovered, setHovered] = useState(false)
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null)

  const { data: categoriesRes } = useGetCategoriesQuery()
  const { data: subCategoriesRes } = useGetSubCategoriesQuery(hoveredCategoryId ?? skipToken)

  const categories = categoriesRes?.data || []
  const subCategories = subCategoriesRes?.data || [] // Ensure subCategories is an array

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setPage(1)
    setHovered(false) // Close dropdown after selection
  }

  const handleSubCategoryClick = (subCategoryId: string) => {
    setSelectedSubCategory(subCategoryId)
    setPage(1)
    setHovered(false)
    
  }

  return (
    <div
      className="hidden lg:block relative text-left px-6"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false)
        setHoveredCategoryId(null)
      }}
    >
      {/* Toggle Button */}
      <button className="flex items-center gap-2 px-4 py-2 bg-white text-black border rounded-md shadow-sm text-sm font-semibold hover:bg-gray-100 transition-colors duration-200">
        <List className="w-4 h-4" />
        <span>BROWSE CATEGORIES</span>
        <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${hovered ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {hovered && (
        <div className="absolute left-6 top-full w-64 bg-white border border-gray-200 rounded-md shadow-xl z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="py-2">
            {categories.map((category) => (
              <div
                key={category._id}
                className="relative group"
                onMouseEnter={() => setHoveredCategoryId(category._id)}
                onMouseLeave={() => setHoveredCategoryId(null)}
              >
                <div
                  className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 text-sm text-gray-800 cursor-pointer transition-colors duration-150"
                  onClick={() => handleCategoryClick(category._id)}
                >
                  <div className="flex gap-3 items-center">
                    <img
                      src={category.categoryImage || "/placeholder.svg"}
                      alt={category.categoryName}
                      className="w-5 h-5 rounded object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />
                    <span className="font-medium">{category.categoryName}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 transform -rotate-90 text-gray-400" />
                </div>

                {/* Subcategories Flyout */}
                {hoveredCategoryId === category._id && subCategories.length > 0 && (
                  <div className="absolute left-full top-0 w-64 bg-white border border-gray-200 rounded-md shadow-xl z-50 animate-in slide-in-from-left-2 duration-200">
                    <div className="py-2">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b">
                        {category.categoryName} Subcategories
                      </div>
                      {subCategories.map((sub) => (
                        <div
                          key={sub._id}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-800 cursor-pointer transition-colors duration-150"
                          onClick={() => handleSubCategoryClick(sub._id)}
                        >
                          <img
                            src={sub.subCategoryImage || "/placeholder.svg"}
                            alt={sub.subCategoryName}
                            className="w-4 h-4 rounded object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg"
                            }}
                          />
                          <span>{sub.subCategoryName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
