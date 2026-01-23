import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface Banner {
  id: string;
  image_url: string;
  title: string;
  subtitle: string | null;
  button_text: string | null;
  button_link: string | null;
  display_order: number;
}

const Hero = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from("hero_banners")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const scrollPrev = useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleButtonClick = (link: string | null) => {
    if (!link) return;
    
    if (link.startsWith("/#")) {
      const id = link.replace("/#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = link;
      }
    } else if (link.startsWith("/")) {
      window.location.href = link;
    } else if (link.startsWith("http")) {
      window.open(link, "_blank");
    } else {
      window.location.href = link;
    }
  };

  // Fallback content when no banners exist
  if (!loading && banners.length === 0) {
    return (
      <section className="h-[75vh] flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
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
              Качественные краски и материалы для профессионального и домашнего
              ремонта. Экологично, надежно, красиво.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => handleButtonClick("/#products")}
                className="text-lg px-8 py-6"
              >
                Посмотреть ассортимент
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleButtonClick("/#contacts")}
                className="text-lg px-8 py-6"
              >
                Связаться с нами
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="h-[75vh] flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Загрузка...</div>
      </section>
    );
  }

  return (
    <section className="relative h-[75vh] w-full overflow-hidden">
      <Carousel
        setApi={setApi}
        opts={{
          loop: true,
          align: "start",
        }}
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
            playOnInit: true,
          }),
        ]}
        className="w-full h-full"
      >
        <CarouselContent className="h-full -ml-0">
          {banners.map((banner, index) => (
            <CarouselItem key={banner.id} className="h-full pl-0">
              <div className="relative w-full h-[75vh]">
                {/* Background image */}
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${banner.image_url})` }}
                />

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* Content */}
                <AnimatePresence mode="wait">
                  {current === index && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
                    >
                      <div className="max-w-4xl mx-auto">
                        <h2
                          className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight"
                          style={{
                            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                          }}
                        >
                          {banner.title}
                        </h2>
                        {banner.subtitle && (
                          <p
                            className="text-lg md:text-xl lg:text-2xl text-white/90 mb-8 max-w-2xl mx-auto"
                            style={{
                              textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                            }}
                          >
                            {banner.subtitle}
                          </p>
                        )}
                        {banner.button_text && (
                          <Button
                            size="lg"
                            onClick={() => handleButtonClick(banner.button_link)}
                            className="text-lg px-8 py-6"
                          >
                            {banner.button_text}
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation arrows - bottom right */}
        {banners.length > 1 && (
          <div className="absolute bottom-6 right-6 flex items-center gap-2 z-10">
            <Button
              variant="secondary"
              size="icon"
              onClick={scrollPrev}
              className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 border-0"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
              <span className="sr-only">Previous slide</span>
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={scrollNext}
              className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 border-0"
            >
              <ArrowRight className="h-5 w-5 text-white" />
              <span className="sr-only">Next slide</span>
            </Button>
          </div>
        )}

        {/* Dot indicators */}
        {banners.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  current === index
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </Carousel>
    </section>
  );
};

export default Hero;
