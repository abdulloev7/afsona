import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Search, Paintbrush, Hammer, Droplets, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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

      // Sort by priority
      const sortedCategories = categoriesWithCount.sort((a, b) => {
        const priorityA = priorityOrder[a.slug] || 999;
        const priorityB = priorityOrder[b.slug] || 999;
        return priorityA - priorityB;
      });

      setCategories(sortedCategories);

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
      'paints-and-coatings': <Paintbrush className="w-8 h-8" />,
      'decorative-coatings': <Palette className="w-8 h-8" />,
      'waterproofing': <Droplets className="w-8 h-8" />,
      'brushes-tools': <Hammer className="w-8 h-8" />,
    };
    return iconMap[slug] || <Paintbrush className="w-8 h-8" />;
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-10 w-full" />
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
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">
              Каталог товаров
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Широкий выбор качественных материалов для любых задач ремонта и отделки
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Поиск категории..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Brands Filter */}
          {brands.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-semibold mb-4 text-center">Фильтр по брендам</h2>
              <div className="flex flex-wrap justify-center gap-3">
                {brands.map((brand) => (
                  <Link key={brand.id} to={`/brands/${brand.slug}`}>
                    <Badge 
                      variant="outline" 
                      className="px-4 py-2 text-sm hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
                    >
                      {brand.logo && (
                        <img src={brand.logo} alt={brand.name} className="w-4 h-4 mr-2 object-contain" />
                      )}
                      {brand.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredCategories.map((category) => (
              <Card 
                key={category.id} 
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {getCategoryIcon(category.slug)}
                    </div>
                    <Badge variant="secondary">
                      {category.productCount} {category.productCount === 1 ? 'товар' : category.productCount && category.productCount < 5 ? 'товара' : 'товаров'}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{category.name}</CardTitle>
                  <CardDescription>
                    {category.description || "Качественные материалы для профессионального использования"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to={getCategoryLink(category.slug)}>
                    <Button className="w-full group-hover:bg-primary">
                      Перейти в категорию
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Категории не найдены. Попробуйте изменить поисковый запрос.
              </p>
            </div>
          )}

          {/* Why Choose Us Section */}
          <div className="bg-card border rounded-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center text-primary">Почему выбирают AFSONA?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-accent mb-2">100%</div>
                <div className="text-muted-foreground">Качество гарантировано</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-accent mb-2">ECO</div>
                <div className="text-muted-foreground">Экологичные материалы</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-accent mb-2">24/7</div>
                <div className="text-muted-foreground">Консультации специалистов</div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Catalog;
