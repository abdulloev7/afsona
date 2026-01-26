import { useMemo } from 'react';
import { CartItemCard } from './CartItemCard';
import { CATEGORY_GROUPS, type CartItem } from '@/contexts/CartContext';
import { Separator } from '@/components/ui/separator';

interface GroupedCartItemsProps {
  items: CartItem[];
  selectedItems: Set<string>;
  onToggleItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  getItemPrice: (item: CartItem) => number;
}

interface GroupedItems {
  groupKey: string;
  groupLabel: string;
  order: number;
  items: CartItem[];
}

export const GroupedCartItems = ({
  items,
  selectedItems,
  onToggleItem,
  onUpdateQuantity,
  onRemoveItem,
  getItemPrice,
}: GroupedCartItemsProps) => {
  // Group items by category when there are more than 5 items
  const shouldGroup = items.length > 5;

  const groupedItems = useMemo(() => {
    if (!shouldGroup) {
      return null;
    }

    const groups = new Map<string, GroupedItems>();

    items.forEach((item) => {
      const categorySlug = item.product.category?.slug || 'other';
      const categoryInfo = CATEGORY_GROUPS[categorySlug] || { label: 'Прочее', order: 99 };
      
      // Use a simplified group key for tools
      let groupKey = categorySlug;
      let groupLabel = categoryInfo.label;
      
      // Merge tool categories into one group
      if (['brushes-tools', 'rollers', 'spatulas-accessories'].includes(categorySlug)) {
        groupKey = 'tools';
        groupLabel = 'Инструменты';
      }

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          groupKey,
          groupLabel,
          order: categoryInfo.order,
          items: [],
        });
      }

      groups.get(groupKey)!.items.push(item);
    });

    // Sort groups by order and sort items within groups by brand, then by created_at
    return Array.from(groups.values())
      .sort((a, b) => a.order - b.order)
      .map((group) => ({
        ...group,
        items: group.items.sort((a, b) => {
          // Secondary sort: by brand (same brand together)
          const brandA = a.product.brand?.name || '';
          const brandB = b.product.brand?.name || '';
          if (brandA !== brandB) {
            return brandA.localeCompare(brandB);
          }
          // Tertiary sort: maintain LIFO order (newest first)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }),
      }));
  }, [items, shouldGroup]);

  // Render without grouping for 5 or fewer items
  if (!shouldGroup || !groupedItems) {
    return (
      <div className="space-y-3">
        {items.map((item) => (
          <CartItemCard
            key={item.id}
            item={item}
            isSelected={selectedItems.has(item.id)}
            onToggleSelect={() => onToggleItem(item.id)}
            onUpdateQuantity={(qty) => onUpdateQuantity(item.id, qty)}
            onRemove={() => onRemoveItem(item.id)}
            getItemPrice={getItemPrice}
          />
        ))}
      </div>
    );
  }

  // Render with category groups
  return (
    <div className="space-y-6">
      {groupedItems.map((group, groupIndex) => (
        <div key={group.groupKey}>
          {/* Group Header */}
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {group.groupLabel}
            </h3>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {group.items.length}
            </span>
            <Separator className="flex-1" />
          </div>

          {/* Group Items */}
          <div className="space-y-3">
            {group.items.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                isSelected={selectedItems.has(item.id)}
                onToggleSelect={() => onToggleItem(item.id)}
                onUpdateQuantity={(qty) => onUpdateQuantity(item.id, qty)}
                onRemove={() => onRemoveItem(item.id)}
                getItemPrice={getItemPrice}
              />
            ))}
          </div>

          {/* Separator between groups */}
          {groupIndex < groupedItems.length - 1 && (
            <div className="pt-4" />
          )}
        </div>
      ))}
    </div>
  );
};
