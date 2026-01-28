import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
}

const BrandsPreview = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('id, name, slug, logo')
        .order('display_order', { ascending: true })
        .limit(4);

      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 px-4" id="brands">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <Skeleton className="h-10 w-48 mx-auto mb-4" />
            <Skeleton className="h-5 w-80 mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
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
    <section className="py-16 px-4" id="brands">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">Наши бренды</h2>
          <p className="text-muted-foreground">
            Работаем с ведущими производителями
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {brands.map((brand) => (
            <Card 
              key={brand.id} 
              className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => navigate(`/brands/${brand.slug}`)}
            >
              <CardContent className="p-4">
                {brand.logo ? (
                  <div className="aspect-[3/2] bg-white rounded-lg overflow-hidden flex items-center justify-center p-3">
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                ) : (
                  <div className="aspect-[3/2] bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-muted-foreground">{brand.name[0]}</span>
                  </div>
                )}
                <p className="text-center font-medium mt-2 text-sm">{brand.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to="/brands">
            <Button variant="outline" size="lg">
              Все бренды
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BrandsPreview;
