import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Real catalog numbers for "about" copy, so the figures on the site stay true.
export const useStoreStats = () =>
  useQuery({
    queryKey: ["store-stats"],
    queryFn: async () => {
      const [products, brands] = await Promise.all([
        supabase.from("products").select("id").eq("archived", false),
        supabase.from("brands").select("name").order("display_order"),
      ]);
      if (products.error) throw products.error;
      if (brands.error) throw brands.error;
      return {
        productCount: products.data.length,
        brandNames: brands.data.map((b) => b.name),
      };
    },
    staleTime: 10 * 60 * 1000,
  });
