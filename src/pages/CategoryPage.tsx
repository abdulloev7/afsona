import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Search, SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from '@/components/ProductCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { useSeo } from "@/hooks/useSeo";
import { toDescription } from "@/lib/seo";
import { pluralizeProducts } from "@/lib/categories";
import { localized, t } from "@/i18n";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  image_fit?: 'cover' | 'contain' | null;
  features: string[] | null;
  eco: boolean | null;
  brand: string | null;
  brand_id: string | null;
  sizes: string[] | null;
  size_variants: { volume: string; price: number }[] | null;
  in_stock: boolean;
  media?: { type: 'image' | 'video'; url: string; caption?: string; fit?: 'cover' | 'contain' }[] | null;
  created_at: string;
}

interface Brand {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  slug: string;
}

// Maps route slugs to DB category slugs
const ROUTE_TO_DB_SLUG: Record<string, string> = {
  'paints-coatings': 'paints-and-coatings',
  'adhesives-sealants': 'adhesives-sealants',
  'primers': 'primers-preparatory',
  'putties-leveling': 'putties-leveling',
  'decorative-coatings': 'decorative-coatings',
  'tints-thinners': 'tints-thinners',
  'waterproofing': 'waterproofing',
  'brushes-tools': 'brushes-tools',
  'rollers': 'rollers',
  'spatulas-accessories': 'spatulas-accessories',
  'wall-paints': 'wall-paints',
  'ceiling-paints': 'ceiling-paints',
  'facade-paints': 'facade-paints',
  'tools': 'tools',
};

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'newest';

