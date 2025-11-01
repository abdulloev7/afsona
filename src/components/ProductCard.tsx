import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Leaf, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/locales/translations';

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
    sizes?: string[] | null;
    in_stock: boolean;
    image_fit?: 'cover' | 'contain';
  };
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const [isInCart, setIsInCart] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = (key: any) => getTranslation(language, key);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    try {
      await addToCart(product.id, 1);
      setIsInCart(true);
      toast({
        title: t('addedToCart').split(' ')[0] + '!',
        description: t('addedToCart'),
      });
    } catch (error) {
      toast({
        title: t('errorAddingToCart').split(' ')[0],
        description: t('errorAddingToCart'),
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
        {product.image ? (
          <div className="bg-muted rounded-lg p-2 mb-4">
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
          <div className="w-full h-48 bg-muted rounded-lg mb-4 flex items-center justify-center">
            <span className="text-muted-foreground">Фото скоро появится</span>
          </div>
        )}
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{product.name}</CardTitle>
          {product.eco && (
            <Badge variant="secondary" className="ml-2">
              <Leaf className="h-3 w-3 mr-1" />
              {t('ecoFriendlyProduct').split(' ')[0]}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {product.description && (
          <p className="text-muted-foreground mb-4">{product.description}</p>
        )}
        
        <div className="text-2xl font-bold mb-4 text-primary">
          {product.price.toLocaleString('ru-RU')} {t('som')}
        </div>
        
        {product.features && product.features.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">{t('features')}:</h4>
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

        {product.sizes && product.sizes.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">{t('availableSizes')}:</h4>
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
          {!isInCart ? (
            <Button 
              className="w-full" 
              onClick={handleAddToCart}
              disabled={!product.in_stock}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.in_stock ? t('addToCart') : t('outOfStock')}
            </Button>
          ) : (
            <Button 
              className="w-full" 
              onClick={handleGoToCart}
              variant="secondary"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              {t('order')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
