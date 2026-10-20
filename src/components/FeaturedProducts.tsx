import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FeaturedProductCard } from './FeaturedProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from "@/i18n";

const AVAILABLE_TAGS = ['Хит', 'Советуем', 'Новинка', 'Акция'] as const;

const TAG_FILTER_ACTIVE = 'bg-primary text-primary-foreground';
const TAG_FILTER_INACTIVE = 'bg-card text-foreground ring-1 ring-inset ring-border hover:ring-primary/40';

interface FeaturedProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  old_price: number | null;
  image: string | null;
  image_fit?: 'cover' | 'contain';
  in_stock: boolean;
  tags: string[] | null;
  created_at: string;
  size_variants?: { volume: string; price: number }[] | null;
}

export function FeaturedProducts() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, name_tg, description, description_tg, price, old_price, image, image_fit, in_stock, tags, created_at, size_variants')
        .eq('is_featured', true)
        .eq('archived', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as FeaturedProduct[];
    },
  });

  // Sort products: "Хит" first, then "Акция", then by date
  const sortedProducts = [...products].sort((a, b) => {
    const getPriority = (tags: string[] | null) => {
      if (!tags) return 3;
      if (tags.includes('Хит')) return 1;
      if (tags.includes('Акция')) return 2;
      return 3;
    };
    const priorityDiff = getPriority(a.tags) - getPriority(b.tags);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Filter by selected tag
  const filteredProducts = selectedTag
    ? sortedProducts.filter(p => p.tags?.includes(selectedTag))
    : sortedProducts;

  // Don't render if no featured products
  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16" id="featured">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t("Лучшие предложения")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("Подборка самых выгодных и популярных товаров AFSONA")}
          </p>
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedTag === null ? TAG_FILTER_ACTIVE : TAG_FILTER_INACTIVE
            }`}
          >
            {t("Все")}
          </button>
          {AVAILABLE_TAGS.map((tag) => {
            const count = products.filter(p => p.tags?.includes(tag)).length;
            if (count === 0) return null;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === tag ? TAG_FILTER_ACTIVE : TAG_FILTER_INACTIVE
                }`}
              >
                {t(tag)}
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => (
              <FeaturedProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredProducts.length === 0 && selectedTag && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {t("Нет товаров с тегом «{tag}»", { tag: t(selectedTag) })}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
