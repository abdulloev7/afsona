import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/locales/translations";

const Contacts = () => {
  const { language } = useLanguage();
  const t = (key: any) => getTranslation(language, key);
  
  return (
    <section id="contacts" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            {t('contactsTitle')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('contactsSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card className="shadow-card">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-brand-blue-light rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-primary">{t('address')}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-foreground mb-2">{t('addressText').split(',')[0]}</p>
              <p className="text-muted-foreground">{t('addressText').split(',').slice(1).join(',')}</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-primary">{t('phone')}</CardTitle>
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
              <CardTitle className="text-primary">{t('workHours')}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-2">
              <div>
                <p className="font-semibold">{t('workHoursText').split(':')[0]}:</p>
                <p className="text-muted-foreground">{t('workHoursText').split(':').slice(1).join(':')}</p>
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
              <CardTitle className="text-2xl text-primary">{t('quickContact')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => window.open('tel:+992927557919')}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  {t('call')}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open('https://t.me/afsona_paints')}
                >
                  {t('writeInTelegram')}
                </Button>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{t('email')}: info@afsona.com.tj</span>
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
