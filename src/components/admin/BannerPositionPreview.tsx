import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Move } from 'lucide-react';

interface BannerPositionPreviewProps {
  imageUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  positionX: number;
  positionY: number;
  onPositionChange: (x: number, y: number) => void;
}

const BannerPositionPreview = ({
  imageUrl,
  title,
  subtitle,
  buttonText,
  positionX,
  positionY,
  onPositionChange,
}: BannerPositionPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

  const hasContent = title || subtitle || buttonText;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current || !hasContent) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Clamp to container bounds with padding
    const clampedX = Math.max(5, Math.min(95, x));
    const clampedY = Math.max(5, Math.min(95, y));
    
    setDragPosition({ x: clampedX, y: clampedY });
  };

  const handleMouseUp = () => {
    if (isDragging && dragPosition) {
      // Round to 1 decimal place for cleaner storage
      onPositionChange(
        Math.round(dragPosition.x * 10) / 10,
        Math.round(dragPosition.y * 10) / 10
      );
    }
    setIsDragging(false);
    setDragPosition(null);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current || !hasContent) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    
    const clampedX = Math.max(5, Math.min(95, x));
    const clampedY = Math.max(5, Math.min(95, y));
    
    setDragPosition({ x: clampedX, y: clampedY });
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  // Click to place
  const handleContainerClick = (e: React.MouseEvent) => {
    if (!containerRef.current || !hasContent || isDragging) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const clampedX = Math.max(5, Math.min(95, x));
    const clampedY = Math.max(5, Math.min(95, y));
    
    onPositionChange(
      Math.round(clampedX * 10) / 10,
      Math.round(clampedY * 10) / 10
    );
  };

  // Current display position
  const displayX = dragPosition?.x ?? positionX;
  const displayY = dragPosition?.y ?? positionY;

  // Determine text alignment based on horizontal position
  const getTextAlign = () => {
    if (displayX < 35) return 'text-left';
    if (displayX > 65) return 'text-right';
    return 'text-center';
  };

  const getJustify = () => {
    if (displayX < 35) return '';
    if (displayX > 65) return 'flex justify-end';
    return 'flex justify-center';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Превью баннера</p>
          <p className="text-xs text-muted-foreground">
            Перетащите или кликните для размещения текста
          </p>
        </div>
        {hasContent && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Move className="h-3 w-3" />
            Свободное перемещение
          </div>
        )}
      </div>
      
      <div
        ref={containerRef}
        className="relative aspect-video w-full rounded-lg overflow-hidden border-2 border-dashed border-border bg-muted cursor-crosshair select-none"
        onClick={handleContainerClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Draggable content block */}
        {hasContent && (
          <div
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ${
              isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab'
            }`}
            style={{
              left: `${displayX}%`,
              top: `${displayY}%`,
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div 
              className={`bg-black/40 backdrop-blur-sm rounded-lg p-3 max-w-[200px] border-2 ${
                isDragging ? 'border-primary shadow-lg shadow-primary/30' : 'border-white/30 hover:border-white/60'
              }`}
            >
              <div className={getTextAlign()}>
                {title && (
                  <h3 className="text-white text-sm font-bold leading-tight truncate">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-white/80 text-xs mt-0.5 truncate">
                    {subtitle}
                  </p>
                )}
                {buttonText && (
                  <div className={`mt-2 ${getJustify()}`}>
                    <Button size="sm" className="h-6 text-xs px-2">
                      {buttonText}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* No content placeholder */}
        {!hasContent && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/60 text-sm">
              Добавьте заголовок или кнопку для превью
            </p>
          </div>
        )}
      </div>

      {/* Position indicator */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Позиция: <span className="font-mono font-medium text-foreground">X: {displayX.toFixed(1)}% | Y: {displayY.toFixed(1)}%</span>
        </span>
        {isDragging && (
          <span className="text-primary font-medium animate-pulse">
            Перетаскивание...
          </span>
        )}
      </div>
    </div>
  );
};

export default BannerPositionPreview;