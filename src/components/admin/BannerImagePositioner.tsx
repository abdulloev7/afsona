import { useState, useRef, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, Move, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export interface ImagePositionSettings {
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  scale: number; // 100 = 100%
}

interface BannerImagePositionerProps {
  imageUrl: string;
  position: ImagePositionSettings;
  onPositionChange: (position: ImagePositionSettings) => void;
}

const BannerImagePositioner = ({
  imageUrl,
  position,
  onPositionChange,
}: BannerImagePositionerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; posX: number; posY: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    setIsDragging(true);
    setDragStart({
      x: clientX,
      y: clientY,
      posX: position.x,
      posY: position.y,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !dragStart || !containerRef.current) return;
    
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate delta as percentage of container size
    // Invert direction: dragging right moves image right (decreases position-x)
    const deltaX = ((clientX - dragStart.x) / rect.width) * 100;
    const deltaY = ((clientY - dragStart.y) / rect.height) * 100;
    
    // Scale affects how much movement is needed
    const scaleFactor = position.scale / 100;
    const adjustedDeltaX = deltaX / scaleFactor;
    const adjustedDeltaY = deltaY / scaleFactor;
    
    // Invert: dragging right should move viewport right (image appears to move left relative to frame)
    const newX = Math.max(0, Math.min(100, dragStart.posX - adjustedDeltaX));
    const newY = Math.max(0, Math.min(100, dragStart.posY - adjustedDeltaY));
    
    onPositionChange({
      ...position,
      x: Math.round(newX * 10) / 10,
      y: Math.round(newY * 10) / 10,
    });
  }, [isDragging, dragStart, position, onPositionChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleMouseMove);
        window.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleScaleChange = (values: number[]) => {
    onPositionChange({
      ...position,
      scale: values[0],
    });
  };

  const handleReset = () => {
    onPositionChange({
      x: 50,
      y: 50,
      scale: 100,
    });
  };

  const adjustScale = (delta: number) => {
    const newScale = Math.max(100, Math.min(200, position.scale + delta));
    onPositionChange({
      ...position,
      scale: newScale,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Позиция изображения</p>
          <p className="text-xs text-muted-foreground">
            Перетаскивайте изображение и настраивайте масштаб
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="h-8 px-2 text-xs"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Сброс
        </Button>
      </div>
      
      {/* Image preview with draggable positioning */}
      <div
        ref={containerRef}
        className={cn(
          "relative w-full rounded-lg overflow-hidden border-2 border-dashed border-border",
          isDragging ? 'cursor-grabbing border-primary' : 'cursor-grab'
        )}
        style={{ aspectRatio: '21 / 9' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        {/* Background image with position and scale */}
        <div
          className="absolute inset-0 transition-none"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundPosition: `${position.x}% ${position.y}%`,
            backgroundSize: `${position.scale}%`,
            backgroundRepeat: 'no-repeat',
          }}
        />
        
        {/* Overlay with move hint */}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-black/60 rounded-full p-3">
            <Move className="h-6 w-6 text-white" />
          </div>
        </div>
        
        {/* Crosshair indicator */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            <div className="absolute inset-1 bg-primary rounded-full" />
          </div>
        </div>
      </div>
      
      {/* Scale slider */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => adjustScale(-10)}
          disabled={position.scale <= 100}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <div className="flex-1">
          <Slider
            value={[position.scale]}
            min={100}
            max={200}
            step={5}
            onValueChange={handleScaleChange}
            className="w-full"
          />
        </div>
        
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => adjustScale(10)}
          disabled={position.scale >= 200}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        
        <span className="text-sm font-mono w-14 text-right text-muted-foreground">
          {position.scale}%
        </span>
      </div>
      
      {/* Position indicators */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>
          Позиция: <span className="font-mono">X: {position.x.toFixed(1)}% Y: {position.y.toFixed(1)}%</span>
        </span>
        <span>
          Масштаб: <span className="font-mono">{position.scale}%</span>
        </span>
      </div>
    </div>
  );
};

export default BannerImagePositioner;
