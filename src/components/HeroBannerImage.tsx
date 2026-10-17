import { cn } from "@/lib/utils";

interface HeroBannerImageProps {
  src: string;
  alt: string;
  positionX: number;
  positionY: number;
  scale?: number;
  // Optional phone image, shown below the md breakpoint instead of `src`
  mobileSrc?: string | null;
  mobilePositionX?: number;
  mobilePositionY?: number;
  eager?: boolean;
  className?: string;
}

// Fills its (relatively positioned) parent like background-size: cover, keeping the
// focal point (positionX/Y) in view. `scale` zooms in further around that point.
const HeroBannerImage = ({
  src,
  alt,
  positionX,
  positionY,
  scale = 100,
  mobileSrc,
  mobilePositionX = 50,
  mobilePositionY = 50,
  eager = false,
  className,
}: HeroBannerImageProps) => {
  const desktopPosition = `${positionX}% ${positionY}%`;
  const mobilePosition = `${mobilePositionX}% ${mobilePositionY}%`;
  const zoom = Math.max(scale, 100) / 100;

  const img = (
    <img
      src={src}
      alt={alt}
      draggable={false}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={cn(
        "absolute inset-0 h-full w-full object-cover select-none pointer-events-none",
        mobileSrc
          ? "[object-position:var(--pos-m)] md:[object-position:var(--pos-d)] md:[transform:scale(var(--zoom))] md:[transform-origin:var(--pos-d)]"
          : "[object-position:var(--pos-d)] [transform:scale(var(--zoom))] [transform-origin:var(--pos-d)]",
        className
      )}
      style={
        {
          "--pos-d": desktopPosition,
          "--pos-m": mobilePosition,
          "--zoom": zoom,
        } as React.CSSProperties
      }
    />
  );

  if (!mobileSrc) return img;

  // <picture> makes the browser download only the image for the current screen
  return (
    <picture>
      <source media="(max-width: 767px)" srcSet={mobileSrc} />
      {img}
    </picture>
  );
};

export default HeroBannerImage;
