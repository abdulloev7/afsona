// src/components/Hero.tsx
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/locales/translations";

const Hero = () => {
  const { language } = useLanguage();
  const t = (key: any) => getTranslation(language, key);
  
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
            {t('heroTitle')}
          </h1>
          <p className="text-xl md:text-2xl mb-4 opacity-90 text-foreground">
            {t('heroSubtitle')}
          </p>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-80 text-foreground">
            {t('heroDescription')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => goToSection('products')}
              className="text-lg px-8 py-6"
            >
              {t('viewCatalog')}
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => goToSection('contacts')}
              className="text-lg px-8 py-6"
            >
              {t('contactUs')}
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
