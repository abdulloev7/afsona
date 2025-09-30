// src/pages/Index.tsx
import { useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Products from "@/components/Products";
import About from "@/components/About";
import Contacts from "@/components/Contacts";
import Footer from "@/components/Footer";
import { AuroraBackground } from "@/components/ui/aurora-background";

const Index = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <AuroraBackground className="min-h-screen" showRadialGradient={false}>
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
    </AuroraBackground>
  );
};

export default Index;
