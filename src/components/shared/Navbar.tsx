/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo, useMemo, useCallback } from "react";
import { useState, useEffect, useRef } from "react";
import {
  Search,
  Heart,
  User2Icon,
  ChevronDown,
  ChevronRight,
  X,
  Menu,
  LogOut,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger, SheetHeader } from "../ui/sheet";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import CartSidebar from "./CartSidebar";
import { useGetCategoriesQuery } from "../../redux/features/category/categoryApi";
import { useGetSubCategoriesQuery } from "../../redux/features/subcategory/subcategoryApi";
import { useGetSubSubCategoriesQuery } from "../../redux/features/subsubcategory/subsubcategoryApi";
import { useGetProductsQuery } from "../../redux/features/product/productApi";
import { skipToken } from "@reduxjs/toolkit/query";
import type { IProduct } from "../../redux/features/product/product.types";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import toast from "react-hot-toast";
import { logout } from "../../redux/features/auth/authSlice";
import { useLogoutUserMutation } from "../../redux/features/auth/authApi";

// Memoized constants to prevent recreating on each render
const NAV_LINKS = [
  { name: "Sign In", href: "/login", icon: User2Icon },
  { name: "Register", href: "/register", icon: User2Icon },
];

// Memoized ProductSuggestion component to prevent unnecessary re-renders
interface ProductSuggestionProps {
  product: IProduct;
  onSuggestionClick: (product: IProduct) => void;
}

const ProductSuggestion = memo(({ product, onSuggestionClick }: ProductSuggestionProps) => {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSuggestionClick(product);
  }, [product, onSuggestionClick]);

  return (
    <li
      className="flex items-center gap-3 px-4 py-3 text-popover-foreground hover:bg-accent cursor-pointer border-b border-border last:border-b-0 transition-colors"
      onMouseDown={handleClick}
    >
      <div className="flex-shrink-0">
        <img
          src={
            product.productImages?.[0] ||
            "/placeholder.svg?height=40&width=40"
          }
          alt={product.productName}
          className="w-10 h-10 object-cover rounded-md border border-border"
          loading="lazy"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = "/placeholder.svg?height=40&width=40";
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-popover-foreground truncate">
          {product.productName}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          ৳{product.productPrice?.toFixed(0) || "0"}
          {product.productDiscount && (
            <span className="ml-2 text-primary">
              {product.productDiscount}% off
            </span>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </li>
  );
});

ProductSuggestion.displayName = 'ProductSuggestion';

// Memoized SearchSuggestions component
interface SearchSuggestionsProps {
  showSuggestions: boolean;
  debouncedSearchQuery: string;
  isSearchLoading: boolean;
  suggestedProducts: IProduct[];
  onSuggestionClick: (product: IProduct) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  isMobile?: boolean;
}

const SearchSuggestions = memo(({
  showSuggestions,
  debouncedSearchQuery,
  isSearchLoading,
  suggestedProducts,
  onSuggestionClick,
  onSearchSubmit,
  isMobile = false
}: SearchSuggestionsProps) => {
  const handleSearchSubmit = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onSearchSubmit(e as unknown as React.FormEvent);
  }, [onSearchSubmit]);

  if (!showSuggestions || debouncedSearchQuery.trim().length === 0) return null;

  const containerClasses = isMobile 
    ? "absolute top-full left-4 right-4 bg-popover text-popover-foreground shadow-lg rounded-b-md z-50 border border-border"
    : "absolute top-full left-0 right-0 bg-popover text-popover-foreground shadow-lg rounded-b-md z-50 max-h-96 overflow-y-auto border border-border";

  return (
    <div className={containerClasses}>
      {isSearchLoading ? (
        <div className="p-4 text-center text-muted-foreground">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          <span className="mt-2 block">Searching...</span>
        </div>
      ) : suggestedProducts.length > 0 ? (
        <ul className={`py-2 ${isMobile ? 'max-h-60 overflow-y-auto' : ''}`}>
          {suggestedProducts.map((product) => (
            <ProductSuggestion 
              key={product._id}
              product={product}
              onSuggestionClick={onSuggestionClick}
            />
          ))}
        </ul>
      ) : (
        <div className="p-4 text-center text-muted-foreground">
          <div className="mb-2">No products found</div>
          <button
            onMouseDown={handleSearchSubmit}
            className="text-primary hover:underline font-medium"
          >
            Search for "{debouncedSearchQuery}"
          </button>
        </div>
      )}
    </div>
  );
});

