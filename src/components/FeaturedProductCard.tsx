import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

import { useToast } from '@/hooks/use-toast';
import { ProductSizeSelector } from './ProductSizeSelector';
import { formatPrice, localized, t } from "@/i18n";

interface FeaturedProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  old_price: number | null;
  image: string | null;
  image_fit?: 'cover' | 'contain';
  in_stock: boolean;
  tags: string[] | null;
  size_variants?: { volume: string; price: number }[] | null;
}

interface FeaturedProductCardProps {
  product: FeaturedProduct;
}

const TAG_STYLES: Record<string, string> = {
  'Хит': 'bg-primary text-primary-foreground',
  'Советуем': 'bg-brand-green-dark text-primary-foreground',
  'Новинка': 'bg-background text-primary ring-1 ring-inset ring-primary/40',
  'Акция': 'bg-sale text-white',
  'Эко': 'bg-primary/10 text-primary',
};

// Tags are stored in Russian; t() shows them in the visitor's language.
// At most two labels per card, most important first, so the labels still mean something.
const TAG_PRIORITY = ['Акция', 'Хит', 'Новинка', 'Советуем', 'Эко'];
const MAX_TAGS = 2;

export function FeaturedProductCard({ product }: FeaturedProductCardProps) {
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const { toast } = useToast();
  
  const displayPrice = product.size_variants?.[0]?.price ?? product.price;
  const discountPercent = product.old_price 
    ? Math.round(((product.old_price - displayPrice) / product.old_price) * 100)
    : null;

  // Check if product has variants requiring selection
  const productHasVariants = product.size_variants && product.size_variants.length > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has variants, show selector dialog
    if (productHasVariants) {
      setShowSizeSelector(true);
      return;
    }
    
    // Add product without variants directly
    addToCart(product.id, 1, null);
    toast({
      title: t("Успешно!"),
      description: t("Товар добавлен в корзину"),
    });
  };

  const handleSizeSelected = async (size: string, quantity: number) => {
    try {
      await addToCart(product.id, quantity, size);
      setShowSizeSelector(false);
      toast({
        title: t("Успешно!"),
        description: t("Товар добавлен в корзину"),
      });
    } catch (error) {
      toast({
        title: t("Ошибка"),
        description: t("Не удалось добавить товар в корзину"),
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Link 
        to={`/product/${product.id}`}
        className="group flex flex-col h-full bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      >
        {/* Image Container */}
        <div className="relative aspect-square bg-white p-3 sm:p-4 flex-shrink-0">
          {/* Tags */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 right-2 z-10 flex flex-wrap gap-1">
            {[...(product.tags ?? [])]
              .sort((a, b) => (TAG_PRIORITY.indexOf(a) + 1 || 99) - (TAG_PRIORITY.indexOf(b) + 1 || 99))
              .slice(0, MAX_TAGS)
              .map((tag) => (
              <span 
                key={tag}
                className={`px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs font-semibold rounded ${TAG_STYLES[tag] || 'bg-muted text-muted-foreground'}`}
              >
                {t(tag)}
              </span>
            ))}
          </div>

          {/* Discount Badge */}
          {discountPercent && discountPercent > 0 && (
            <div className="absolute top-3 right-3 z-10 bg-destructive text-destructive-foreground px-2 py-1 rounded-lg text-sm font-bold">
              -{discountPercent}%
            </div>
          )}

          {/* Product Image */}
          {product.image ? (
            <img
              src={product.image}
              alt={localized(product, 'name')}
              className={`w-full h-full ${product.image_fit === 'contain' ? 'object-contain' : 'object-cover'} group-hover:scale-105 transition-transform duration-300`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted rounded">
              <Package className="h-10 w-10 text-muted-foreground/60" />
            </div>
          )}
        </div>

        {/* Content - flex-1 to fill remaining space */}
        <div className="flex-1 flex flex-col p-3 sm:p-4">
          {/* Price */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg sm:text-xl font-bold text-foreground">
              {formatPrice(displayPrice)}
            </span>
            {product.old_price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.old_price)}
              </span>
            )}
          </div>

          {/* Name - allow 3 lines for full visibility */}
          <h3 className="text-sm sm:text-base font-medium text-foreground line-clamp-3 min-h-[3.75rem] mb-2 group-hover:text-primary transition-colors">
            {localized(product, 'name')}
          </h3>

          {/* Stock Status */}
          <div className="flex items-center gap-1.5 text-sm mb-4">
            {product.in_stock ? (
              <>
                <Check className="h-4 w-4 text-primary" />
                <span className="text-primary font-medium">{t("В наличии")}</span>
              </>
            ) : (
              <span className="text-muted-foreground">{t("Нет в наличии")}</span>
            )}
          </div>

          {/* Add to Cart Button - pushed to bottom */}
          <div className="mt-auto">
            <Button
              onClick={handleAddToCart}
              disabled={!product.in_stock}
              className="w-full gap-2 px-2 bg-primary hover:bg-primary/90"
            >
              <ShoppingCart className="h-4 w-4" />
              {t("В корзину")}
            </Button>
          </div>
        </div>
      </Link>

      {/* Size Selector Dialog */}
      <ProductSizeSelector
        product={product}
        isOpen={showSizeSelector}
        onClose={() => setShowSizeSelector(false)}
        onAddToCart={handleSizeSelected}
      />
    </>
  );
}
