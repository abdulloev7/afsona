import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  country: string | null;
  established_year: number | null;
  display_order: number;
  productCount?: number;
}

const BrandsPage = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      // Fetch product count for each brand
      const brandsWithCount = await Promise.all(
        (data || []).map(async (brand) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('brand_id', brand.id)
            .eq('archived', false);
          
          return {
            ...brand,
            productCount: count || 0
          };
        })
      );

      setBrands(brandsWithCount);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить бренды",
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
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Skeleton className="h-12 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader>
                    <Skeleton className="h-40 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-5/6" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">
              Наши бренды
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Мы работаем с ведущими производителями строительных и отделочных материалов. 
              Каждый бренд в нашем каталоге — это гарантия качества и надёжности.
            </p>
          </div>

          {brands.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Бренды пока не добавлены.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {brands.map((brand) => (
                <Card 
                  key={brand.id} 
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1"
                  onClick={() => navigate(`/brands/${brand.slug}`)}
                >
                  <CardHeader className="p-6">
                    {brand.logo ? (
                      <div className="aspect-video bg-white rounded-lg overflow-hidden flex items-center justify-center p-6 border">
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-4xl font-bold text-muted-foreground">{brand.name[0]}</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="px-6">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-xl">{brand.name}</CardTitle>
                      <Badge variant="secondary">
                        {brand.productCount} {brand.productCount === 1 ? 'товар' : brand.productCount && brand.productCount < 5 ? 'товара' : 'товаров'}
                      </Badge>
                    </div>
                    {brand.description && (
                      <CardDescription className="line-clamp-3 mb-3">
                        {brand.description}
                      </CardDescription>
                    )}
                    {(brand.country || brand.established_year) && (
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        {brand.country && (
                          <Badge variant="outline">{brand.country}</Badge>
                        )}
                        {brand.established_year && (
                          <Badge variant="outline">с {brand.established_year} года</Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="px-6 pb-6">
                    <Button 
                      variant="outline" 
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      Смотреть продукцию
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* Info Section */}
          <div className="mt-16 bg-card border rounded-lg p-8 max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4 text-primary">Партнёрство с лучшими</h2>
            <p className="text-muted-foreground mb-6">
              Мы тщательно отбираем каждого партнёра, чтобы предложить вам только проверенные временем 
              и качеством бренды. Все представленные производители имеют международные сертификаты 
              и подтверждённую репутацию.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4">
                <div className="text-3xl font-bold text-accent mb-1">{brands.length}+</div>
                <div className="text-sm text-muted-foreground">Брендов</div>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-accent mb-1">500+</div>
                <div className="text-sm text-muted-foreground">Товаров</div>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-accent mb-1">100%</div>
                <div className="text-sm text-muted-foreground">Качество</div>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-accent mb-1">ECO</div>
                <div className="text-sm text-muted-foreground">Сертификация</div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BrandsPage;
