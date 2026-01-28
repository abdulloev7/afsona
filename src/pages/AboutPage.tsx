import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Leaf, 
  Palette, 
  Gem, 
  Users, 
  Target, 
  Heart,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const values = [
    {
      icon: Leaf,
      title: "Экологичность",
      description: "Приоритет экологически чистым материалам, безопасным для здоровья вашей семьи и окружающей среды."
    },
    {
      icon: Palette,
      title: "Широкий выбор",
      description: "Огромная палитра цветов и текстур для воплощения любых дизайнерских идей и проектов."
    },
    {
      icon: Gem,
      title: "Премиум качество",
      description: "Работаем только с проверенными брендами высшего качества с международной сертификацией."
    },
    {
      icon: Users,
      title: "Экспертная поддержка",
      description: "Профессиональные консультации на каждом этапе вашего проекта от опытных специалистов."
    }
  ];

  const stats = [
    { value: "500+", label: "Видов материалов" },
    { value: "4+", label: "Премиум брендов" },
    { value: "1000+", label: "Довольных клиентов" },
    { value: "5", label: "Лет на рынке" }
  ];

  const features = [
    "Более 500 видов красок и материалов",
    "Только проверенные производители",
    "Экспертные консультации и поддержка",
    "Быстрая доставка по городу",
    "Компьютерная колеровка краски",
    "Гарантия качества на все товары"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge className="mb-4">О компании</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              О компании AFSONA
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Ваш надежный партнер в мире красок и материалов для ремонта. 
              Мы предоставляем качественные экологичные материалы для создания уютного и красивого дома.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-accent mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mission Section */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-8 h-8 text-primary" />
                  <CardTitle className="text-2xl">Наша миссия</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  AFSONA — это больше чем магазин красок. Мы стремимся предоставить нашим клиентам 
                  только самые качественные и экологичные материалы для создания уютного и красивого дома.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Наша команда экспертов поможет вам выбрать идеальные материалы для любого проекта — 
                  от небольшого ремонта до масштабной реновации. Мы верим, что каждый дом заслуживает 
                  лучших материалов.
                </p>
                <div className="space-y-3 pt-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="w-8 h-8 text-primary" />
                  <CardTitle className="text-2xl">Наши ценности</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {values.map((value, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <value.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{value.title}</h4>
                        <p className="text-sm text-muted-foreground">{value.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Why Choose Us */}
          <div className="bg-card border rounded-lg p-8 mb-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-primary">Почему выбирают нас</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div key={index} className="text-center p-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <value.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Готовы начать свой проект?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Посетите наш каталог или свяжитесь с нами для получения профессиональной консультации
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/catalog">
                <Button size="lg">
                  Перейти в каталог
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/contacts">
                <Button size="lg" variant="outline">
                  Связаться с нами
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
