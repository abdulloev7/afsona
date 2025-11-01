// src/components/Hero.tsx
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { motion } from "framer-motion";

const Hero = () => {
  const goToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = `/#${id}`;
    }
  };

  return (
    <AuroraBackground className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="container mx-auto px-4 text-center"
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-foreground">
            AFSONA
          </h1>
          <p className="text-xl md:text-2xl mb-4 opacity-90 text-foreground">
            Эко материалы для ремонта
          </p>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-80 text-foreground">
            Качественные краски и материалы для профессионального и домашнего ремонта. 
            Экологично, надежно, красиво.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => goToSection('products')}
              className="text-lg px-8 py-6"
            >
              Посмотреть ассортимент
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => goToSection('contacts')}
              className="text-lg px-8 py-6"
            >
              Связаться с нами
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="mt-12 animate-bounce">
          <ArrowDown className="w-6 h-6 text-muted-foreground mx-auto" />
        </div>
      </motion.div>
    </AuroraBackground>
  );
};

export default Hero;
