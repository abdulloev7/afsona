import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Store, Package, Palette, Truck } from "lucide-react";
import { useStoreStats } from "@/hooks/useStoreStats";
import { pluralizeProducts } from "@/lib/categories";
import { DELIVERY_TEXT, TINT_TIME, YEARS_IN_BUSINESS } from "@/lib/facts";

const AboutPreview = () => {
  const { data: stats } = useStoreStats();

  const facts = [
    { icon: Store, text: `${YEARS_IN_BUSINESS} года работы, два магазина: в Худжанде и Душанбе` },
    {
      icon: Package,
      text: stats
        ? `${stats.productCount} ${pluralizeProducts(stats.productCount)} от ${stats.brandNames.length} производителей`
        : "Краски, грунтовки, клеи и инструмент",
    },
    { icon: Palette, text: `Колеровка в магазине за ${TINT_TIME}` },
    { icon: Truck, text: DELIVERY_TEXT },
  ];

  return (
    <section id="about" className="py-16 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-8 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">О магазине</h2>
            <p className="text-muted-foreground mb-6">
              AFSONA продаёт краски и материалы для ремонта: для стен, потолков, фасадов и полов. Подскажем, что
              подойдёт под вашу задачу, и посчитаем, сколько нужно.
            </p>
            <Button asChild variant="outline" className="bg-card">
              <Link to="/about">
                Подробнее о нас
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
          <ul className="grid sm:grid-cols-2 gap-3">
            {facts.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                <Icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;
