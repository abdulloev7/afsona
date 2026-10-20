import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Clock, Mail, Send, Loader2 } from "lucide-react";
import { FaTelegram, FaWhatsapp, FaInstagram } from "react-icons/fa";
import StoreCard from "@/components/StoreCard";
import { STORES, STORE_HOURS } from "@/lib/contacts";
import { useSeo } from "@/hooks/useSeo";

const ContactsPage = () => {
  useSeo({
    title: 'Контакты',
    description: 'Магазины AFSONA в Худжанде (Джумъа бозор) и Душанбе (базар Кушониён): адреса, телефоны и время работы. Звоните или пишите, поможем подобрать краску.',
  });
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              Свяжитесь с нами
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Мы всегда рады помочь вам с выбором материалов и ответить на любые вопросы
            </p>
          </div>

          {/* Stores */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {STORES.map((store) => (
              <StoreCard key={store.city} store={store} />
            ))}
          </div>
          <p className="flex items-center gap-2 text-sm text-foreground mb-12">
            <Clock className="w-4 h-4 shrink-0 text-primary" />
            Режим работы: {STORE_HOURS}, воскресенье выходной
          </p>

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
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <FaTelegram className="w-8 h-8 text-white" />
                  </div>
                  <span className="font-medium">Telegram</span>
                </button>

                <button
                  onClick={() => window.open('https://wa.me/992927557919', '_blank')}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted/30 transition-all duration-300 group"
                >
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <FaWhatsapp className="w-8 h-8 text-white" />
                  </div>
                  <span className="font-medium">WhatsApp</span>
                </button>

                <button
                  onClick={() => window.open('https://www.instagram.com/afsona.build/', '_blank')}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted/30 transition-all duration-300 group"
                >
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <FaInstagram className="w-8 h-8 text-white" />
                  </div>
                  <span className="font-medium">Instagram</span>
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

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto mb-12">
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
