import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Store, Package, Palette, Truck, MessageCircle, Leaf } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { useStoreStats } from "@/hooks/useStoreStats";
import { pluralizeProducts } from "@/lib/categories";
import { STORES } from "@/lib/contacts";
import { DELIVERY_TEXT, FAN_DECKS, TINT_MACHINE, TINT_TIME, YEARS_IN_BUSINESS } from "@/lib/facts";
import tintingMachine from "@/assets/tinting-machine.jpg";
import { t } from "@/i18n";

const AboutPage = () => {
  useSeo({
    title: t("О компании"),
    description:
      t("AFSONA — магазины красок и материалов для ремонта в Худжанде и Душанбе. Колеровка краски, консультации, доставка по городу."),
  });
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: stats } = useStoreStats();

  const facts = [
    {
      icon: Store,
      title: t("Два магазина"),
      text: STORES.map((s) => `${s.city}: ${s.address}`).join(". "),
    },
    {
      icon: Package,
      title: stats
        ? t("{count} {products} в каталоге", { count: stats.productCount, products: pluralizeProducts(stats.productCount) })
        : t("Каталог"),
      text: stats?.brandNames.length
        ? t("Производители: {brands}.", { brands: stats.brandNames.join(", ") })
        : t("Краски, грунтовки, штукатурки, клеи, гидроизоляция и малярный инструмент."),
    },
    {
      icon: Palette,
      title: t("Колеровка"),
      text: t("Аппарат {machine}, веера {decks}. Готово за {time}.", {
        machine: TINT_MACHINE,
        decks: FAN_DECKS.join(", "),
        time: TINT_TIME,
      }),
    },
    {
      icon: Truck,
      title: t("Доставка"),
      text: `${DELIVERY_TEXT}.`,
    },
    {
      icon: MessageCircle,
      title: t("Консультация"),
      text: t("Подскажем, какая краска подойдёт для стен, потолка или фасада, и посчитаем расход."),
    },
    {
      icon: Leaf,
      title: t("Эко материалы"),
      text: t("Экологичные материалы в каталоге отмечены меткой «Эко», их легко найти."),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-[calc(var(--header-h)+2rem)] pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12 items-center mb-16">
            <div>
              <h1 className="text-3xl md:text-5xl font-semibold mb-5 text-foreground">{t("О компании AFSONA")}</h1>
              <p className="text-lg text-muted-foreground mb-4">
                {t("AFSONA — магазины красок и материалов для ремонта в Худжанде и Душанбе. Работаем уже {years} года. К нам приходят и те, кто делает ремонт в своей квартире, и мастера-отделочники.", { years: YEARS_IN_BUSINESS })}
              </p>
              <p className="text-lg text-muted-foreground">
                {t("Помогаем выбрать материал под задачу, колеруем краску в нужный цвет и привозим заказ по городу.")}
              </p>
            </div>
            <figure className="rounded-lg overflow-hidden border border-border bg-card">
              <img
                src={tintingMachine}
                alt={t("Колеровочный аппарат {machine} в магазине AFSONA", { machine: TINT_MACHINE })}
                className="w-full aspect-[4/3] object-cover"
              />
            </figure>
          </div>

          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {facts.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-lg border border-border bg-card p-5">
                <Icon className="w-6 h-6 text-primary mb-3" />
                <h2 className="text-lg font-semibold mb-1 text-foreground">{title}</h2>
                <p className="text-sm text-muted-foreground">{text}</p>
              </li>
            ))}
          </ul>

          <div className="rounded-lg bg-secondary p-8 text-center">
            <h2 className="text-2xl font-semibold mb-3 text-foreground">{t("Подобрать материалы для ремонта")}</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              {t("Посмотрите цены в каталоге или приходите в магазин, покажем всё вживую.")}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild size="lg">
                <Link to="/catalog">
                  {t("Перейти в каталог")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-card">
                <Link to="/contacts">{t("Адреса магазинов")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
