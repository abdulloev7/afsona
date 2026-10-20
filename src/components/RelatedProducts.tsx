import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FeaturedProductCard } from "@/components/FeaturedProductCard";
import { t } from "@/i18n";

type RelatedProduct = Parameters<typeof FeaturedProductCard>[0]["product"];

const LIMIT = 4;

// Other products from the same category, shown under the product page.
const RelatedProducts = ({ categoryId, productId }: { categoryId: string; productId: string }) => {
  const { data: products = [] } = useQuery({
    queryKey: ["related-products", categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, name_tg, description, description_tg, price, old_price, image, image_fit, in_stock, tags, size_variants")
        .eq("category_id", categoryId)
        .eq("archived", false)
        .order("created_at", { ascending: false })
        .limit(LIMIT + 1);
      if (error) throw error;
      return (data || []) as unknown as RelatedProduct[];
    },
  });

  const related = products.filter((p) => p.id !== productId).slice(0, LIMIT);
  if (related.length === 0) return null;

  return (
    <section className="mt-14">
      <h2 className="text-2xl font-semibold text-foreground mb-5">{t("Из этой же категории")}</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {related.map((p) => (
          <FeaturedProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
