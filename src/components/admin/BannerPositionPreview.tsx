import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Move, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImagePositionSettings } from './BannerImagePositioner';

export interface ElementPositions {
  title: { x: number; y: number };
  subtitle: { x: number; y: number };
  button: { x: number; y: number };
}

interface BannerPositionPreviewProps {
  imageUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  positions: ElementPositions;
  imagePosition?: ImagePositionSettings;
  onPositionsChange: (positions: ElementPositions) => void;
}

type ElementType = 'title' | 'subtitle' | 'button';

const BannerPositionPreview = ({
  imageUrl,
  title,
  subtitle,
  buttonText,
  positions,
  imagePosition,
  onPositionsChange,
}: BannerPositionPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeElement, setActiveElement] = useState<ElementType | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

  const hasContent = title || subtitle || buttonText;

  // Keyboard step (percentage per key press)
  const KEYBOARD_STEP = 0.5;
  const KEYBOARD_STEP_LARGE = 2;

  const updatePosition = useCallback((element: ElementType, x: number, y: number) => {
    const clampedX = Math.max(5, Math.min(95, x));
    const clampedY = Math.max(5, Math.min(95, y));
    
    onPositionsChange({
      ...positions,
      [element]: { 
        x: Math.round(clampedX * 10) / 10, 
        y: Math.round(clampedY * 10) / 10 
      },
    });
  }, [positions, onPositionsChange]);

  // Keyboard handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!activeElement) return;

    const step = e.shiftKey ? KEYBOARD_STEP_LARGE : KEYBOARD_STEP;
    const currentPos = positions[activeElement];
    let newX = currentPos.x;
    let newY = currentPos.y;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        newY -= step;
        break;
      case 'ArrowDown':
        e.preventDefault();
        newY += step;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newX -= step;
        break;
      case 'ArrowRight':
        e.preventDefault();
        newX += step;
        break;
      case 'Escape':
        setActiveElement(null);
        return;
      default:
        return;
    }

    updatePosition(activeElement, newX, newY);
  }, [activeElement, positions, updatePosition]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const getMousePosition = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return null;
    
    const rect = containerRef.current.getBoundingClientRect();
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, element: ElementType) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveElement(element);
    setIsDragging(true);
    setDragPosition(positions[element]);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !activeElement) return;
    
    const pos = getMousePosition(e);
    if (!pos) return;
    
    const clampedX = Math.max(5, Math.min(95, pos.x));
    const clampedY = Math.max(5, Math.min(95, pos.y));
    
    setDragPosition({ x: clampedX, y: clampedY });
  };

  const handleMouseUp = () => {
    if (isDragging && dragPosition && activeElement) {
      updatePosition(activeElement, dragPosition.x, dragPosition.y);
    }
    setIsDragging(false);
    setDragPosition(null);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      setActiveElement(null);
    }
  };

  // Get display position for an element
  const getDisplayPosition = (element: ElementType) => {
    if (isDragging && activeElement === element && dragPosition) {
      return dragPosition;
    }
    return positions[element];
  };

  // Determine text alignment based on horizontal position
  const getTextAlign = (x: number) => {
    if (x < 35) return 'text-left';
    if (x > 65) return 'text-right';
    return 'text-center';
  };

  const renderDraggableElement = (
    element: ElementType, 
    content: string, 
    renderContent: (isActive: boolean) => React.ReactNode
  ) => {
    if (!content) return null;
    
    const pos = getDisplayPosition(element);
    const isActive = activeElement === element;
    const isBeingDragged = isDragging && isActive;

    return (
      <div
        key={element}
        tabIndex={0}
        className={cn(
          "absolute transform -translate-x-1/2 -translate-y-1/2 outline-none z-10",
          isBeingDragged ? 'cursor-grabbing z-30' : 'cursor-grab z-20',
          isActive && !isBeingDragged && 'z-30'
        )}
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
        }}
        onMouseDown={(e) => handleMouseDown(e, element)}
        onTouchStart={(e) => handleMouseDown(e, element)}
        onClick={(e) => {
          e.stopPropagation();
          setActiveElement(element);
        }}
        onFocus={() => setActiveElement(element)}
      >
        {/* Selection indicator - positioned around content without affecting layout */}
        {isActive && (
          <div className="absolute -inset-2 border-2 border-primary rounded-lg bg-primary/10 pointer-events-none" />
        )}
        {renderContent(isActive)}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Превью баннера (полный размер)</p>
          <p className="text-xs text-muted-foreground">
            Перетаскивайте элементы или используйте стрелки клавиатуры
          </p>
        </div>
        {hasContent && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Move className="h-3 w-3" />
            <span>Drag</span>
            <Keyboard className="h-3 w-3 ml-1" />
            <span>←↑↓→</span>
          </div>
        )}
      </div>
      
      {/* 
        Preview matching Hero component dimensions exactly:
        - Hero uses h-[75vh] which creates roughly a 21:9 aspect ratio on most screens
        - Using 21:9 (2.33:1) to match typical viewport proportions when hero is 75vh
        - bg-cover ensures the image fills and crops the same way as in Hero
      */}
      <div
        ref={containerRef}
        className={cn(
          "relative w-full rounded-lg overflow-hidden border-2 border-dashed border-border bg-muted select-none",
          activeElement ? 'cursor-default' : 'cursor-pointer'
        )}
        style={{ aspectRatio: '21 / 9' }}
        onClick={handleContainerClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Background image with position and scale from imagePosition */}
        <div
          className="absolute inset-0"
          style={{ 
            backgroundImage: `url(${imageUrl})`,
            backgroundPosition: imagePosition 
              ? `${imagePosition.x}% ${imagePosition.y}%` 
              : 'center center',
            backgroundSize: imagePosition 
              ? `${imagePosition.scale}%` 
              : 'cover',
            backgroundRepeat: 'no-repeat',
          }}
        />
        
        {/* Gradient overlay - matching Hero */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Title element - matches Hero.tsx styling exactly */}
        {renderDraggableElement('title', title, () => (
          <h2
            className={`text-lg md:text-xl lg:text-2xl font-bold text-white leading-tight whitespace-nowrap ${getTextAlign(getDisplayPosition('title').x)}`}
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
          >
            {title}
          </h2>
        ))}

        {/* Subtitle element - matches Hero.tsx styling exactly */}
        {renderDraggableElement('subtitle', subtitle, () => (
          <p
            className={`text-xs md:text-sm lg:text-base text-white/90 whitespace-nowrap ${getTextAlign(getDisplayPosition('subtitle').x)}`}
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
          >
            {subtitle}
          </p>
        ))}

        {/* Button element - matches Hero.tsx styling exactly */}
        {renderDraggableElement('button', buttonText, () => (
          <Button size="default" className="text-xs md:text-sm px-6 py-2">
            {buttonText}
          </Button>
        ))}

        {/* No content placeholder */}
        {!hasContent && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/60 text-sm">
              Добавьте заголовок, подзаголовок или кнопку
            </p>
          </div>
        )}
      </div>

      {/* Position indicators and keyboard hint */}
      <div className="flex flex-col gap-2 text-xs">
        <div className="flex flex-wrap gap-4">
          {title && (
            <span className={cn(
              "px-2 py-1 rounded",
              activeElement === 'title' ? 'bg-primary/20 text-primary' : 'text-muted-foreground'
            )}>
              Заголовок: <span className="font-mono">X: {positions.title.x.toFixed(1)}% Y: {positions.title.y.toFixed(1)}%</span>
            </span>
          )}
          {subtitle && (
            <span className={cn(
              "px-2 py-1 rounded",
              activeElement === 'subtitle' ? 'bg-primary/20 text-primary' : 'text-muted-foreground'
            )}>
              Подзаголовок: <span className="font-mono">X: {positions.subtitle.x.toFixed(1)}% Y: {positions.subtitle.y.toFixed(1)}%</span>
            </span>
          )}
          {buttonText && (
            <span className={cn(
              "px-2 py-1 rounded",
              activeElement === 'button' ? 'bg-primary/20 text-primary' : 'text-muted-foreground'
            )}>
              Кнопка: <span className="font-mono">X: {positions.button.x.toFixed(1)}% Y: {positions.button.y.toFixed(1)}%</span>
            </span>
          )}
        </div>
        {activeElement && (
          <p className="text-muted-foreground">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">←↑↓→</kbd> — точное перемещение (0.5%) | 
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs ml-1">Shift</kbd> + стрелки — быстрое (2%) | 
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs ml-1">Esc</kbd> — снять выделение
          </p>
        )}
      </div>
    </div>
  );
};

export default BannerPositionPreview;