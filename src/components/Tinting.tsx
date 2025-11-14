import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, MonitorCheck, Clock, Repeat, Droplets, Users, Target } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const Tinting = () => {
  // Временные placeholder изображения
  const placeholderImages = [
    "https://kolerovka.ru/wp-content/uploads/2018/07/Vybor-oborudovanija.jpg?w=800&h=600", // paint mixing machine
    "https://sun1-20.userapi.com/c840424/v840424166/8b34b/2QX4c1vnz5k.jpg?w=800&h=600", // colorful paints
    "https://drive.google.com/file/d/1hk8b01sCYFSBGrY5bIfRQer74I1_8kFR/view?usp=sharing?w=800&h=600", // color palette
  ];

  const advantages = [
    {
      icon: Palette,
      title: "Более 2000 оттенков",
      description: "Огромный выбор из различных цветовых систем",
    },
    {
      icon: MonitorCheck,
      title: "Компьютерная точность",
      description: "Гарантируем идеальное смешивание цветов",
    },
    {
      icon: Repeat,
      title: "Повторяемость результата",
      description: "Сохраняем формулу для повторных заказов",
    },
    {
      icon: Clock,
      title: "Быстрая колеровка",
      description: "Готовая краска за 5-10 минут",
    },
    {
      icon: Droplets,
      title: "Любой объём",
      description: "От 1 литра до промышленных партий",
    },
    {
      icon: Users,
      title: "Профессиональные консультации",
      description: "Поможем выбрать идеальный цвет",
    },
    {
      icon: Target,
      title: "Точность попадания",
      description: "Можем заколеровать под ваш образец",
    },
  ];

  const workProcess = [
    "Выбор оттенка из палитры или по вашему образцу",
    "Компьютерный расчет точных пропорций",
    "Автоматическое смешивание пигментов",
    "Проверка цвета и выдача готовой краски",
  ];

  const colorCollections = [
    { name: "RAL Classic", colors: "213 оттенков" },
    { name: "NCS System", colors: "1950 оттенков" },
    { name: "Dulux Colour", colors: "Более 5000 цветов" },
    { name: "Tikkurila", colors: "Более 20000 оттенков" },
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-background/50" id="tinting">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок секции */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 text-white">
            Профессиональное оборудование
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">Компьютерная колеровка краски</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            С помощью современного колеровочного оборудования мы можем подобрать около 2000 оттенков краски под любые
            ваши потребности. Точность, скорость и гарантия повторяемости результата.
          </p>
        </div>

        {/* Основной контент - Grid Layout */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Левая колонка - Визуальный контент */}
          <div className="space-y-6">
            {/* Carousel с фото оборудования */}
            <div className="rounded-xl overflow-hidden shadow-lg">
              <Carousel className="w-full">
                <CarouselContent>
                  {placeholderImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        <img
                          src={image}
                          alt={`Колеровочное оборудование ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <p className="absolute bottom-4 left-4 text-white font-semibold">
                          #📸 Замените это фото на реальное оборудование
                        </p>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </Carousel>
            </div>

            {/* Видео placeholder */}
            <Card className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                  <p className="text-muted-foreground font-medium">🎥 Здесь будет видео процесса колеровки</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Вставьте ссылку на YouTube/Vimeo или загрузите видео
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Правая колонка - Информационный блок */}
          <div className="space-y-6">
            {/* О оборудовании */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MonitorCheck className="w-6 h-6 text-primary" />
                  Наше оборудование
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Мы используем профессиональное колеровочное оборудование последнего поколения, которое обеспечивает
                  максимальную точность и скорость работы.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 italic text-sm">
                  💡 Добавьте здесь название модели оборудования и техническое описание
                </div>
              </CardContent>
            </Card>

            {/* Преимущества */}
            <Card>
              <CardHeader>
                <CardTitle>Преимущества нашей колеровки</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {advantages.map((advantage, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-1 p-2 rounded-lg bg-primary/10">
                        <advantage.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{advantage.title}</h4>
                        <p className="text-sm text-muted-foreground">{advantage.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Процесс работы */}
            <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5">
              <CardHeader>
                <CardTitle>Как это работает</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workProcess.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <p className="pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Цветовые коллекции */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">Популярные цветовые коллекции</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {colorCollections.map((collection, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500" />
                  <CardTitle className="text-lg">{collection.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{collection.colors}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 border-2 border-primary/20">
          <CardContent className="py-12 text-center">
            <h3 className="text-3xl font-bold mb-4">Готовы подобрать идеальный цвет?</h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Приходите в наш магазин или позвоните нам для консультации. Мы поможем выбрать идеальный оттенок для
              вашего проекта!
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                className="gap-2"
                onClick={() => {
                  const element = document.getElementById("contacts");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Palette className="w-5 h-5" />
                Заказать колеровку
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                onClick={() => {
                  const element = document.getElementById("contacts");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Users className="w-5 h-5" />
                Получить консультацию
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Tinting;
