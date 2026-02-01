import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
  title_position_x: number | null;
  title_position_y: number | null;
  subtitle_position_x: number | null;
  subtitle_position_y: number | null;
  button_position_x: number | null;
  button_position_y: number | null;
  image_scale: number | null;
  image_position_x: number | null;
  image_position_y: number | null;
}

// Smart positioning component with anchor logic based on X position
interface BannerElementProps {
  x: number;
  y: number;
  children: React.ReactNode;
  className?: string;
}

const BannerElement = ({ x, y, children, className = "" }: BannerElementProps) => {
  let translateX = "-50%";
  let textAlign = "text-center";
  
  if (x < 35) {
    translateX = "0%";
    textAlign = "text-left";
  } else if (x > 65) {
    translateX = "-100%";
    textAlign = "text-right";
  }

  return (
    <div
      className={`absolute z-10 w-auto max-w-[90%] ${textAlign} ${className}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(${translateX}, -50%)`,
      }}
    >
      {children}
    </div>
  );
};

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
      <section className="h-[50vh] sm:h-[60vh] md:h-[65vh] lg:h-[75vh] flex items-center justify-center bg-background">
        <div className="container mx-auto px-4 text-center">
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
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="h-[50vh] sm:h-[60vh] md:h-[65vh] lg:h-[75vh] flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Загрузка...</div>
      </section>
    );
  }

  return (
    <section className="relative h-[50vh] sm:h-[60vh] md:h-[65vh] lg:h-[75vh] w-full overflow-hidden">
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
        className="w-full h-full [&>div]:h-full"
      >
        <CarouselContent className="h-full -ml-0 [&>div]:h-full">
          {banners.map((banner) => {
            const titleX = banner.title_position_x ?? 25;
            const titleY = banner.title_position_y ?? 70;
            const subtitleX = banner.subtitle_position_x ?? 25;
            const subtitleY = banner.subtitle_position_y ?? 78;
            const buttonX = banner.button_position_x ?? 25;
            const buttonY = banner.button_position_y ?? 88;
            const imageScale = (banner.image_scale ?? 100) / 100;
            const imagePositionX = (banner.image_position_x ?? 50) - 50;
            const imagePositionY = (banner.image_position_y ?? 50) - 50;

            return (
              <CarouselItem key={banner.id} className="h-full pl-0">
                <div className="relative w-full h-full overflow-hidden">
                  {/* Background image with instant transform (no animation delay) */}
                  <div 
                    className="absolute inset-0 w-full h-full"
                    style={{
                      transform: `scale(${imageScale}) translate(${imagePositionX}%, ${imagePositionY}%)`
                    }}
                  >
                    <img
                      src={banner.image_url}
                      alt={banner.title || "Banner"}
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                  </div>

                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                  {/* Content Container */}
                  <div className="relative w-full h-full">
                    {/* Title - smart anchor positioning */}
                    {banner.title && (
                      <BannerElement x={titleX} y={titleY}>
                        <h2
                          className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight whitespace-nowrap"
                          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
                        >
                          {banner.title}
                        </h2>
                      </BannerElement>
                    )}

                    {/* Subtitle - smart anchor positioning */}
                    {banner.subtitle && (
                      <BannerElement x={subtitleX} y={subtitleY}>
                        <p
                          className="text-sm md:text-base lg:text-lg text-white/90 whitespace-nowrap"
                          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
                        >
                          {banner.subtitle}
                        </p>
                      </BannerElement>
                    )}

                    {/* Button - smart anchor positioning */}
                    {banner.button_text && (
                      <BannerElement x={buttonX} y={buttonY}>
                        <Button
                          size="default"
                          onClick={() => handleButtonClick(banner.button_link)}
                          className="text-sm md:text-base px-6 py-2"
                        >
                          {banner.button_text}
                        </Button>
                      </BannerElement>
                    )}
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* Navigation - bottom-right with backdrop blur styling */}
        {banners.length > 1 && (
          <div className="absolute bottom-8 right-8 z-20 flex items-center gap-4">
            {/* Previous arrow */}
            <button
              onClick={scrollPrev}
              className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full text-white transition"
              aria-label="Previous slide"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            {/* Dot indicators */}
            <div className="flex items-center gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    current === index
                      ? "bg-white w-6"
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Next arrow */}
            <button
              onClick={scrollNext}
              className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full text-white transition"
              aria-label="Next slide"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </Carousel>
    </section>
  );
};

export default Hero;
