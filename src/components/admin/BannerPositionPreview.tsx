import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Move, Keyboard, ZoomIn, Monitor, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import HeroBannerImage from '@/components/HeroBannerImage';
import { DESKTOP_ASPECT, MOBILE_ASPECT, getTextAlign } from '@/lib/heroBanner';

export interface ElementPositions {
  title: { x: number; y: number };
  subtitle: { x: number; y: number };
  button: { x: number; y: number };
}

export interface ImageSettings {
  scale: number;
  positionX: number;
  positionY: number;
}

export interface FocalPoint {
  positionX: number;
  positionY: number;
}

// Previews are drawn at a real screen width and scaled down, so fonts, button sizes
// and cropping match the site exactly.
const DESKTOP_VIRTUAL_WIDTH = 1440;
const PHONE_VIRTUAL_WIDTH = 390;

interface ScaledFrameProps {
  virtualWidth: number;
  aspect: number;
  outerRef?: React.RefObject<HTMLDivElement>;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  handlers?: React.HTMLAttributes<HTMLDivElement>;
}

const ScaledFrame = ({ virtualWidth, aspect, outerRef, className, style, children, handlers }: ScaledFrameProps) => {
  const localRef = useRef<HTMLDivElement>(null);
  const ref = outerRef ?? localRef;
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / virtualWidth));
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, virtualWidth]);

  return (
    <div
      ref={ref}
      className={cn('relative overflow-hidden', className)}
      style={{ aspectRatio: aspect, ...style }}
      {...handlers}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: virtualWidth, height: virtualWidth / aspect, transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
};

interface BannerPositionPreviewProps {
  imageUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  positions: ElementPositions;
  imageSettings: ImageSettings;
  mobileImageUrl: string | null;
  mobileImageSettings: FocalPoint;
  onPositionsChange: (positions: ElementPositions) => void;
  onImageSettingsChange: (settings: ImageSettings) => void;
  onMobileImageSettingsChange: (settings: FocalPoint) => void;
}

type ElementType = 'title' | 'subtitle' | 'button';

