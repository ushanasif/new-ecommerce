

import useDataHook from "../../../redux/hooks/useDataHook";
import ProductCard from "../popular/ProductCard";


const OfferProducts = () => {
  const { allProducts } = useDataHook();
  const offerProducts = allProducts.filter((val) => val.popularProducts);

  return (
   <div className="w-full bg-white py-10 px-6">
  <div className="max-w-6xl mx-auto">
    <h2 className="text-2xl font-semibold mb-6 text-gray-800">Offer Products</h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
      {offerProducts.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  </div>
</div>

  );
};

export default OfferProducts;
