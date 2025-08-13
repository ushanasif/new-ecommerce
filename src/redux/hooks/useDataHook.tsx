import { useGetCategoriesQuery } from "../features/category/categoryApi";
import { useGetProductsQuery } from "../features/product/productApi";
import { useAppSelector } from "../hooks"


const useDataHook = () => {
    const {user} = useAppSelector((state) => state.auth);
    const {data: productRes, isLoading: isProductsLoading, error: isProductsError} = useGetProductsQuery(undefined);
    const {data: categoriesRes, isLoading: isCategoryLoading, error: isCategoryError} = useGetCategoriesQuery();

    const allProducts = productRes?.data.data || [];
    const allCategories = categoriesRes?.data || [];

  return {user, allProducts, isProductsLoading, isProductsError, allCategories, isCategoryLoading, isCategoryError}
}

export default useDataHook