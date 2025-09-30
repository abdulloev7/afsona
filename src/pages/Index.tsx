// src/pages/Index.tsx
import { useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Products from "@/components/Products";
import About from "@/components/About";
import Contacts from "@/components/Contacts";
import Footer from "@/components/Footer";

const Index = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative z-10 w-full">
      <Header />
      <main>
        <Hero />
        <div className="bg-background/95 backdrop-blur-sm">
          <Products />
          <About />
          <Contacts />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
