import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
import { cn } from "@/lib/utils";
import HeroBannerImage from "@/components/HeroBannerImage";
import {
  DEFAULT_POSITIONS,
  allHaveMobileImages,
  getTextAlign,
  type HeroBanner,
} from "@/lib/heroBanner";
import { localized, t } from "@/i18n";

// Banner text slides up when its slide becomes current; skipped for "reduce motion".
const fadeUp = (delay: "delay-0" | "delay-100" | "delay-200" = "delay-0") =>
  `animate-in fade-in slide-in-from-bottom-5 duration-500 ease-out fill-mode-both motion-reduce:animate-none ${delay}`;

const Hero = () => {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from("hero_banners")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      // On /tg each banner uses its Tajik images, falling back to the Russian ones
      setBanners(
        ((data as HeroBanner[]) || []).map((banner) => ({
          ...banner,
          image_url: localized(banner, "image_url"),
          mobile_image_url: localized(banner, "mobile_image_url") || null,
        }))
      );
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
        navigate(link);
      }
    } else if (link.startsWith("/")) {
      navigate(link);
    } else if (link.startsWith("http")) {
      window.open(link, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = link;
    }
  };

  // Fallback content when no banners exist
  if (!loading && banners.length === 0) {
    return (
      <section className="h-[50vh] sm:h-[60vh] md:h-[65vh] lg:h-[75vh] flex items-center justify-center bg-background">
        <div className={cn("container mx-auto px-4 text-center", fadeUp())}>
          <div className="max-w-4xl mx-auto">
            <p className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-foreground">
              AFSONA
            </p>
            <p className="text-xl md:text-2xl mb-4 opacity-90 text-foreground">
              {t("Эко материалы для ремонта")}
            </p>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-80 text-foreground">
              {t("Качественные краски и материалы для профессионального и домашнего ремонта. Экологично, надежно, красиво.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => handleButtonClick("/#products")}
                className="text-lg px-8 py-6"
              >
                {t("Посмотреть ассортимент")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleButtonClick("/#contacts")}
                className="text-lg px-8 py-6"
              >
                {t("Связаться с нами")}
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="w-full aspect-[12/5] bg-muted animate-pulse" aria-busy="true" />
    );
  }

  // Phones get portrait 4:5 slides only when every banner has a phone image
  const portraitOnPhones = allHaveMobileImages(banners);

  return (
    <section className="relative w-full overflow-hidden bg-muted">
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
          }),
        ]}
        className="w-full"
      >
        <CarouselContent className="ml-0">
          {banners.map((banner, index) => {
            const title = {
              x: banner.title_position_x ?? DEFAULT_POSITIONS.title.x,
              y: banner.title_position_y ?? DEFAULT_POSITIONS.title.y,
            };
            const subtitle = {
              x: banner.subtitle_position_x ?? DEFAULT_POSITIONS.subtitle.x,
              y: banner.subtitle_position_y ?? DEFAULT_POSITIONS.subtitle.y,
            };
            const button = {
              x: banner.button_position_x ?? DEFAULT_POSITIONS.button.x,
              y: banner.button_position_y ?? DEFAULT_POSITIONS.button.y,
            };
            const isCurrent = current === index;
            // The page heading lives in StoreIntro; banner titles are display text.
            const TitleTag = "p";
            const hasText = !!(banner.title || banner.subtitle || banner.button_text);

            return (
              <CarouselItem key={banner.id} className="pl-0">
                <div
                  className={cn(
                    "relative w-full overflow-hidden md:max-h-[calc(100vh-4rem)]",
                    portraitOnPhones ? "aspect-[4/5] md:aspect-[12/5]" : "aspect-[12/5]"
                  )}
                >
                  <HeroBannerImage
                    src={banner.image_url}
                    alt={banner.title || "AFSONA"}
                    positionX={banner.image_position_x ?? 50}
                    positionY={banner.image_position_y ?? 50}
                    scale={banner.image_scale ?? 100}
                    mobileSrc={portraitOnPhones ? banner.mobile_image_url : null}
                    mobilePositionX={banner.mobile_image_position_x ?? 50}
                    mobilePositionY={banner.mobile_image_position_y ?? 50}
                    eager={index === 0}
                  />

                  {/* Darken only when there is text to read over the image */}
                  {(banner.title || banner.subtitle) && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  )}

                  {/* Text placed where the admin put it (wide layout). The wrapper centres each
                      element on its point; the inner div only animates. */}
                  <div className={cn("absolute inset-0", portraitOnPhones && "hidden md:block")}>
                    {banner.title && (
                      <div
                        className="absolute z-10 -translate-x-1/2 -translate-y-1/2 w-max max-w-[85%]"
                        style={{ left: `${title.x}%`, top: `${title.y}%` }}
                      >
                        {isCurrent && (
                          <div key={`title-${banner.id}`} className={fadeUp()}>
                              <TitleTag
                                className={`text-base sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight ${getTextAlign(title.x)}`}
                                style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
                              >
                                {banner.title}
                              </TitleTag>
                          </div>
                        )}
                      </div>
                    )}

                    {banner.subtitle && (
                      <div
                        className="absolute z-10 -translate-x-1/2 -translate-y-1/2 w-max max-w-[85%]"
                        style={{ left: `${subtitle.x}%`, top: `${subtitle.y}%` }}
                      >
                        {isCurrent && (
                          <div key={`subtitle-${banner.id}`} className={fadeUp("delay-100")}>
                              <p
                                className={`text-xs sm:text-base lg:text-lg text-white/90 ${getTextAlign(subtitle.x)}`}
                                style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
                              >
                                {banner.subtitle}
                              </p>
                          </div>
                        )}
                      </div>
                    )}

                    {banner.button_text && (
                      <div
                        className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${button.x}%`, top: `${button.y}%` }}
                      >
                        {isCurrent && (
                          <div key={`button-${banner.id}`} className={fadeUp("delay-200")}>
                              <Button
                                onClick={() => handleButtonClick(banner.button_link)}
                                className="h-7 px-3 text-xs sm:h-9 sm:px-5 sm:text-sm md:h-10 md:px-6 md:text-base whitespace-nowrap"
                              >
                                {banner.button_text}
                              </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Portrait phone layout: text stacked at the bottom, above the dots */}
                  {portraitOnPhones && hasText && (
                    <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-2 px-6 pb-12 text-center md:hidden">
                      {banner.title && (
                        <TitleTag
                          className="text-2xl font-bold leading-tight text-white"
                          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
                        >
                          {banner.title}
                        </TitleTag>
                      )}
                      {banner.subtitle && (
                        <p
                          className="text-sm text-white/90"
                          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
                        >
                          {banner.subtitle}
                        </p>
                      )}
                      {banner.button_text && (
                        <Button
                          onClick={() => handleButtonClick(banner.button_link)}
                          className="mt-1"
                        >
                          {banner.button_text}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* Navigation: dots centred on phones, dots + arrows bottom right on larger screens */}
        {banners.length > 1 && (
          <div
            className={cn(
              "z-20 flex items-center justify-center gap-4 md:absolute md:bottom-5 md:right-6",
              portraitOnPhones
                ? "absolute bottom-3 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0"
                : "py-2.5 bg-background md:bg-transparent md:py-0"
            )}
          >
            <div className="flex items-center">
              {banners.map((_, index) => (
                // 24px tap target around a small dot
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className="group flex h-6 min-w-6 items-center justify-center px-1"
                  aria-label={t("Слайд {n}", { n: index + 1 })}
                  aria-current={current === index ? "true" : undefined}
                >
                  <span
                    className={`block h-2 md:h-2.5 rounded-full transition-all duration-300 ${
                      current === index
                        ? "bg-primary w-5 md:w-6"
                        : cn(
                            "w-2 md:w-2.5 md:bg-white/60 md:group-hover:bg-white/80",
                            portraitOnPhones ? "bg-white/60" : "bg-foreground/25"
                          )
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={scrollPrev}
                className="h-9 w-9 rounded-full bg-white/90 hover:bg-white border border-border shadow-sm"
              >
                <ArrowLeft className="h-4 w-4 text-foreground" />
                <span className="sr-only">{t("Предыдущий слайд")}</span>
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={scrollNext}
                className="h-9 w-9 rounded-full bg-white/90 hover:bg-white border border-border shadow-sm"
              >
                <ArrowRight className="h-4 w-4 text-foreground" />
                <span className="sr-only">{t("Следующий слайд")}</span>
              </Button>
            </div>
          </div>
        )}
      </Carousel>
    </section>
  );
};

export default Hero;
