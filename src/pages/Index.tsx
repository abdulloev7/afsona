// src/pages/Index.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Brands from "@/components/Brands";
import Tinting from "@/components/Tinting";
import Products from "@/components/Products";
import About from "@/components/About";
import Contacts from "@/components/Contacts";
import Footer from "@/components/Footer";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    const hashTarget = location.hash ? location.hash.replace('#', '') : '';
    const storedTarget = typeof window !== 'undefined'
      ? sessionStorage.getItem('afsona-scroll-target')
      : null;
    const targetId = hashTarget || storedTarget || '';

    const scrollToTarget = () => {
      if (!targetId) return;
      const element = document.getElementById(targetId);
      if (element) {
        const headerOffset = document.querySelector('header')?.clientHeight ?? 0;
        const elementTop = element.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top: Math.max(elementTop, 0), behavior: 'smooth' });
      }
    };

    if (targetId) {
      requestAnimationFrame(scrollToTarget);
      setTimeout(scrollToTarget, 300);
      if (storedTarget) {
        sessionStorage.removeItem('afsona-scroll-target');
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [location.key]);

  return (
    <div className="relative z-10 w-full">
      <Header />
      <main>
        <Hero />
        <div className="bg-background/95 backdrop-blur-sm">
          <Brands />
          <Tinting />
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
