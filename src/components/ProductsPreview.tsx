import { ArrowRight } from "lucide-react";
import CategoryTile from "@/components/CategoryTile";
import { sortCategories } from "@/lib/categories";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Category {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
}

const ProductsPreview = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*');

      if (categoriesError) throw categoriesError;

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

      const sortedCategories = sortCategories(categoriesWithCount);

      setCategories(sortedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="products" className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <Skeleton className="h-9 w-48 mb-6" />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[16/13] rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between gap-4 mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">Каталог</h2>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4"
          >
            Весь каталог
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {categories.map((category) => (
            <CategoryTile
              key={category.id}
              name={category.name}
              slug={category.slug}
              productCount={category.productCount}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsPreview;
