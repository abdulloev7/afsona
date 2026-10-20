import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import CategoryTile from "@/components/CategoryTile";
import { pluralizeProducts, sortCategories } from "@/lib/categories";
import { useToast } from "@/hooks/use-toast";
import { useSeo } from "@/hooks/useSeo";

interface Category {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  productCount?: number;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
}

const Catalog = () => {
  useSeo({
    title: 'Каталог красок и материалов для ремонта',
    description: 'Каталог AFSONA: интерьерные и фасадные краски, грунтовки, декоративные штукатурки, клеи, герметики и малярный инструмент. Цены и наличие, магазины в Душанбе и Худжанде.',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*');

      if (categoriesError) throw categoriesError;

      // Fetch product count for each category
      const categoriesWithCount = await Promise.all(
        (categoriesData || []).map(async (category) => {
          const { count } = await (supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id) as any)
            .eq('archived', false);
          
          return {
            ...category,
            productCount: count || 0
          };
        })
      );

      setCategories(sortCategories(categoriesWithCount));

      // Fetch brands
      const { data: brandsData, error: brandsError } = await supabase
        .from('brands')
        .select('id, name, slug, logo')
        .order('display_order', { ascending: true });

      if (brandsError) throw brandsError;
      setBrands(brandsData || []);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные каталога",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalProducts = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <Skeleton className="h-10 w-48 mb-3" />
            <Skeleton className="h-5 w-72 mb-10" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-[72px] rounded-lg" />
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
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-2">Каталог</h1>
            <p className="text-muted-foreground">
              {totalProducts} {pluralizeProducts(totalProducts)} в {categories.length} категориях
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-12">
            {categories.map((category) => (
              <CategoryTile
                key={category.id}
                name={category.name}
                slug={category.slug}
                productCount={category.productCount}
              />
            ))}
          </div>

          {brands.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Бренды</h2>
              <div className="flex flex-wrap gap-2">
                {brands.map((brand) => (
                  <Link
                    key={brand.id}
                    to={`/brands/${brand.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    {brand.logo && (
                      <img src={brand.logo} alt="" className="h-5 w-5 rounded-sm object-contain" />
                    )}
                    {brand.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Catalog;
