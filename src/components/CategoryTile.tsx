import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { getCategoryIcon, getCategoryImage, getCategoryLink, pluralizeProducts } from "@/lib/categories";

interface CategoryTileProps {
  name: string;
  slug: string;
  productCount?: number;
}

const CategoryTile = ({ name, slug, productCount = 0 }: CategoryTileProps) => {
  const Icon = getCategoryIcon(slug);
  const image = getCategoryImage(slug);
  return (
    <Link
      to={getCategoryLink(slug)}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/50"
    >
      <span className="relative block aspect-[16/10] overflow-hidden bg-[#FFFAE5]">
        {image ? (
          <img
            src={image}
            alt=""
            width={960}
            height={600}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-primary">
            <Icon className="h-10 w-10" strokeWidth={1.5} />
          </span>
        )}
      </span>
      <span className="flex flex-1 items-center gap-2 p-3 md:gap-3 md:p-4">
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-primary md:text-base">
            {name}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground md:text-sm">
            {productCount} {pluralizeProducts(productCount)}
          </span>
        </span>
        <ChevronRight className="hidden h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary sm:block" />
      </span>
    </Link>
  );
};

export default CategoryTile;
