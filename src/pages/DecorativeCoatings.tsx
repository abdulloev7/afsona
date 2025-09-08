import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Info } from "lucide-react";
import { Link } from "react-router-dom";

const DecorativeCoatings = () => {
  const coatings = [
    {
      name: "Венецианская штукатурка Venezia",
      description: "Роскошный эффект мрамора",
      price: "от 150 000 сум",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
      features: ["Эффект мрамора", "Глубина цвета", "Элитность"],
      eco: false
    },
    {
      name: "Текстурная краска Relief",
      description: "Создает объемные рельефные поверхности",
      price: "от 95 000 сум",
      image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=300&h=300&fit=crop",
      features: ["Объемная текстура", "Скрывает дефекты", "Уникальный узор"],
      eco: false
    },
    {
      name: "Металлик покрытие Shine",
      description: "Металлический блеск и сияние",
      price: "от 180 000 сум",
      image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&h=300&fit=crop",
      features: ["Металлический блеск", "Золото, серебро, бронза", "Эксклюзивность"],
      eco: false
    },
    {
      name: "Перламутровые краски Pearl",
      description: "Переливающийся перламутровый эффект",
      price: "от 120 000 сум",
      image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=300&h=300&fit=crop",
      features: ["Перламутр", "Игра света", "Изысканность"],
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
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Декоративные покрытия</h1>
            <p className="text-muted-foreground mt-2">Эксклюзивные материалы для создания уникальных поверхностей</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coatings.map((coating, index) => (
            <Card key={index} className="shadow-card hover:shadow-brand transition-all duration-300 hover:-translate-y-1">
              <div className="aspect-square overflow-hidden rounded-t-lg">
                <img 
                  src={coating.image} 
                  alt={coating.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg text-primary">{coating.name}</CardTitle>
                  {coating.eco && (
                    <Badge variant="secondary" className="bg-brand-green-light text-white">
                      ЭКО
                    </Badge>
                  )}
                </div>
                <CardDescription>{coating.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-bold text-accent">{coating.price}</div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Особенности:</h4>
                  <ul className="space-y-1">
                    {coating.features.map((feature, featureIndex) => (
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
              Наши специалисты помогут создать уникальный дизайн
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

export default DecorativeCoatings;