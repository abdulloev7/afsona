import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ShoppingBag, Package } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

import { useToast } from '@/hooks/use-toast';
import { ProductSizeSelector } from './ProductSizeSelector';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    image?: string | null;
    features?: string[] | null;
    eco?: boolean | null;
    brand?: string | null;
    brand_id?: string | null;
    sizes?: string[] | null;
    size_variants?: { volume: string; price: number }[] | null;
    in_stock: boolean;
    image_fit?: 'cover' | 'contain';
    media?: { type: 'image' | 'video'; url: string; caption?: string; fit?: 'cover' | 'contain' }[] | null;
  };
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const [isInCart, setIsInCart] = useState(false);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const { toast } = useToast();

  const productUrl = `/product/${product.id}`;

  // Check if product has multiple variants requiring selection
  const productHasVariants = 
    (product.size_variants && product.size_variants.length > 0) ||
    (product.sizes && product.sizes.length > 1);

  const handleAddToCart = async () => {
    // Если у товара есть варианты, показать диалог выбора
    if (productHasVariants) {
      setShowSizeSelector(true);
      return;
    }
    
    // Если размер один или нет размеров, добавить сразу
    const size = product.sizes?.[0] || null;
    try {
      await addToCart(product.id, 1, size);
      setIsInCart(true);
      toast({
        title: "Успешно!",
        description: "Товар добавлен в корзину",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить товар в корзину",
        variant: "destructive",
      });
    }
  };

  const handleSizeSelected = async (size: string, quantity: number) => {
    try {
      await addToCart(product.id, quantity, size);
      setShowSizeSelector(false);
      setIsInCart(true);
      toast({
        title: "Успешно!",
        description: "Товар добавлен в корзину",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить товар в корзину",
        variant: "destructive",
      });
    }
  };

  const handleGoToCart = () => {
    navigate('/cart');
  };

  // Объединяем старое изображение с медиа для единой галереи
  const allMedia = [];
  if (product.image) {
    allMedia.push({
      type: 'image' as const,
      url: product.image,
      fit: product.image_fit || 'cover'
    });
  }
  if (product.media) {
    allMedia.push(...product.media);
  }

  const firstMedia = allMedia[0];

  const priceText = (() => {
    if (product.size_variants && product.size_variants.length > 0) {
      const prices = product.size_variants.map(v => v.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      return minPrice === maxPrice
        ? `${minPrice.toLocaleString('ru-RU')} сом.`
        : `от ${minPrice.toLocaleString('ru-RU')} сом.`;
    }
    return `${product.price.toLocaleString('ru-RU')} сом.`;
  })();

  return (
    <Card className="flex flex-col overflow-hidden hover:border-primary/50 transition-colors">
      <Link
        to={productUrl}
        className="block aspect-square w-full bg-white"
        aria-label={product.name}
        tabIndex={-1}
      >
        {firstMedia ? (
          firstMedia.type === 'image' ? (
            <img
              src={firstMedia.url}
              alt=""
              loading="lazy"
              className={`h-full w-full ${firstMedia.fit === 'contain' ? 'object-contain p-2' : 'object-cover'}`}
            />
          ) : (
            <video
              src={firstMedia.url}
              className={`h-full w-full ${firstMedia.fit === 'contain' ? 'object-contain p-2' : 'object-cover'}`}
            />
          )
        ) : (
          <span className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Package className="h-10 w-10" strokeWidth={1.25} />
          </span>
        )}
      </Link>
      <CardContent className="flex-1 flex flex-col p-3 sm:p-5">
        <CardTitle className="text-sm sm:text-base font-medium leading-snug">
          <Link to={productUrl} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </CardTitle>
        {product.brand && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{product.brand}</p>
        )}
        <p className="text-lg sm:text-xl font-semibold text-foreground mt-2">{priceText}</p>

        <div className="mt-auto pt-3">
          {productHasVariants || !isInCart ? (
            <Button
              className="w-full"
              size="sm"
              onClick={handleAddToCart}
              disabled={!product.in_stock}
            >
              <ShoppingCart className="h-4 w-4 mr-1.5" />
              {product.in_stock ? 'В корзину' : 'Нет в наличии'}
            </Button>
          ) : (
            <Button className="w-full" size="sm" onClick={handleGoToCart} variant="secondary">
              <ShoppingBag className="h-4 w-4 mr-1.5" />
              Заказать
            </Button>
          )}
        </div>
      </CardContent>

      <ProductSizeSelector
        product={product}
        isOpen={showSizeSelector}
        onClose={() => setShowSizeSelector(false)}
        onAddToCart={handleSizeSelected}
      />
    </Card>
  );
};
