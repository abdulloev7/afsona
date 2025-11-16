import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Mail, ExternalLink, MessageCircle, Instagram } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
              <div className="w-16 h-16 bg-brand-blue-light rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-primary">Наш адрес</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="cursor-pointer hover:opacity-80 transition-opacity">
                    <p className="text-foreground mb-2">г. Худжанд</p>
                    <p className="text-muted-foreground flex items-center justify-center gap-1">
                      20-й микрорайон, 27
                      <ExternalLink className="w-3 h-3" />
                    </p>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-background">
                  <DropdownMenuItem 
                    onClick={() => window.open('https://yandex.tj/maps/-/CLCdFG~t', '_blank')}
                    className="cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Открыть в Яндекс.Картах
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => window.open('https://share.google/dBMsPOdCoxBGsOJOy', '_blank')}
                    className="cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Открыть в Google Maps
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
              <div className="w-16 h-16 bg-brand-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-primary">Режим работы</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-2">
              <div>
                <p className="font-semibold">Пн - Сб:</p>
                <p className="text-muted-foreground">08:00 - 12:00, 13:00 - 18:00</p>
              </div>
              <div>
                <p className="font-semibold">Воскресенье:</p>
                <p className="text-muted-foreground">Выходной</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto mb-12">
          <Card className="shadow-brand overflow-hidden">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-primary">Как нас найти</CardTitle>
              <p className="text-muted-foreground">г. Худжанд, 20-й микрорайон, 27</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full h-[400px] md:h-[500px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.6145924934943!2d69.62291!3d40.28451!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDE3JzA0LjIiTiA2OcKwMzcnMjIuNSJF!5e0!3m2!1sen!2s!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Карта расположения магазина Афсона"
                />
              </div>
              
              <div className="p-6 bg-muted/30">
                <p className="text-center text-sm text-muted-foreground mb-4">
                  Откройте в приложении для построения маршрута
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open('https://share.google/dBMsPOdCoxBGsOJOy', '_blank')}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Открыть в Google Maps
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open('https://yandex.tj/maps/-/CLCdFG~t', '_blank')}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Открыть в Яндекс.Картах
                  </Button>
                </div>
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <button
                  onClick={() => window.open('https://t.me/abdulloev7', '_blank')}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-16 h-16 rounded-full bg-[#0088cc] flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-sm font-medium">Telegram</span>
                </button>

                <button
                  onClick={() => window.open('https://wa.me/992927557919', '_blank')}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-16 h-16 rounded-full bg-[#25D366] flex items-center justify-center">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-sm font-medium">WhatsApp</span>
                </button>

                <button
                  disabled
                  className="flex flex-col items-center gap-2 p-4 rounded-lg opacity-50 cursor-not-allowed"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#dc2743] flex items-center justify-center">
                    <Instagram className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-sm font-medium">Instagram</span>
                  <span className="text-xs text-muted-foreground">Скоро</span>
                </button>

                <button
                  onClick={() => window.location.href = 'mailto:info@afsona.com.tj'}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-16 h-16 rounded-full bg-brand-blue flex items-center justify-center">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-sm font-medium">Email</span>
                </button>
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
