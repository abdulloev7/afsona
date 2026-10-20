import { useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import StoreIntro from "@/components/StoreIntro";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import BrandsPreview from "@/components/BrandsPreview";
import TintingPreview from "@/components/TintingPreview";
import ProductsPreview from "@/components/ProductsPreview";
import AboutPreview from "@/components/AboutPreview";
import ContactsPreview from "@/components/ContactsPreview";
import Footer from "@/components/Footer";
import { useSeo } from "@/hooks/useSeo";

const Index = () => {
  useSeo({});
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="relative z-10 w-full">
      <Header />
      <main className="pt-16">
        <Hero />
        <StoreIntro />
        <div>
          <ProductsPreview />
          <FeaturedProducts />
          <TintingPreview />
          <BrandsPreview />
          <AboutPreview />
          <ContactsPreview />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
