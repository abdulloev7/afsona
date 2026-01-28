import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const AboutPreview = () => {
  const highlights = [
    "500+ видов материалов",
    "Проверенные производители",
    "Экспертная поддержка",
    "Быстрая доставка"
  ];

  return (
    <section id="about" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              О компании AFSONA
            </h2>
            <p className="text-muted-foreground">
              Ваш надежный партнер в мире красок и материалов
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    AFSONA — это больше чем магазин красок. Мы стремимся предоставить 
                    только самые качественные и экологичные материалы для создания 
                    уютного и красивого дома.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {highlights.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-primary/10 rounded-lg p-4">
                    <div className="text-3xl font-bold text-primary mb-1">100%</div>
                    <div className="text-xs text-muted-foreground">Качество</div>
                  </div>
                  <div className="bg-accent/10 rounded-lg p-4">
                    <div className="text-3xl font-bold text-accent mb-1">ECO</div>
                    <div className="text-xs text-muted-foreground">Экологично</div>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4">
                    <div className="text-3xl font-bold text-primary mb-1">4+</div>
                    <div className="text-xs text-muted-foreground">Брендов</div>
                  </div>
                  <div className="bg-accent/10 rounded-lg p-4">
                    <div className="text-3xl font-bold text-accent mb-1">24/7</div>
                    <div className="text-xs text-muted-foreground">Поддержка</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link to="/about">
              <Button variant="outline" size="lg">
                Подробнее о нас
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;
