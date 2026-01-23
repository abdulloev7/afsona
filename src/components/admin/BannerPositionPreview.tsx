import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Move, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  onPositionsChange: (positions: ElementPositions) => void;
}

type ElementType = 'title' | 'subtitle' | 'button';

const BannerPositionPreview = ({
  imageUrl,
  title,
  subtitle,
  buttonText,
  positions,
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
          "absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 outline-none",
          isBeingDragged ? 'cursor-grabbing scale-105 z-30' : 'cursor-grab z-20',
          isActive && !isBeingDragged && 'ring-2 ring-primary ring-offset-2 ring-offset-transparent z-30'
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
        <div 
          className={cn(
            "rounded-lg p-2 border-2 transition-all",
            isActive 
              ? 'bg-black/60 border-primary shadow-lg shadow-primary/30' 
              : 'bg-black/40 border-white/30 hover:border-white/60'
          )}
        >
          {renderContent(isActive)}
        </div>
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
      
      {/* Full-size preview matching Hero component (75vh equivalent aspect ratio ~16:9) */}
      <div
        ref={containerRef}
        className={cn(
          "relative w-full rounded-lg overflow-hidden border-2 border-dashed border-border bg-muted select-none",
          activeElement ? 'cursor-default' : 'cursor-pointer'
        )}
        style={{ aspectRatio: '16 / 9' }}
        onClick={handleContainerClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        
        {/* Gradient overlay - matching Hero */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Title element */}
        {renderDraggableElement('title', title, (isActive) => (
          <div className={getTextAlign(getDisplayPosition('title').x)}>
            <h3 className="text-white text-base md:text-lg lg:text-xl font-bold leading-tight whitespace-nowrap"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
              {title}
            </h3>
            {isActive && (
              <span className="text-xs text-primary mt-1 block">Заголовок</span>
            )}
          </div>
        ))}

        {/* Subtitle element */}
        {renderDraggableElement('subtitle', subtitle, (isActive) => (
          <div className={getTextAlign(getDisplayPosition('subtitle').x)}>
            <p className="text-white/90 text-sm md:text-base whitespace-nowrap"
               style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
              {subtitle}
            </p>
            {isActive && (
              <span className="text-xs text-primary mt-1 block">Подзаголовок</span>
            )}
          </div>
        ))}

        {/* Button element */}
        {renderDraggableElement('button', buttonText, (isActive) => (
          <div className="flex flex-col items-center">
            <Button size="sm" className="text-xs md:text-sm px-4">
              {buttonText}
            </Button>
            {isActive && (
              <span className="text-xs text-primary mt-1">Кнопка</span>
            )}
          </div>
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