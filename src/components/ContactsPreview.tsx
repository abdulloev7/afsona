import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Phone, Clock, Mail, ExternalLink } from "lucide-react";
import { FaTelegram, FaWhatsapp, FaInstagram } from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ContactsPreview = () => {
  return (
    <section id="contacts" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
            Контакты
          </h2>
          <p className="text-muted-foreground">
            Свяжитесь с нами для консультации
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Contact Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-card">
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-brand-blue-light rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg text-primary">Наш адрес</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="cursor-pointer hover:opacity-80 transition-opacity">
                      <p className="text-foreground mb-1">г. Худжанд</p>
                      <p className="text-muted-foreground text-sm flex items-center justify-center gap-1">
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
                      Яндекс.Карты
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => window.open('https://maps.app.goo.gl/MEsrzn3JajJZfYk99', '_blank')}
                      className="cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Google Maps
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg text-primary">Контакты</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div>
                  <a href="tel:+992927557919" className="font-semibold text-lg hover:text-primary transition-colors">
                    +992 927 55 79 19
                  </a>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => window.open('https://t.me/+992927557919', '_blank')}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-muted/30 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#0088cc] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <FaTelegram className="w-5 h-5 text-white" />
                    </div>
                  </button>

                  <button
                    onClick={() => window.open('https://wa.me/992927557919', '_blank')}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-muted/30 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <FaWhatsapp className="w-5 h-5 text-white" />
                    </div>
                  </button>

                  <button
                    disabled
                    className="flex flex-col items-center gap-1.5 p-2 rounded-lg opacity-50 cursor-not-allowed"
                    title="Скоро"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#dc2743] flex items-center justify-center shadow-md">
                      <FaInstagram className="w-5 h-5 text-white" />
                    </div>
                  </button>

                  <button
                    onClick={() => window.location.href = 'mailto:info@afsona.com.tj'}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-muted/30 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-brand-blue rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg text-primary">Режим работы</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-1">
                <div>
                  <p className="font-semibold">Пн - Сб:</p>
                  <p className="text-muted-foreground text-sm">08:00 - 12:00, 13:00 - 18:00</p>
                </div>
                <div>
                  <p className="font-semibold">Воскресенье:</p>
                  <p className="text-muted-foreground text-sm">Выходной</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Map */}
          <Card className="shadow-brand overflow-hidden mb-8">
            <CardContent className="p-0">
              <div className="w-full h-[300px] md:h-[400px]">
                <iframe
                  src="https://www.google.com/maps?q=40.2997405,69.6201071&z=17&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Карта расположения магазина Афсона"
                />
              </div>
              
              <div className="p-4 bg-muted/30">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open('https://maps.app.goo.gl/MEsrzn3JajJZfYk99', '_blank')}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Google Maps
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open('https://yandex.tj/maps/-/CLCdFG~t', '_blank')}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Яндекс.Карты
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link to="/contacts">
              <Button size="lg">
                Все контакты
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactsPreview;
