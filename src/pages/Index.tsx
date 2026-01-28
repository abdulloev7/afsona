import { useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import BrandsPreview from "@/components/BrandsPreview";
import TintingPreview from "@/components/TintingPreview";
import ProductsPreview from "@/components/ProductsPreview";
import AboutPreview from "@/components/AboutPreview";
import ContactsPreview from "@/components/ContactsPreview";
import Footer from "@/components/Footer";

const Index = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="relative z-10 w-full">
      <Header />
      <main>
        <Hero />
        <div className="bg-background/95 backdrop-blur-sm">
          <FeaturedProducts />
          <BrandsPreview />
          <TintingPreview />
          <ProductsPreview />
          <AboutPreview />
          <ContactsPreview />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
