import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Leaf, ShoppingBag } from 'lucide-react';
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
  const { user } = useAuth();
  const { toast } = useToast();

  const handleImageClick = () => {
    navigate(`/product/${product.id}`);
  };

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

  return (
    <Card className="flex flex-col shadow-card hover:shadow-brand transition-all duration-300 hover:-translate-y-1">
      <CardHeader>
        {firstMedia ? (
          <div 
            className="bg-white rounded-lg p-2 mb-4 cursor-pointer hover:opacity-90 transition-opacity" 
            onClick={handleImageClick}
          >
            {firstMedia.type === 'image' ? (
              <img 
                src={firstMedia.url} 
                alt={product.name}
                className={`w-full h-48 rounded-lg ${
                  firstMedia.fit === 'contain' 
                    ? 'object-contain' 
                    : 'object-cover'
                }`}
              />
            ) : (
              <video 
                src={firstMedia.url}
                className={`w-full h-48 rounded-lg ${
                  firstMedia.fit === 'contain' 
                    ? 'object-contain' 
                    : 'object-cover'
                }`}
              />
            )}
          </div>
        ) : (
          <div 
            className="w-full h-48 bg-white rounded-lg mb-4 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
            onClick={handleImageClick}
          >
            <span className="text-muted-foreground">Фото скоро появится</span>
          </div>
        )}
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{product.name}</CardTitle>
          {product.eco && (
            <Badge variant="secondary" className="ml-2">
              <Leaf className="h-3 w-3 mr-1" />
              ЭКО
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="text-2xl font-bold mb-2 text-primary">
          {product.size_variants && product.size_variants.length > 0 ? (
            (() => {
              const prices = product.size_variants.map(v => v.price);
              const minPrice = Math.min(...prices);
              const maxPrice = Math.max(...prices);
              return minPrice === maxPrice 
                ? `${minPrice.toLocaleString('ru-RU')} сом.`
                : `от ${minPrice.toLocaleString('ru-RU')} сом.`;
            })()
          ) : (
            `${product.price.toLocaleString('ru-RU')} сом.`
          )}
        </div>
        
        {product.brand && (
          <p className="text-sm text-muted-foreground mb-2">
            {product.brand}
          </p>
        )}
        
        <div className="mt-auto pt-4">
          {productHasVariants ? (
            <Button 
              className="w-full" 
              onClick={handleAddToCart}
              disabled={!product.in_stock}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.in_stock ? 'Добавить в корзину' : 'Нет в наличии'}
            </Button>
          ) : !isInCart ? (
            <Button 
              className="w-full" 
              onClick={handleAddToCart}
              disabled={!product.in_stock}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.in_stock ? 'Добавить в корзину' : 'Нет в наличии'}
            </Button>
          ) : (
            <Button 
              className="w-full" 
              onClick={handleGoToCart}
              variant="secondary"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
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
