import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Phone, 
  Clock, 
  Mail, 
  ExternalLink,
  Send,
  Loader2
} from "lucide-react";
import { FaTelegram, FaWhatsapp, FaInstagram } from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ContactsPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        'https://pbdmochmasoylofhasrk.supabase.co/functions/v1/send-contact-message',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim() || undefined,
            message: formData.message.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка отправки');
      }

      toast({
        title: "Сообщение отправлено!",
        description: "Мы свяжемся с вами в ближайшее время.",
      });
      setFormData({ name: "", phone: "", email: "", message: "" });
    } catch (error) {
      console.error('Error sending contact message:', error);
      toast({
        title: "Ошибка отправки",
        description: "Не удалось отправить сообщение. Попробуйте позже или позвоните нам.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge className="mb-4">Контакты</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              Свяжитесь с нами
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Мы всегда рады помочь вам с выбором материалов и ответить на любые вопросы
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Address Card */}
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle>Наш адрес</CardTitle>
              </CardHeader>
              <CardContent>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="cursor-pointer hover:opacity-80 transition-opacity">
                      <p className="font-semibold mb-1">г. Худжанд</p>
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
                      onClick={() => window.open('https://maps.app.goo.gl/MEsrzn3JajJZfYk99', '_blank')}
                      className="cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Открыть в Google Maps
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>

            {/* Phone Card */}
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Телефон</CardTitle>
              </CardHeader>
              <CardContent>
                <a href="tel:+992927557919" className="block">
                  <p className="font-semibold text-lg hover:text-primary transition-colors">
                    +992 927 55 79 19
                  </p>
                </a>
                <p className="text-sm text-muted-foreground mt-2">Основной номер</p>
              </CardContent>
            </Card>

            {/* Hours Card */}
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle>Режим работы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="font-semibold">Пн - Сб:</p>
                    <p className="text-muted-foreground">08:00 - 12:00, 13:00 - 18:00</p>
                  </div>
                  <div>
                    <p className="font-semibold">Воскресенье:</p>
                    <p className="text-muted-foreground">Выходной</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Social Links */}
          <Card className="mb-12">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Мы в социальных сетях</CardTitle>
              <p className="text-muted-foreground">Свяжитесь с нами удобным способом</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-center gap-6">
                <button
                  onClick={() => window.open('https://t.me/+992927557919', '_blank')}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted/30 transition-all duration-300 group"
                >
                  <div className="w-16 h-16 rounded-full bg-[#0088cc] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <FaTelegram className="w-8 h-8 text-white" />
                  </div>
                  <span className="font-medium">Telegram</span>
                </button>

                <button
                  onClick={() => window.open('https://wa.me/992927557919', '_blank')}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted/30 transition-all duration-300 group"
                >
                  <div className="w-16 h-16 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <FaWhatsapp className="w-8 h-8 text-white" />
                  </div>
                  <span className="font-medium">WhatsApp</span>
                </button>

                <button
                  disabled
                  className="flex flex-col items-center gap-2 p-4 rounded-xl opacity-50 cursor-not-allowed"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#dc2743] flex items-center justify-center shadow-lg">
                    <FaInstagram className="w-8 h-8 text-white" />
                  </div>
                  <span className="font-medium">Instagram</span>
                  <span className="text-xs text-muted-foreground">Скоро</span>
                </button>

                <button
                  onClick={() => window.location.href = 'mailto:info@afsona.com.tj'}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted/30 transition-all duration-300 group"
                >
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Mail className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <span className="font-medium">Email</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Map and Contact Form */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Map */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Как нас найти</CardTitle>
                <p className="text-muted-foreground">г. Худжанд, 20-й микрорайон, 27</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full h-[400px]">
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
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open('https://maps.app.goo.gl/MEsrzn3JajJZfYk99', '_blank')}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Google Maps
                    </Button>
                    <Button
                      variant="outline"
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

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Напишите нам</CardTitle>
                <p className="text-muted-foreground">Заполните форму и мы свяжемся с вами</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      placeholder="Ваше имя"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="tel"
                      placeholder="Телефон"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Email (необязательно)"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder="Ваше сообщение..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Отправка...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Отправить сообщение
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Info Banner */}
          <div className="bg-primary/10 rounded-lg p-6 text-center">
            <p className="text-lg">
              <strong>Бесплатная консультация:</strong> Наши специалисты помогут подобрать материалы для вашего проекта
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactsPage;
