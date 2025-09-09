import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Products = () => {
  const productCategories = [
    {
      title: "Краски для стен",
      description: "Высококачественные экологичные краски для внутренних работ",
      products: [
        "Водоэмульсионная краска",
        "Акриловая краска премиум класса", 
        "Силиконовая краска",
        "Латексная краска"
      ],
      eco: true,
      link: "/wall-paints"
    },
    {
      title: "Краски для потолка",
      description: "Специальные составы для идеального потолка",
      products: [
        "Матовая краска для потолка",
        "Супербелая краска",
        "Краска с антибактериальным покрытием"
      ],
      eco: true,
      link: "/ceiling-paints"
    },
    {
      title: "Фасадные краски",
      description: "Атмосферостойкие краски для наружных работ",
      products: [
        "Силикатная краска",
        "Акриловая фасадная краска",
        "Силоксановая краска премиум"
      ],
      eco: false,
      link: "/facade-paints"
    },
    {
      title: "Грунтовки и основы",
      description: "Подготовительные материалы для качественной покраски",
      products: [
        "Универсальная грунтовка",
        "Глубокопроникающая грунтовка",
        "Антисептическая грунтовка",
        "Адгезионная грунтовка"
      ],
      eco: true,
      link: "/primers"
    },
    {
      title: "Декоративные покрытия",
      description: "Эксклюзивные материалы для создания уникальных поверхностей",
      products: [
        "Венецианская штукатурка",
        "Текстурная краска",
        "Металлик покрытия",
        "Перламутровые краски"
      ],
      eco: false,
      link: "/decorative-coatings"
    },
    {
      title: "Инструменты",
      description: "Профессиональные инструменты для идеального результата",
      products: [
        "Кисти различных размеров",
        "Валики и насадки",
        "Малярная лента",
        "Защитная пленка"
      ],
      eco: false,
      link: "/tools"
    }
  ];

  return (
    <section id="products" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            Наш ассортимент
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Широкий выбор качественных материалов для любых задач ремонта и отделки
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {productCategories.map((category, index) => (
            <Card key={index} className="shadow-card hover:shadow-brand transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl text-primary">{category.title}</CardTitle>
                   {category.eco && (
                     <Badge variant="secondary" className="bg-brand-green-light text-white">
                       ЭКО
                     </Badge>
                   )}
                </div>
                <CardDescription className="text-base">
                  {category.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {category.products.map((product, productIndex) => (
                    <li key={productIndex} className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-accent rounded-full mr-3 flex-shrink-0"></span>
                      {product}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <div className="p-6 pt-0">
                <Link to={category.link}>
                  <Button className="w-full">
                    Смотреть каталог
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-brand-cream rounded-lg p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-primary">Почему выбирают AFSONA?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-accent mb-2">100%</div>
                <div className="text-sm">Качество гарантировано</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-2">ECO</div>
                <div className="text-sm">Экологичные материалы</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-2">24/7</div>
                <div className="text-sm">Консультации специалистов</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Products;