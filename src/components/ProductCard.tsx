import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Leaf, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
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

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Если у товара есть несколько размеров, показать диалог
    if (product.sizes && product.sizes.length > 1) {
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

  return (
    <Card className="flex flex-col shadow-card hover:shadow-brand transition-all duration-300 hover:-translate-y-1">
      <CardHeader>
        {product.media && product.media.length > 0 ? (
          <div 
            className="bg-white rounded-lg p-2 mb-4 cursor-pointer hover:opacity-90 transition-opacity" 
            onClick={handleImageClick}
          >
            {product.media[0].type === 'image' ? (
              <img 
                src={product.media[0].url} 
                alt={product.name}
                className={`w-full h-48 rounded-lg ${
                  product.media[0].fit === 'contain' 
                    ? 'object-contain' 
                    : 'object-cover'
                }`}
              />
            ) : (
              <video 
                src={product.media[0].url}
                className={`w-full h-48 rounded-lg ${
                  product.media[0].fit === 'contain' 
                    ? 'object-contain' 
                    : 'object-cover'
                }`}
              />
            )}
          </div>
        ) : product.image ? (
          <div 
            className="bg-white rounded-lg p-2 mb-4 cursor-pointer hover:opacity-90 transition-opacity" 
            onClick={handleImageClick}
          >
            <img 
              src={product.image} 
              alt={product.name}
              className={`w-full h-48 rounded-lg ${
                product.image_fit === 'contain' 
                  ? 'object-contain' 
                  : 'object-cover'
              }`}
            />
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
        {product.description && (
          <p className="text-muted-foreground mb-4">{product.description}</p>
        )}
        
        <div className="text-2xl font-bold mb-4 text-primary">
          {product.size_variants && product.size_variants.length > 0 ? (
            (() => {
              const prices = product.size_variants.map(v => v.price);
              const minPrice = Math.min(...prices);
              const maxPrice = Math.max(...prices);
              return minPrice === maxPrice 
                ? `${minPrice.toLocaleString('ru-RU')} сом.`
                : `от ${minPrice.toLocaleString('ru-RU')} до ${maxPrice.toLocaleString('ru-RU')} сом.`;
            })()
          ) : (
            `${product.price.toLocaleString('ru-RU')} сом.`
          )}
        </div>
        
        {product.brand && (
          <p className="text-sm text-muted-foreground mb-2">
            <strong>Бренд:</strong> {product.brand}
          </p>
        )}
        
        {product.features && product.features.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Особенности:</h4>
            <ul className="space-y-1">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {(product.size_variants && product.size_variants.length > 0) ? (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Доступные объемы:</h4>
            <div className="flex flex-wrap gap-2">
              {product.size_variants.map((variant, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {variant.volume} - {variant.price} сом
                </Badge>
              ))}
            </div>
          </div>
        ) : product.sizes && product.sizes.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Доступные объемы:</h4>
            <div className="flex flex-wrap gap-1">
              {product.sizes.map((size, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {size}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-auto pt-4">
          {product.sizes && product.sizes.length > 1 ? (
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
