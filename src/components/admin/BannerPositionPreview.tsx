import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Move } from 'lucide-react';

type TextPosition = 
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

interface BannerPositionPreviewProps {
  imageUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  position: string;
  onPositionChange: (position: TextPosition) => void;
}

const BannerPositionPreview = ({
  imageUrl,
  title,
  subtitle,
  buttonText,
  position,
  onPositionChange,
}: BannerPositionPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

  const hasContent = title || subtitle || buttonText;

  // Calculate position from text_position value
  const getPositionCoords = (pos: string): { x: number; y: number } => {
    const positions: Record<string, { x: number; y: number }> = {
      'top-left': { x: 25, y: 15 },
      'top-center': { x: 50, y: 15 },
      'top-right': { x: 75, y: 15 },
      'center-left': { x: 25, y: 50 },
      'center': { x: 50, y: 50 },
      'center-right': { x: 75, y: 50 },
      'bottom-left': { x: 25, y: 85 },
      'bottom-center': { x: 50, y: 85 },
      'bottom-right': { x: 75, y: 85 },
    };
    return positions[pos] || positions['bottom-left'];
  };

  // Convert pixel position to nearest grid position
  const getNearestPosition = (xPercent: number, yPercent: number): TextPosition => {
    // Determine horizontal position
    let horizontal: 'left' | 'center' | 'right';
    if (xPercent < 37.5) horizontal = 'left';
    else if (xPercent > 62.5) horizontal = 'right';
    else horizontal = 'center';

    // Determine vertical position
    let vertical: 'top' | 'center' | 'bottom';
    if (yPercent < 37.5) vertical = 'top';
    else if (yPercent > 62.5) vertical = 'bottom';
    else vertical = 'center';

    if (vertical === 'center' && horizontal === 'center') {
      return 'center';
    }
    return `${vertical}-${horizontal}` as TextPosition;
  };

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
    
    // Clamp to container bounds
    const clampedX = Math.max(10, Math.min(90, x));
    const clampedY = Math.max(10, Math.min(90, y));
    
    setDragPosition({ x: clampedX, y: clampedY });
  };

  const handleMouseUp = () => {
    if (isDragging && dragPosition) {
      const newPosition = getNearestPosition(dragPosition.x, dragPosition.y);
      onPositionChange(newPosition);
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
    
    const clampedX = Math.max(10, Math.min(90, x));
    const clampedY = Math.max(10, Math.min(90, y));
    
    setDragPosition({ x: clampedX, y: clampedY });
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  // Current display position
  const displayPos = dragPosition || getPositionCoords(position);
  const isCenter = position === 'center' || position.includes('center');
  const isRight = position.includes('right');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Превью баннера</p>
          <p className="text-xs text-muted-foreground">
            Перетащите текстовый блок в нужное место
          </p>
        </div>
        {hasContent && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Move className="h-3 w-3" />
            Drag & Drop
          </div>
        )}
      </div>
      
      <div
        ref={containerRef}
        className="relative aspect-video w-full rounded-lg overflow-hidden border-2 border-dashed border-border bg-muted cursor-crosshair select-none"
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
        
        {/* Grid overlay for positioning guidance */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Vertical lines */}
          <div className="absolute left-1/4 top-0 bottom-0 border-l border-white/20" />
          <div className="absolute left-1/2 top-0 bottom-0 border-l border-white/20" />
          <div className="absolute left-3/4 top-0 bottom-0 border-l border-white/20" />
          {/* Horizontal lines */}
          <div className="absolute top-1/3 left-0 right-0 border-t border-white/20" />
          <div className="absolute top-2/3 left-0 right-0 border-t border-white/20" />
        </div>

        {/* Draggable content block */}
        {hasContent && (
          <div
            ref={contentRef}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ${
              isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab'
            }`}
            style={{
              left: `${displayPos.x}%`,
              top: `${displayPos.y}%`,
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div 
              className={`bg-black/40 backdrop-blur-sm rounded-lg p-3 max-w-[200px] border-2 ${
                isDragging ? 'border-primary shadow-lg' : 'border-transparent hover:border-white/50'
              }`}
            >
              <div className={`${isCenter ? 'text-center' : isRight ? 'text-right' : 'text-left'}`}>
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
                  <div className={`mt-2 ${isCenter ? 'flex justify-center' : isRight ? 'flex justify-end' : ''}`}>
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
          Текущая позиция: <span className="font-medium text-foreground">{position}</span>
        </span>
        {isDragging && dragPosition && (
          <span className="text-primary font-medium">
            → {getNearestPosition(dragPosition.x, dragPosition.y)}
          </span>
        )}
      </div>
    </div>
  );
};

export default BannerPositionPreview;