const CategoryPage = () => {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Support both /catalog/:slug and legacy routes like /paints-coatings
  const routeSlug = paramSlug || location.pathname.replace(/^\//, '');

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  useSeo({
    title: category ? t("{name} — купить в Душанбе и Худжанде", { name: t(category.name) }) : undefined,
    description: category
      ? toDescription(
          t(category.description || ''),
          t("{name} в магазине AFSONA: цены, наличие, магазины в Душанбе и Худжанде.", { name: t(category.name) }),
        )
      : undefined,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showFilters, setShowFilters] = useState(false);

  const dbSlug = routeSlug ? (ROUTE_TO_DB_SLUG[routeSlug] || routeSlug) : '';

  useEffect(() => {
    window.scrollTo(0, 0);
    if (dbSlug) {
      fetchCategoryAndProducts();
    }
  }, [dbSlug]);

  const fetchCategoryAndProducts = async () => {
    setLoading(true);
    try {
      // Fetch category
      const { data: cat, error: catErr } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', dbSlug)
        .single();

      if (catErr) throw catErr;
      setCategory(cat);

      // Fetch products with brand info
      const { data: prods, error: prodsErr } = await supabase
        .from('products')
        .select('*, brand:brands(id, name)')
        .eq('category_id', cat.id)
        .eq('archived', false);

      if (prodsErr) throw prodsErr;

      const productsData = (prods || []).map((p: any) => ({
        ...p,
        brand: p.brand?.name || p.brand,
        brand_id: p.brand?.id || p.brand_id,
      }));
      setProducts(productsData);

      // Extract unique brands from products
      const brandMap = new Map<string, Brand>();
      productsData.forEach((p: any) => {
        if (p.brand_id && p.brand) {
          brandMap.set(p.brand_id, { id: p.brand_id, name: p.brand });
        }
      });
      setBrands(Array.from(brandMap.values()));
    } catch (error) {
      console.error('Error fetching category:', error);
      toast({
        title: t("Ошибка"),
        description: t("Не удалось загрузить товары"),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getMinPrice = (product: Product): number => {
    if (product.size_variants && product.size_variants.length > 0) {
      return Math.min(...product.size_variants.map(v => v.price));
    }
    return product.price;
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...products];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        localized(p, 'name').toLowerCase().includes(q) ||
        localized(p, 'description').toLowerCase().includes(q)
      );
    }

    // Brand filter
    if (selectedBrand !== 'all') {
      result = result.filter(p => p.brand_id === selectedBrand);
    }

    // In stock filter
    if (inStockOnly) {
      result = result.filter(p => p.in_stock);
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => getMinPrice(a) - getMinPrice(b));
        break;
      case 'price-desc':
        result.sort((a, b) => getMinPrice(b) - getMinPrice(a));
        break;
      case 'name-asc':
        result.sort((a, b) => localized(a, 'name').localeCompare(localized(b, 'name'), 'ru'));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      default:
        break;
    }

    return result;
  }, [products, searchQuery, selectedBrand, inStockOnly, sortBy]);

  const activeFiltersCount = [
    selectedBrand !== 'all',
    inStockOnly,
    searchQuery.trim().length > 0,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedBrand('all');
    setInStockOnly(false);
    setSortBy('default');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-[calc(var(--header-h)+2rem)] pb-16">
          <div className="container mx-auto px-4">
            <Skeleton className="h-8 w-48 mb-6" />
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-6 w-96 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="h-80" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-[calc(var(--header-h)+2rem)] pb-16">
          <div className="container mx-auto px-4 text-center py-16">
            <h1 className="text-2xl font-bold mb-4">{t("Категория не найдена")}</h1>
            <Button onClick={() => navigate('/catalog')}>{t("Вернуться в каталог")}</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-[calc(var(--header-h)+2rem)] pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="outline"
              size="sm"
              className="mb-4"
              onClick={() => navigate('/catalog')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("Назад в каталог")}
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{t(category.name)}</h1>
            {category.description && (
              <p className="text-muted-foreground text-lg">{t(category.description)}</p>
            )}
          </div>

          {/* Toolbar: Search + Sort + Filter toggle */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("Поиск товаров...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder={t("Сортировка")} />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="default">{t("По умолчанию")}</SelectItem>
                <SelectItem value="price-asc">{t("Цена: по возрастанию")}</SelectItem>
                <SelectItem value="price-desc">{t("Цена: по убыванию")}</SelectItem>
                <SelectItem value="name-asc">{t("По названию")}</SelectItem>
                <SelectItem value="newest">{t("Сначала новые")}</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              {t("Фильтры")}
              {activeFiltersCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="bg-card border rounded-lg p-4 mb-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{t("Фильтры")}</h2>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-1" />
                    {t("Сбросить")}
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Brand filter */}
                {brands.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{t("Бренд")}</label>
                    <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Все бренды")} />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="all">{t("Все бренды")}</SelectItem>
                        {brands.map(b => (
                          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* In stock filter */}
                <div className="flex items-end">
                  <Button
                    variant={inStockOnly ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => setInStockOnly(!inStockOnly)}
                  >
                    {inStockOnly ? '✓ ' : ''}{t("Только в наличии")}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Results count */}
          <div className="mb-4 text-sm text-muted-foreground">
            {filteredAndSorted.length === products.length
              ? `${products.length} ${pluralizeProducts(products.length)}`
              : t("{shown} из {total} {products}", {
                  shown: filteredAndSorted.length,
                  total: products.length,
                  products: pluralizeProducts(products.length),
                })}
          </div>

          {/* Products grid */}
          <h2 className="sr-only">{t("Товары")}</h2>
          {filteredAndSorted.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 mb-16">
              {filteredAndSorted.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg mb-4">
                {t("Товары не найдены по заданным фильтрам")}
              </p>
              <Button variant="outline" onClick={clearFilters}>
                {t("Сбросить фильтры")}
              </Button>
            </div>
          )}

          {/* CTA */}
          <div className="text-center bg-muted/50 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">{t("Нужна консультация?")}</h2>
            <p className="text-muted-foreground mb-6">
              {t("Наши специалисты помогут подобрать подходящий товар")}
            </p>
            <Button size="lg" onClick={() => window.open('tel:+992927557919')}>
              {t("Связаться: +992 927 55 79 19")}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;
