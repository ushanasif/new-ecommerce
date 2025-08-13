import Banner from "../../components/Home/Banner/Banner";
import Categories from "../../components/Home/categories/Categories";
import OfferProducts from "../../components/Home/offer/OfferProducts";
import PopularProducts from "../../components/Home/popular/PopularProducts";

const Home = () => {
  return (
    <>
      <Categories />
      <Banner />
      <OfferProducts /> 
      <PopularProducts />
    </>
  );
};

export default Home;
