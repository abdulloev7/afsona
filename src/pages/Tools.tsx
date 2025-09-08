import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Info } from "lucide-react";
import { Link } from "react-router-dom";

const Tools = () => {
  const tools = [
    {
      name: "Набор кистей Professional",
      description: "Профессиональные кисти разных размеров",
      price: "от 25 000 сум",
      image: "https://images.unsplash.com/photo-1572543198743-46d1c8067e4d?w=300&h=300&fit=crop",
      features: ["Натуральная щетина", "Эргономичные ручки", "Долговечные"],
      eco: false
    },
    {
      name: "Валики и насадки Premium",
      description: "Качественные валики для идеального нанесения",
      price: "от 15 000 сум",
      image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&h=300&fit=crop",
      features: ["Разная длина ворса", "Сменные насадки", "Равномерное покрытие"],
      eco: false
    },
    {
      name: "Малярная лента Pro",
      description: "Профессиональная защитная лента",
      price: "от 8 000 сум",
      image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=300&h=300&fit=crop",
      features: ["Четкие границы", "Легко снимается", "Разная ширина"],
      eco: false
    },
    {
      name: "Защитная пленка Cover",
      description: "Надежная защита мебели и пола",
      price: "от 12 000 сум",
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=300&fit=crop",
      features: ["Прочная", "Антистатическая", "Удобное крепление"],
      eco: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link to="/">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к ассортименту
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Инструменты</h1>
            <p className="text-muted-foreground mt-2">Профессиональные инструменты для идеального результата</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <Card key={index} className="shadow-card hover:shadow-brand transition-all duration-300 hover:-translate-y-1">
              <div className="aspect-square overflow-hidden rounded-t-lg">
                <img 
                  src={tool.image} 
                  alt={tool.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg text-primary">{tool.name}</CardTitle>
                  {tool.eco && (
                    <Badge variant="secondary" className="bg-brand-green-light text-white">
                      ЭКО
                    </Badge>
                  )}
                </div>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-bold text-accent">{tool.price}</div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Особенности:</h4>
                  <ul className="space-y-1">
                    {tool.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm">
                        <span className="w-2 h-2 bg-brand-green rounded-full mr-2 flex-shrink-0"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4">
                  <Button size="sm" className="w-full">
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Заказать
                  </Button>
                  <Button size="sm" variant="outline" className="w-full">
                    <Info className="w-4 h-4 mr-1" />
                    Подробнее
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-brand-cream rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-primary">Нужна консультация?</h3>
            <p className="text-muted-foreground mb-6">
              Наши специалисты помогут подобрать нужные инструменты
            </p>
            <Button size="lg" onClick={() => window.open('tel:+992927557919')}>
              Получить консультацию
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tools;