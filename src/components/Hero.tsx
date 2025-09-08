import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

const Hero = () => {
  const scrollToProducts = () => {
    const element = document.getElementById('products');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-hero"></div>
      
      {/* Content */}
      <div className="relative container mx-auto px-4 text-center text-primary-foreground">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            AFSONA
          </h1>
          <p className="text-xl md:text-2xl mb-4 opacity-90">
            Эко материалы для ремонта
          </p>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-80">
            Качественные краски и материалы для профессионального и домашнего ремонта. 
            Экологично, надежно, красиво.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={scrollToProducts}
              className="text-lg px-8 py-6"
            >
              Посмотреть ассортимент
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-lg px-8 py-6 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              Связаться с нами
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ArrowDown className="w-6 h-6 text-primary-foreground/70" />
      </div>
    </section>
  );
};

export default Hero;