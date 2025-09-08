import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Mail } from "lucide-react";

const Contacts = () => {
  return (
    <section id="contacts" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            Контакты
          </h2>
          <p className="text-lg text-muted-foreground">
            Свяжитесь с нами для консультации и заказа материалов
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card className="shadow-card">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-brand-green-light rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-primary">Наш адрес</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-foreground mb-2">г. Худжанд</p>
              <p className="text-muted-foreground">20-й микрорайон, 27</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-primary">Телефоны</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-2">
              <div>
                <p className="font-semibold">+992 927 55 79 19</p>
                <p className="text-sm text-muted-foreground">Основной номер</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-primary">Режим работы</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-2">
              <div>
                <p className="font-semibold">Пн - Пт:</p>
                <p className="text-muted-foreground">08:00 - 12:00, 13:00 - 18:00</p>
              </div>
              <div>
                <p className="font-semibold">Суббота:</p>
                <p className="text-muted-foreground">08:00 - 12:00, 13:00 - 18:00</p>
              </div>
              <div>
                <p className="font-semibold">Воскресенье:</p>
                <p className="text-muted-foreground">Выходной</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="shadow-brand">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-primary">Быстрая связь</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => window.open('tel:+992927557919')}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Позвонить
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open('https://t.me/afsona_paints')}
                >
                  Написать в Telegram
                </Button>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>info@afsona.uz</span>
                </div>
              </div>
              
              <div className="bg-brand-cream-light rounded-lg p-4 text-center">
                <p className="text-sm text-foreground">
                  <strong>Бесплатная консультация:</strong> Наши специалисты помогут подобрать 
                  идеальные материалы для вашего проекта
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Contacts;