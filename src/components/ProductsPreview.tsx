import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Paintbrush, Hammer, Droplets, Palette, Wrench, Layers } from "lucide-react";
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

      const priorityOrder: Record<string, number> = {
        'paints-and-coatings': 1,
        'decorative-coatings': 2,
        'primers-preparatory': 3,
        'adhesives-sealants': 4,
        'brushes-tools': 5,
        'rollers': 6
      };

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

      const sortedCategories = categoriesWithCount
        .sort((a, b) => {
          const priorityA = priorityOrder[a.slug] || 999;
          const priorityB = priorityOrder[b.slug] || 999;
          return priorityA - priorityB;
        })
        .slice(0, 6);

      setCategories(sortedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLink = (slug: string) => {
    const routeMap: Record<string, string> = {
      'paints-and-coatings': '/paints-coatings',
      'adhesives-sealants': '/adhesives-sealants',
      'primers-preparatory': '/primers',
      'putties-leveling': '/putties-leveling',
      'decorative-coatings': '/decorative-coatings',
      'tints-thinners': '/tints-thinners',
      'waterproofing': '/waterproofing',
      'brushes-tools': '/brushes-tools',
      'rollers': '/rollers',
      'spatulas-accessories': '/spatulas-accessories'
    };
    return routeMap[slug] || '/paints-coatings';
  };

  const getCategoryIcon = (slug: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'paints-and-coatings': <Paintbrush className="w-6 h-6" />,
      'decorative-coatings': <Palette className="w-6 h-6" />,
      'primers-preparatory': <Layers className="w-6 h-6" />,
      'adhesives-sealants': <Droplets className="w-6 h-6" />,
      'brushes-tools': <Hammer className="w-6 h-6" />,
      'rollers': <Wrench className="w-6 h-6" />,
    };
    return iconMap[slug] || <Paintbrush className="w-6 h-6" />;
  };

  if (loading) {
    return (
      <section id="products" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
            Наш ассортимент
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Широкий выбор качественных материалов для любых задач
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {categories.map((category) => (
            <Link key={category.id} to={getCategoryLink(category.slug)}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group text-center">
                <CardContent className="p-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {getCategoryIcon(category.slug)}
                  </div>
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">{category.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {category.productCount} товаров
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link to="/catalog">
            <Button size="lg">
              Весь каталог
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductsPreview;
