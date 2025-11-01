import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/locales/translations";

interface Category {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  productCount?: number;
}

const Products = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = (key: any) => getTranslation(language, key);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*');

      if (categoriesError) throw categoriesError;

      // Define category priority order
      const priorityOrder: Record<string, number> = {
        'paints-and-coatings': 1,
        'decorative-coatings': 2,
        'tints-thinners': 3,
        'primers-preparatory': 4,
        'putties-leveling': 5,
        'adhesives-sealants': 6,
        'waterproofing': 7,
        'brushes-tools': 8,
        'rollers': 9,
        'spatulas-accessories': 10
      };

      // Fetch product count for each category
      const categoriesWithCount = await Promise.all(
        (categoriesData || []).map(async (category) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id);
          
          return {
            ...category,
            productCount: count || 0
          };
        })
      );

      // Sort by priority
      const sortedCategories = categoriesWithCount.sort((a, b) => {
        const priorityA = priorityOrder[a.slug] || 999;
        const priorityB = priorityOrder[b.slug] || 999;
        return priorityA - priorityB;
      });

      setCategories(sortedCategories);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить категории",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLink = (slug: string) => {
    // Map slugs to routes
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

  if (loading) {
    return (
    <section id="products" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center">{t('loading')}</div>
      </div>
    </section>
    );
  }

  return (
    <section id="products" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            {t('productsTitle')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('productsSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Card key={category.id} className="shadow-card transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl text-primary">{category.name}</CardTitle>
                </div>
                <CardDescription className="text-base">
                  {category.description || "Качественные материалы для профессионального использования"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {category.productCount} {t('productsInCategory')}
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <Link to={getCategoryLink(category.slug)}>
                  <Button className="w-full">
                    {t('viewCatalog')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-brand-cream rounded-lg p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-primary">{t('whyChoose')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-accent mb-2">{t('ecoFriendly')}</div>
                <div className="text-sm">{t('ecoDescription')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-2">{t('quality')}</div>
                <div className="text-sm">{t('qualityDescription')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-2">{t('consulting')}</div>
                <div className="text-sm">{t('consultingDescription')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Products;