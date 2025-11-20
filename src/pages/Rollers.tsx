import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from '@/components/ProductCard';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  features: string[] | null;
  eco: boolean | null;
  brand: string | null;
  sizes: string[] | null;
  in_stock: boolean;
}

const Rollers = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', 'rollers')
        .single();

      if (categoryError) throw categoryError;

      const { data, error } = await (supabase
        .from('products')
        .select('*')
        .eq('category_id', category.id) as any)
        .eq('archived', false)
        .eq('in_stock', true);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить товары",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
              size="sm" 
              className="mb-6"
              onClick={() => {
                sessionStorage.setItem('afsona-scroll-target', 'products');
                navigate('/#products');
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к ассортименту
            </Button>
            <h1 className="text-4xl font-bold mb-4">Валики</h1>
            <p className="text-muted-foreground text-lg">
              Профессиональные валики для качественной покраски
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
              Наши специалисты помогут подобрать подходящие валики
            </p>
            <Button size="lg" onClick={() => window.open('tel:+992927557919')}>
              Получить консультацию
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Rollers;
