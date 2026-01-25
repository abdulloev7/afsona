import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

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
  rating: number | null;
  reviews_count: number | null;
  size_variants?: { volume: string; price: number }[] | null;
}

interface FeaturedProductCardProps {
  product: FeaturedProduct;
}

const TAG_STYLES: Record<string, string> = {
  'Хит': 'bg-primary text-primary-foreground',
  'Советуем': 'bg-orange-500 text-white',
  'Новинка': 'bg-purple-500 text-white',
  'Акция': 'bg-yellow-400 text-yellow-900',
  'Эко': 'bg-green-100 text-green-800',
};

export function FeaturedProductCard({ product }: FeaturedProductCardProps) {
  const { addToCart } = useCart();
  
  const displayPrice = product.size_variants?.[0]?.price ?? product.price;
  const discountPercent = product.old_price 
    ? Math.round(((product.old_price - displayPrice) / product.old_price) * 100)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1, product.size_variants?.[0]?.volume);
  };

  return (
    <Link 
      to={`/product/${product.id}`}
      className="group block bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-white p-4">
        {/* Tags */}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
          {product.tags?.map((tag) => (
            <span 
              key={tag}
              className={`px-2 py-0.5 text-xs font-semibold rounded ${TAG_STYLES[tag] || 'bg-muted text-muted-foreground'}`}
            >
              {tag}
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
            alt={product.name}
            className={`w-full h-full ${product.image_fit === 'contain' ? 'object-contain' : 'object-cover'} group-hover:scale-105 transition-transform duration-300`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted rounded">
            <span className="text-muted-foreground text-4xl">📦</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-foreground">
            {displayPrice.toLocaleString('ru-RU')} сом
          </span>
          {product.old_price && (
            <span className="text-sm text-muted-foreground line-through">
              {product.old_price.toLocaleString('ru-RU')} сом
            </span>
          )}
        </div>

        {/* Name */}
        <h3 className="font-medium text-foreground line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Rating */}
        {product.rating && product.rating > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{product.rating.toFixed(1)}</span>
            {product.reviews_count && product.reviews_count > 0 && (
              <span className="text-muted-foreground">
                ({product.reviews_count} отзывов)
              </span>
            )}
          </div>
        )}

        {/* Stock Status */}
        <div className="flex items-center gap-1.5 text-sm">
          {product.in_stock ? (
            <>
              <Check className="h-4 w-4 text-primary" />
              <span className="text-primary font-medium">В наличии</span>
            </>
          ) : (
            <span className="text-muted-foreground">Нет в наличии</span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={!product.in_stock}
          className="w-full gap-2 bg-primary hover:bg-primary/90"
        >
          <ShoppingCart className="h-4 w-4" />
          В корзину
        </Button>
      </div>
    </Link>
  );
}
