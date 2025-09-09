import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Info } from "lucide-react";
import { Link } from "react-router-dom";

const Tools = () => {
  const tools = [
    {
      name: "Клей P-18 супермастика",
      description: "Профессиональный монтажный клей",
      price: "от 450 Т",
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=300&fit=crop",
      features: ["Высокая адгезия", "Быстрое схватывание", "Универсальное применение"],
      eco: false,
      brand: "Raduga",
      sizes: ["1 кг", "3,5 кг"]
    },
    {
      name: "SOUDAL FIX ALL HIGH TACK WHITE",
      description: "Универсальный монтажный клей",
      price: "от 350 Т",
      image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&h=300&fit=crop",
      features: ["Высокая начальная липкость", "Белого цвета", "Эластичный"],
      eco: false,
      brand: "Soudal",
      sizes: ["290 ML"]
    },
    {
      name: "Пена Genius Gun SOUDAFOAM COMFORT",
      description: "Профессиональная монтажная пена с аппликатором",
      price: "от 550 Т",
      image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=300&h=300&fit=crop",
      features: ["С аппликатором Genius Gun", "Комфортное нанесение", "Высокое качество"],
      eco: false,
      brand: "Soudal",
      sizes: ["750 ML"]
    },
    {
      name: "Силикон прозрачный SOUDAL SILICONE U",
      description: "Универсальный прозрачный силиконовый герметик",
      price: "от 280 Т",
      image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=300&h=300&fit=crop",
      features: ["Прозрачный", "Атмосферостойкий", "Эластичный"],
      eco: false,
      brand: "Soudal",
      sizes: ["280 GR"]
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
                     <Badge variant="secondary" className="bg-brand-blue-light text-white">
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
                        <span className="w-2 h-2 bg-brand-blue rounded-full mr-2 flex-shrink-0"></span>
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