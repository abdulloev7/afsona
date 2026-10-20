import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CartItem } from '@/contexts/CartContext';

interface CartItemCardProps {
  item: CartItem;
  isSelected: boolean;
  onToggleSelect: () => void;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  getItemPrice: (item: CartItem) => number;
}

export const CartItemCard = ({
  item,
  isSelected,
  onToggleSelect,
  onUpdateQuantity,
  onRemove,
  getItemPrice,
}: CartItemCardProps) => {
  const itemPrice = getItemPrice(item);
  const totalPrice = itemPrice * item.quantity;
  const productUrl = `/product/${item.product_id}`;

  return (
    <Card 
      className={cn(
        "transition-all duration-200",
        isSelected && "ring-2 ring-primary/30 bg-primary/5"
      )}
    >
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelect}
            aria-label={`Выбрать «${item.product.name}» для заказа`}
          />
          {item.product.image && (
            <Link to={productUrl} className="shrink-0" tabIndex={-1} aria-hidden="true">
              <img 
                src={item.product.image} 
                alt=""
                className="w-16 h-16 object-cover rounded hover:opacity-80 transition-opacity cursor-pointer"
              />
            </Link>
          )}
          <div className="flex-1 min-w-0">
            <Link to={productUrl} className="hover:text-primary transition-colors">
              <h3 className="font-semibold truncate">{item.product.name}</h3>
            </Link>
            {item.selected_size && (
              <p className="text-sm text-muted-foreground">
                Объем: {item.selected_size}
              </p>
            )}
            {item.product.brand?.name && (
              <p className="text-xs text-muted-foreground">
                {item.product.brand.name}
              </p>
            )}
            {item.quantity > 1 ? (
              <div>
                <p className="text-sm text-muted-foreground">
                  {item.quantity} × {itemPrice.toLocaleString('ru-RU')} сом.
                </p>
                <p className="text-lg font-bold">
                  {totalPrice.toLocaleString('ru-RU')} сом.
                </p>
              </div>
            ) : (
              <p className="text-lg font-bold">
                {itemPrice.toLocaleString('ru-RU')} сом.
              </p>
            )}
          </div>
          {/* On phones the controls drop to their own row so the name keeps its width */}
          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              aria-label="Уменьшить количество"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-medium" aria-live="polite">
              <span className="sr-only">Количество: </span>
              {item.quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              aria-label="Увеличить количество"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="ml-2 text-muted-foreground hover:text-destructive"
              aria-label={`Удалить «${item.product.name}» из корзины`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