const BannerPositionPreview = ({
  imageUrl,
  title,
  subtitle,
  buttonText,
  positions,
  imageSettings,
  mobileImageUrl,
  mobileImageSettings,
  onPositionsChange,
  onImageSettingsChange,
  onMobileImageSettingsChange,
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

  const textShadow = { textShadow: '0 2px 8px rgba(0,0,0,0.5)' };
  const textShadowSmall = { textShadow: '0 1px 4px rgba(0,0,0,0.5)' };
  const hasOverlayText = !!(title || subtitle);

  const renderPositionedPhoneElement = (element: ElementType, node: React.ReactNode) => (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 w-max max-w-[85%]"
      style={{ left: `${positions[element].x}%`, top: `${positions[element].y}%` }}
    >
      {node}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ---------- Desktop ---------- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Компьютер и ноутбук</p>
              <p className="text-xs text-muted-foreground">
                Так баннер выглядит на сайте. Перетаскивайте текст и кнопку мышкой или стрелками
              </p>
            </div>
          </div>
          {hasContent && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <Move className="h-3 w-3" />
              <span>Drag</span>
              <Keyboard className="h-3 w-3 ml-1" />
              <span>←↑↓→</span>
            </div>
          )}
        </div>

        <ScaledFrame
          virtualWidth={DESKTOP_VIRTUAL_WIDTH}
          aspect={DESKTOP_ASPECT}
          outerRef={containerRef}
          className={cn(
            'w-full rounded-lg border-2 border-dashed border-border bg-muted select-none',
            activeElement ? 'cursor-default' : 'cursor-pointer'
          )}
          handlers={{
            onClick: handleContainerClick,
            onMouseMove: handleMouseMove,
            onMouseUp: handleMouseUp,
            onMouseLeave: handleMouseUp,
            onTouchMove: handleMouseMove,
            onTouchEnd: handleMouseUp,
          }}
        >
          <HeroBannerImage
            src={imageUrl}
            alt=""
            positionX={imageSettings.positionX}
            positionY={imageSettings.positionY}
            scale={imageSettings.scale}
            eager
          />
          {hasOverlayText && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
          )}

          {renderDraggableElement('title', title, () => (
            <h2
              className={`w-max max-w-[1224px] text-4xl font-bold text-white leading-tight ${getTextAlign(getDisplayPosition('title').x)}`}
              style={textShadow}
            >
              {title}
            </h2>
          ))}

          {renderDraggableElement('subtitle', subtitle, () => (
            <p
              className={`w-max max-w-[1224px] text-lg text-white/90 ${getTextAlign(getDisplayPosition('subtitle').x)}`}
              style={textShadowSmall}
            >
              {subtitle}
            </p>
          ))}

          {renderDraggableElement('button', buttonText, () => (
            <Button className="h-10 px-6 text-base whitespace-nowrap pointer-events-none">
              {buttonText}
            </Button>
          ))}

          {!hasContent && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-white/70 text-2xl">
                Добавьте заголовок, подзаголовок или кнопку
              </p>
            </div>
          )}
        </ScaledFrame>

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

        <div className="p-4 bg-muted/50 rounded-lg space-y-4">
          <div className="flex items-center gap-2">
            <ZoomIn className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Кадрирование для компьютера</Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Картинка всегда заполняет баннер целиком. Позиция выбирает, какая часть остаётся в кадре, если пропорции фото отличаются от 1920 × 800.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Увеличение: {imageSettings.scale}%</Label>
              <Slider
                value={[imageSettings.scale]}
                onValueChange={([value]) => onImageSettingsChange({ ...imageSettings, scale: value })}
                min={100}
                max={200}
                step={5}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">По горизонтали: {imageSettings.positionX}%</Label>
              <Slider
                value={[imageSettings.positionX]}
                onValueChange={([value]) => onImageSettingsChange({ ...imageSettings, positionX: value })}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">По вертикали: {imageSettings.positionY}%</Label>
              <Slider
                value={[imageSettings.positionY]}
                onValueChange={([value]) => onImageSettingsChange({ ...imageSettings, positionY: value })}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Phone ---------- */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Телефон</p>
            <p className="text-xs text-muted-foreground">
              {mobileImageUrl
                ? 'Вертикальный баннер 4:5. Текст и кнопка выводятся внизу по центру.'
                : 'Без отдельной картинки для телефона баннер показывается в тех же пропорциях, что и на компьютере.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-[260px] shrink-0 rounded-[1.75rem] border-[6px] border-foreground/80 bg-background p-1 shadow">
            <div className="h-4" />
            <ScaledFrame
              virtualWidth={PHONE_VIRTUAL_WIDTH}
              aspect={mobileImageUrl ? MOBILE_ASPECT : DESKTOP_ASPECT}
              className="w-full bg-muted pointer-events-none"
            >
              {mobileImageUrl ? (
                <>
                  <HeroBannerImage
                    src={mobileImageUrl}
                    alt=""
                    positionX={mobileImageSettings.positionX}
                    positionY={mobileImageSettings.positionY}
                    eager
                  />
                  {hasOverlayText && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 px-6 pb-12 text-center">
                    {title && <h2 className="text-2xl font-bold leading-tight text-white" style={textShadow}>{title}</h2>}
                    {subtitle && <p className="text-sm text-white/90" style={textShadowSmall}>{subtitle}</p>}
                    {buttonText && <Button className="mt-1">{buttonText}</Button>}
                  </div>
                </>
              ) : (
                <>
                  <HeroBannerImage
                    src={imageUrl}
                    alt=""
                    positionX={imageSettings.positionX}
                    positionY={imageSettings.positionY}
                    scale={imageSettings.scale}
                    eager
                  />
                  {hasOverlayText && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  )}
                  {title && renderPositionedPhoneElement('title',
                    <h2 className={`text-base font-bold leading-tight text-white ${getTextAlign(positions.title.x)}`} style={textShadow}>{title}</h2>
                  )}
                  {subtitle && renderPositionedPhoneElement('subtitle',
                    <p className={`text-xs text-white/90 ${getTextAlign(positions.subtitle.x)}`} style={textShadowSmall}>{subtitle}</p>
                  )}
                  {buttonText && (
                    <div
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${positions.button.x}%`, top: `${positions.button.y}%` }}
                    >
                      <Button className="h-7 px-3 text-xs whitespace-nowrap">{buttonText}</Button>
                    </div>
                  )}
                </>
              )}
            </ScaledFrame>
            <div className="h-24 p-3 space-y-2">
              <div className="h-3 w-2/3 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          </div>

          {mobileImageUrl && (
            <div className="flex-1 w-full p-4 bg-muted/50 rounded-lg space-y-4">
              <Label className="text-sm font-medium">Кадрирование для телефона</Label>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">По горизонтали: {mobileImageSettings.positionX}%</Label>
                <Slider
                  value={[mobileImageSettings.positionX]}
                  onValueChange={([value]) => onMobileImageSettingsChange({ ...mobileImageSettings, positionX: value })}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">По вертикали: {mobileImageSettings.positionY}%</Label>
                <Slider
                  value={[mobileImageSettings.positionY]}
                  onValueChange={([value]) => onMobileImageSettingsChange({ ...mobileImageSettings, positionY: value })}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BannerPositionPreview;