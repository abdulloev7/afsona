import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { t } from "@/i18n";

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  caption?: string;
  fit?: 'cover' | 'contain';
}

interface ProductMediaCarouselProps {
  media: MediaItem[];
  productName: string;
}

export const ProductMediaCarousel = ({ media, productName }: ProductMediaCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!media || media.length === 0) {
    return (
      <Card className="p-6">
        <div className="w-full h-[400px] bg-muted rounded-lg flex items-center justify-center">
          <span className="text-muted-foreground">{t("Нет изображения")}</span>
        </div>
      </Card>
    );
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const currentMedia = media[currentIndex];

  return (
    <Card className="p-3 sm:p-6 relative">
      {/* Main Media Display */}
      <div className="relative">
        {currentMedia.type === 'image' ? (
          <img
            src={currentMedia.url}
            alt={currentMedia.caption || productName}
            className={`w-full aspect-square sm:aspect-auto sm:h-[400px] ${
              currentMedia.fit === 'contain' ? 'object-contain' : 'object-cover'
            } rounded-lg`}
          />
        ) : (
          <video
            src={currentMedia.url}
            controls
            className={`w-full h-[400px] ${
              currentMedia.fit === 'contain' ? 'object-contain' : 'object-cover'
            } rounded-lg`}
          />
        )}

        {/* Navigation Arrows - только если больше одного медиа */}
        {media.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
              onClick={handlePrevious}
              aria-label={t("Предыдущее фото")}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
              onClick={handleNext}
              aria-label={t("Следующее фото")}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>

      {/* Caption */}
      {currentMedia.caption && (
        <p className="text-sm text-muted-foreground mt-3 text-center">
          {currentMedia.caption}
        </p>
      )}

      {/* Dots Indicator - только если больше одного медиа */}
      {media.length > 1 && (
        <div className="flex justify-center mt-2">
          {media.map((_, index) => (
            // The button is a 24px tap target; the dot inside is what shows.
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className="group flex h-6 min-w-6 items-center justify-center px-1"
              aria-label={t("Перейти к медиа {n}", { n: index + 1 })}
              aria-current={index === currentIndex ? "true" : undefined}
            >
              <span
                className={`block h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-primary w-6'
                    : 'w-2 bg-muted-foreground/30 group-hover:bg-muted-foreground/50'
                }`}
              />
            </button>
          ))}
        </div>
      )}

      {/* Counter - только если больше одного медиа */}
      {media.length > 1 && (
        <p className="text-center text-sm text-muted-foreground mt-2">
          {currentIndex + 1} / {media.length}
        </p>
      )}
    </Card>
  );
};
