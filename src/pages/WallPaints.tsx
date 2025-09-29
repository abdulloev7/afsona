import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingCart, Leaf } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  features: string[];
  eco: boolean;
  brand: string;
  sizes: string[];
  in_stock: boolean;
}

const WallPaints = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchWallPaints();
  }, []);

  const fetchWallPaints = async () => {
    try {
      // First get the wall-paints category ID
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', 'wall-paints')
        .single();

      if (categoryError) throw categoryError;

      // Then fetch products for this category
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', category.id)
        .eq('in_stock', true);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching wall paints:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить товары",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    await addToCart(productId, 1);
  };

  const handleOrderCall = () => {
    window.open('tel:+992927557919', '_self');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex-1 py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="py-16">Загружаем товары...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к ассортименту
            </Button>
            
            <h1 className="text-4xl font-bold mb-4">Краски для стен</h1>
            <p className="text-muted-foreground text-lg">
              Качественные краски для внутренних стен с различными финишами и свойствами
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {products.map((product) => (
              <Card key={product.id} className="flex flex-col">
                <CardHeader>
                  {product.image && (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
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
                  <p className="text-muted-foreground mb-4">{product.description}</p>
                  
                  <div className="text-2xl font-bold mb-4 text-primary">
                    {product.price.toLocaleString('ru-RU')} сом.
                  </div>
                  
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
                  
                  <div className="mt-auto pt-4 space-y-2">
                    <Button 
                      className="w-full" 
                      onClick={() => handleAddToCart(product.id)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      В корзину
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleOrderCall}
                    >
                      Заказать по телефону
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center bg-muted/50 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Нужна консультация?</h2>
            <p className="text-muted-foreground mb-6">
              Наши специалисты помогут выбрать подходящую краску для ваших задач
            </p>
            <Button onClick={handleOrderCall} size="lg">
              Связаться: +992 927 55 79 19
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WallPaints;