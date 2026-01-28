import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Palette, CheckCircle2 } from "lucide-react";

const TintingPreview = () => {
  const features = [
    "Более 2000 оттенков",
    "Компьютерная точность",
    "Готово за 5-10 минут",
    "Сохранение формулы"
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/30" id="tinting">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <Badge className="mb-4 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 text-white">
            Профессиональный сервис
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
            Компьютерная колеровка
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Подберём идеальный оттенок для вашего проекта с гарантией повторяемости результата
          </p>
        </div>

        <Card className="mb-8 overflow-hidden">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2">
              <div className="aspect-video md:aspect-auto">
                <img
                  src="https://kolerovka.ru/wp-content/uploads/2018/07/Vybor-oborudovanija.jpg"
                  alt="Колеровочное оборудование"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 md:p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="w-8 h-8 text-primary" />
                  <span className="text-2xl font-bold">2000+</span>
                  <span className="text-muted-foreground">оттенков</span>
                </div>
                <div className="space-y-3 mb-6">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link to="/tinting">
                  <Button className="w-full md:w-auto">
                    Подробнее
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default TintingPreview;
