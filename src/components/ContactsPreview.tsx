import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Phone, Clock, MessageCircle } from "lucide-react";

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

        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-3">
                    <MapPin className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">Адрес</h3>
                  <p className="text-sm text-muted-foreground">
                    г. Худжанд<br />
                    20-й микрорайон, 27
                  </p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-3">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">Телефон</h3>
                  <a href="tel:+992927557919" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    +992 927 55 79 19
                  </a>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-3">
                    <Clock className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">Режим работы</h3>
                  <p className="text-sm text-muted-foreground">
                    Пн-Сб: 08:00-18:00<br />
                    Вс: Выходной
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t flex flex-wrap justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => window.open('https://t.me/+992927557919', '_blank')}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Telegram
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('https://wa.me/992927557919', '_blank')}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link to="/contacts">
              <Button size="lg">
                Все контакты и карта
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
