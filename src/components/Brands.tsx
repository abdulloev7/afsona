import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  country: string | null;
  established_year: number | null;
  display_order: number;
}

const Brands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setBrands(data || []);
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
      <section className="py-20 px-4" id="brands">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Наши бренды</h2>
            <p className="text-lg opacity-80 max-w-2xl mx-auto">
              Мы работаем с ведущими производителями строительных и отделочных материалов
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader>
                  <Skeleton className="h-32 w-full" />
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
      </section>
    );
  }

  if (brands.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4" id="brands">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Наши бренды</h2>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            Мы работаем с ведущими производителями строительных и отделочных материалов
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {brands.map((brand) => (
            <Card 
              key={brand.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => navigate(`/brands/${brand.slug}`)}
            >
              <CardHeader className="p-6">
                {brand.logo ? (
                  <div className="aspect-video bg-white rounded-lg overflow-hidden flex items-center justify-center p-4">
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-3xl font-bold text-muted-foreground">{brand.name[0]}</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="px-6">
                <CardTitle className="mb-2">{brand.name}</CardTitle>
                {brand.description && (
                  <CardDescription className="line-clamp-3 mb-2">
                    {brand.description}
                  </CardDescription>
                )}
                {(brand.country || brand.established_year) && (
                  <div className="text-sm text-muted-foreground">
                    {brand.country && <span>{brand.country}</span>}
                    {brand.country && brand.established_year && <span> • </span>}
                    {brand.established_year && <span>с {brand.established_year}</span>}
                  </div>
                )}
              </CardContent>
              <CardFooter className="px-6 pb-6">
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Смотреть продукцию
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Brands;
