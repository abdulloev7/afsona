import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, Loader2 } from "lucide-react";
import { FaTelegram, FaWhatsapp, FaInstagram } from "react-icons/fa";
import StoreLocator from "@/components/StoreLocator";
import { useSeo } from "@/hooks/useSeo";
import { t } from "@/i18n";

const ContactsPage = () => {
  useSeo({
    title: t("Контакты"),
    description: t("Магазины AFSONA в Худжанде (Джумъа бозор) и Душанбе (базар Кушониён): адреса, телефоны и время работы. Звоните или пишите, поможем подобрать краску."),
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
        title: t("Ошибка"),
        description: t("Заполните все обязательные поля"),
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
        throw new Error(result.error || t("Ошибка отправки"));
      }

      toast({
        title: t("Сообщение отправлено!"),
        description: t("Мы свяжемся с вами в ближайшее время."),
      });
      setFormData({ name: "", phone: "", email: "", message: "" });
    } catch (error) {
      console.error('Error sending contact message:', error);
      toast({
        title: t("Ошибка отправки"),
        description: t("Не удалось отправить сообщение. Попробуйте позже или позвоните нам."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-[calc(var(--header-h)+2rem)] pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              {t("Свяжитесь с нами")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("Мы всегда рады помочь вам с выбором материалов и ответить на любые вопросы")}
            </p>
          </div>

          {/* Stores */}
          <div className="max-w-5xl mx-auto mb-12">
            <StoreLocator headingLevel="h2" />
          </div>

          {/* Social Links */}
          <Card className="mb-12">
            <CardHeader className="text-center">
              <CardTitle as="h2" className="text-2xl">{t("Мы в социальных сетях")}</CardTitle>
              <p className="text-muted-foreground">{t("Свяжитесь с нами удобным способом")}</p>
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
                  <span className="font-medium">{t("Почта")}</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto mb-12">
            <Card>
              <CardHeader>
                <CardTitle as="h2">{t("Напишите нам")}</CardTitle>
                <p className="text-muted-foreground">{t("Заполните форму и мы свяжемся с вами")}</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      placeholder={t("Ваше имя")}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="tel"
                      placeholder={t("Телефон")}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder={t("Эл. почта (необязательно)")}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder={t("Ваше сообщение...")}
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
                        {t("Отправка...")}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {t("Отправить сообщение")}
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
              <strong>{t("Бесплатная консультация:")}</strong>{" "}{t("Наши специалисты помогут подобрать материалы для вашего проекта")}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactsPage;
