import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  website: string | null;
  country: string | null;
  established_year: number | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string | null;
  features: string[] | null;
  eco: boolean;
  sizes: string[] | null;
  in_stock: boolean;
}

const BrandPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (slug) {
      fetchBrandAndProducts();
    }
  }, [slug]);

  const fetchBrandAndProducts = async () => {
    try {
      setLoading(true);

      // Fetch brand
      const { data: brandData, error: brandError } = await supabase
        .from('brands' as any)
        .select('*')
        .eq('slug', slug)
        .maybeSingle() as any;

      if (brandError) throw brandError;
      
      if (!brandData) {
        toast({
          title: "Бренд не найден",
          description: "Бренд с таким именем не существует",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setBrand(brandData);

      // Fetch products for this brand
      const query = supabase
        .from('products' as any)
        .select('*')
        .eq('brand_id', brandData.id)
        .eq('in_stock', true);
      
      const { data: productsData, error: productsError } = await query as any;

      if (productsError) throw productsError;
      
      // Filter out archived products
      setProducts((productsData || []).filter((p: any) => !p.archived));
    } catch (error) {
      console.error('Error fetching brand data:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные бренда",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <Skeleton className="h-64 w-full mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-96" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!brand) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-background/95">
        {/* Brand Hero Section */}
        <section className="py-12 px-4 border-b">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Logo */}
              <div className="md:col-span-1">
                {brand.logo ? (
                  <div className="aspect-square bg-white rounded-lg overflow-hidden flex items-center justify-center p-8 shadow-sm">
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-6xl font-bold text-muted-foreground">{brand.name[0]}</span>
                  </div>
                )}
              </div>

              {/* Brand Info */}
              <div className="md:col-span-2">
                <h1 className="text-4xl font-bold mb-4">{brand.name}</h1>
                {brand.description && (
                  <p className="text-lg opacity-80 mb-4">{brand.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm">
                  {brand.country && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Страна:</span>
                      <span>{brand.country}</span>
                    </div>
                  )}
                  {brand.established_year && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Основан:</span>
                      <span>{brand.established_year}</span>
                    </div>
                  )}
                  {brand.website && (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <span>Официальный сайт</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Продукция {brand.name}</h2>
            
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg opacity-70">
                  В настоящее время нет товаров этого бренда в каталоге
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BrandPage;
