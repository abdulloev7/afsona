import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from '@/components/ProductCard';
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
              <ProductCard key={product.id} product={product} />
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