SearchSuggestions.displayName = 'SearchSuggestions';

// Main Navbar Component
const Navbar = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<"categories" | "menu">("categories");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch data
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  
  // API calls with proper memoization
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: subCategoriesData } = useGetSubCategoriesQuery(
    selectedCategory || skipToken
  );
  const { data: subSubCategoriesData } = useGetSubSubCategoriesQuery(
    selectedSubCategory || skipToken
  );
  
  // Memoized data processing
  const categories = useMemo(() => categoriesData?.data || [], [categoriesData]);
  const subCategories = useMemo(() => subCategoriesData?.data || [], [subCategoriesData]);
  const subSubCategories = useMemo(() => subSubCategoriesData?.data || [], [subSubCategoriesData]);
  
  const [logoutUser] = useLogoutUserMutation();

  // Search products query with proper conditions
  const shouldFetchProducts = useMemo(() => 
    debouncedSearchQuery && debouncedSearchQuery.trim().length > 0,
    [debouncedSearchQuery]
  );

  const { data: searchProductsData, isLoading: isSearchLoading } = useGetProductsQuery(
    shouldFetchProducts
      ? { search: debouncedSearchQuery.trim(), limit: 5 }
      : skipToken
  );

  const suggestedProducts = useMemo(() => 
    searchProductsData?.data?.data || [], 
    [searchProductsData]
  );

  // Debounce search query with useCallback for optimization
  const updateDebouncedSearchQuery = useCallback((query: string) => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, []);

  useEffect(() => {
    const cleanup = updateDebouncedSearchQuery(searchQuery);
    return cleanup;
  }, [searchQuery, updateDebouncedSearchQuery]);

  // Memoized event handlers to prevent recreation on each render
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setShowSuggestions(false);
    }
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  // Close suggestions when location changes
  useEffect(() => {
    setShowSuggestions(false);
    setSearchQuery("");
    setDebouncedSearchQuery("");
  }, [location]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setShowSuggestions(value.trim().length > 0);
  }, []);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      setIsMobileMenuOpen(false);
      setSelectedCategory(null);
      setSelectedSubCategory(null);
      setActiveTab("categories");
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  }, [searchQuery, navigate]);

  const handleLogout = useCallback(async () => {
    dispatch(logout());
    await logoutUser();
    toast.success("Logged out successfully");
    localStorage.removeItem("cart");
    navigate("/login");
  }, [dispatch, logoutUser]);

  const handleSuggestionClick = useCallback((product: IProduct) => {
    setSearchQuery("");
    setShowSuggestions(false);
    setDebouncedSearchQuery("");
    setIsMobileMenuOpen(false);
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setActiveTab("categories");
    const productUrl = `/products/${product._id}`;
    console.log("Navigating to:", productUrl);
    window.location.href = productUrl;
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setActiveTab("categories");
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setShowSuggestions(false);
    setDebouncedSearchQuery("");
  }, []);

  const handleCategoryNavigation = useCallback((
    categoryId: string,
    subCategoryId?: string,
    subSubCategoryId?: string
  ) => {
    let url = "/products?";

    if (subSubCategoryId) {
      url += `category=${categoryId}&subCategory=${subCategoryId}&subSubCategory=${subSubCategoryId}`;
    } else if (subCategoryId) {
      url += `category=${categoryId}&subCategory=${subCategoryId}`;
    } else {
      url += `category=${categoryId}`;
    }

    closeMobileMenu();
    navigate(url);
  }, [navigate, closeMobileMenu]);

  const handleSubCategoryClick = useCallback((subCategory: any) => {
    setSelectedSubCategory(subCategory._id);
  }, []);

  // Effect for automatic navigation
  useEffect(() => {
    if (selectedSubCategory && subSubCategories.length === 0 && selectedCategory) {
      const timeoutId = setTimeout(() => {
        handleCategoryNavigation(selectedCategory, selectedSubCategory);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [selectedSubCategory, subSubCategories.length, selectedCategory, handleCategoryNavigation]);

  // Memoized category navigation components
  const categoryContent = useMemo(() => {
    if (!selectedCategory) {
      return categories.map((category) => (
        <div
          key={category._id}
          className="flex items-center justify-between p-2 hover:bg-primary-foreground/10 rounded cursor-pointer"
          onClick={() => setSelectedCategory(category._id)}
        >
          <span>{category.categoryName}</span>
          <ChevronRight className="h-4 w-4" />
        </div>
      ));
    }

    if (selectedCategory && !selectedSubCategory) {
      const selectedCategoryName = categories.find((c) => c._id === selectedCategory)?.categoryName;
      return (
        <>
          <div
            className="flex items-center p-2 hover:bg-primary-foreground/10 rounded cursor-pointer mb-2"
            onClick={() => setSelectedCategory(null)}
          >
            <ChevronDown className="h-4 w-4 rotate-90 mr-2" />
            <span>Back to Categories</span>
          </div>
          <div
            className="flex items-center p-2 hover:bg-primary-foreground/10 rounded cursor-pointer ml-4 border-b border-primary-foreground/20 mb-2"
            onClick={() => handleCategoryNavigation(selectedCategory)}
          >
            <span className="font-semibold">All {selectedCategoryName}</span>
          </div>
          {subCategories.map((subCategory) => (
            <div
              key={subCategory._id}
              className="flex items-center justify-between p-2 hover:bg-primary-foreground/10 rounded cursor-pointer ml-4"
              onClick={() => handleSubCategoryClick(subCategory)}
            >
              <span>{subCategory.subCategoryName}</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          ))}
        </>
      );
    }

    if (selectedSubCategory && subSubCategories.length > 0) {
      const selectedSubCategoryName = subCategories.find((c) => c._id === selectedSubCategory)?.subCategoryName;
      return (
        <>
          <div
            className="flex items-center p-2 hover:bg-primary-foreground/10 rounded cursor-pointer mb-2"
            onClick={() => setSelectedSubCategory(null)}
          >
            <ChevronDown className="h-4 w-4 rotate-90 mr-2" />
            <span>Back to Subcategories</span>
          </div>
          <div
            className="flex items-center p-2 hover:bg-primary-foreground/10 rounded cursor-pointer ml-8 border-b border-primary-foreground/20 mb-2"
            onClick={() => handleCategoryNavigation(selectedCategory!, selectedSubCategory)}
          >
            <span className="font-semibold">All {selectedSubCategoryName}</span>
          </div>
          {subSubCategories.map((subSubCategory) => (
            <div
              key={subSubCategory._id}
              className="flex items-center p-2 hover:bg-primary-foreground/10 rounded cursor-pointer ml-8"
              onClick={() =>
                handleCategoryNavigation(
                  selectedCategory!,
                  selectedSubCategory,
                  subSubCategory._id
                )
              }
            >
              {subSubCategory.subSubCategoryName}
            </div>
          ))}
        </>
      );
    }

    return null;
  }, [
    selectedCategory, selectedSubCategory, categories, subCategories, 
    subSubCategories, handleCategoryNavigation, handleSubCategoryClick
  ]);

  // Memoized menu content
  const menuContent = useMemo(() => (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-4">
        {!user ? (
          NAV_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.href}
                className="flex items-center gap-2 p-2 hover:bg-white/10 rounded"
                onClick={closeMobileMenu}
              >
                <Icon className="h-5 w-5" />
                {link.name}
              </Link>
            );
          })
        ) : (
          <>
            <Link
              to="/wishlist"
              className="flex items-center gap-2 p-2 hover:bg-white/10 rounded"
              onClick={closeMobileMenu}
            >
              <Heart className="h-5 w-5" />
              Wishlist
            </Link>
            <Link
              to="/user"
              className="flex items-center gap-2 p-2 hover:bg-white/10 rounded"
              onClick={closeMobileMenu}
            >
              <Heart className="h-5 w-5" />
              Dashboard
            </Link>
            <button
              className="flex items-center gap-2 p-2 hover:bg-white/10 rounded w-full text-left"
              onClick={() => {
                handleLogout();
                closeMobileMenu();
              }}
            >
              <LogOut />
              <span>Logout</span>
            </button>
          </>
        )}
      </div>
    </div>
  ), [user, closeMobileMenu, handleLogout]);

  return (
    <header className="w-full bg-primary text-primary-foreground sticky top-0 z-50">
      {/* Mobile Navbar */}
      <div className="flex items-center justify-between p-4 lg:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-transparent hover:text-primary-foreground"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="bg-primary text-primary-foreground p-0"
          >
            <SheetHeader className="flex flex-row border-b border-primary-foreground/20">
              <Button
                variant="ghost"
                className={`flex-1 rounded-none ${
                  activeTab === "categories" ? "bg-primary-foreground/10" : ""
                }`}
                onClick={() => setActiveTab("categories")}
              >
                Categories
              </Button>
              <Button
                variant="ghost"
                className={`flex-1 rounded-none ${
                  activeTab === "menu" ? "bg-primary-foreground/10" : ""
                }`}
                onClick={() => setActiveTab("menu")}
              >
                Menu
              </Button>
            </SheetHeader>
            <div className="p-4 h-full overflow-y-auto">
              {activeTab === "categories" ? (
                <div className="space-y-2">
                  {categoryContent}
                </div>
              ) : (
                menuContent
              )}
            </div>
          </SheetContent>
        </Sheet>
        <div className="text-xl font-bold text-primary-foreground">
          Ecommerce
        </div>
        <CartSidebar mobileView />
      </div>

      {/* Desktop Navbar */}
      <div className="hidden lg:flex items-center justify-between px-6 py-3 text-primary-foreground">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold">
          Ecommerce
        </Link>

        {/* Search Bar */}
        <div className="flex-grow max-w-xl mx-6 relative" ref={searchRef}>
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for products, categories, tags..."
                className="px-8 py-2 w-full text-sm bg-background text-foreground"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() =>
                  searchQuery.trim().length > 0 && setShowSuggestions(true)
                }
              />
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-primary" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>

          <SearchSuggestions
            showSuggestions={showSuggestions}
            debouncedSearchQuery={debouncedSearchQuery}
            isSearchLoading={isSearchLoading}
            suggestedProducts={suggestedProducts}
            onSuggestionClick={handleSuggestionClick}
            onSearchSubmit={handleSearchSubmit}
          />
        </div>

        {/* Auth Links */}
        <div className="flex gap-3 items-center">
          {!user &&
            NAV_LINKS.map((link, index) => {
              const Icon = link.icon;
              return (
                <React.Fragment key={link.name}>
                  <Link
                    to={link.href}
                    className="flex items-center gap-2 p-2 hover:underline"
                  >
                    <Icon className="h-5 w-5" />
                    {link.name}
                  </Link>
                  {index < NAV_LINKS.length - 2 && (
                    <span className="w-0.5 h-4 bg-primary-foreground"></span>
                  )}
                </React.Fragment>
              );
            })}
        </div>

        {user && (
          <div className="flex items-center">
            <Button onClick={handleLogout} className="text-lg text-white">
              <User2Icon /> Logout
            </Button>
            <Link to={"/user"} className="font-semibold">
              Dashboard
            </Link>
          </div>
        )}

        {/* Icons */}
        <div className="flex gap-6 items-center ml-4">
          {user && (
            <Link to="/wishlist">
              <Heart className="h-5 w-5 cursor-pointer hover:opacity-80" />
            </Link>
          )}
          <CartSidebar />
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="lg:hidden px-4 pb-4 relative" ref={searchRef}>
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <Input
              placeholder="Search for products..."
              className="pl-8 pr-8 py-2 text-sm bg-background text-foreground w-full"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() =>
                searchQuery.trim().length > 0 && setShowSuggestions(true)
              }
            />
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-primary" />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>

        <SearchSuggestions
          showSuggestions={showSuggestions}
          debouncedSearchQuery={debouncedSearchQuery}
          isSearchLoading={isSearchLoading}
          suggestedProducts={suggestedProducts}
          onSuggestionClick={handleSuggestionClick}
          onSearchSubmit={handleSearchSubmit}
          isMobile={true}
        />
      </div>
    </header>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;