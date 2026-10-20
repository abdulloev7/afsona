import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { getCategoryIcon, getCategoryLink, pluralizeProducts } from "@/lib/categories";

interface CategoryTileProps {
  name: string;
  slug: string;
  productCount?: number;
}

const CategoryTile = ({ name, slug, productCount = 0 }: CategoryTileProps) => {
  const Icon = getCategoryIcon(slug);
  return (
    <Link
      to={getCategoryLink(slug)}
      className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-foreground transition-colors group-hover:text-primary">
          {name}
        </span>
        <span className="block text-sm text-muted-foreground">
          {productCount} {pluralizeProducts(productCount)}
        </span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
    </Link>
  );
};

export default CategoryTile;
