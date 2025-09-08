import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Info } from "lucide-react";
import { Link } from "react-router-dom";

const Primers = () => {
  const primers = [
    {
      name: "Универсальная грунтовка Multi-Base",
      description: "Подходит для всех типов поверхностей",
      price: "от 35 000 сум",
      image: "https://images.unsplash.com/photo-1572543198743-46d1c8067e4d?w=300&h=300&fit=crop",
      features: ["Высокая адгезия", "Быстросохнущая", "Экономичная"],
      eco: true
    },
    {
      name: "Глубокопроникающая грунтовка Deep",
      description: "Укрепляет рыхлые и старые поверхности",
      price: "от 45 000 сум",
      image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&h=300&fit=crop",
      features: ["Проникновение до 10мм", "Укрепляющая", "Пылесвязывающая"],
      eco: true
    },
    {
      name: "Антисептическая грунтовка Bio-Protect",
      description: "Защита от плесени и грибка",
      price: "от 55 000 сум",
      image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=300&h=300&fit=crop",
      features: ["Биозащита", "Длительная защита", "Безопасная"],
      eco: true
    },
    {
      name: "Адгезионная грунтовка Contact",
      description: "Для сложных гладких поверхностей",
      price: "от 60 000 сум",
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=300&fit=crop",
      features: ["Сверхсильное сцепление", "Для кафеля", "Для металла"],
      eco: true
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
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Грунтовки и основы</h1>
            <p className="text-muted-foreground mt-2">Подготовительные материалы для качественной покраски</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {primers.map((primer, index) => (
            <Card key={index} className="shadow-card hover:shadow-brand transition-all duration-300 hover:-translate-y-1">
              <div className="aspect-square overflow-hidden rounded-t-lg">
                <img 
                  src={primer.image} 
                  alt={primer.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg text-primary">{primer.name}</CardTitle>
                  {primer.eco && (
                    <Badge variant="secondary" className="bg-brand-green-light text-white">
                      ЭКО
                    </Badge>
                  )}
                </div>
                <CardDescription>{primer.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-bold text-accent">{primer.price}</div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Особенности:</h4>
                  <ul className="space-y-1">
                    {primer.features.map((feature, featureIndex) => (
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
              Наши специалисты помогут подобрать подходящую грунтовку
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

export default Primers;