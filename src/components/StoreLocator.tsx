import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Mail } from "lucide-react";
import { FaTelegram, FaWhatsapp, FaInstagram } from "react-icons/fa";
import { STORES, STORE_WHATSAPP_URL, mapEmbedUrl, yandexMapUrl } from "@/lib/contacts";
import { cn } from "@/lib/utils";
import { t } from "@/i18n";

const SOCIALS = [
  { href: "https://t.me/afsona_build", label: "Telegram", Icon: FaTelegram },
  { href: STORE_WHATSAPP_URL, label: "WhatsApp", Icon: FaWhatsapp },
  { href: "https://www.instagram.com/afsona.build/", label: "Instagram", Icon: FaInstagram },
  { href: "mailto:info@afsona.com.tj", label: t("Почта"), Icon: Mail },
];

// Address, phones, hours and a map for one store at a time, with a switch
// between the stores.
const StoreLocator = ({ headingLevel = "h3" }: { headingLevel?: "h2" | "h3" }) => {
  const [index, setIndex] = useState(0);
  const store = STORES[index];

  return (
    <div>
      <div role="tablist" aria-label={t("Магазин")} className="flex justify-center mb-6">
        <div className="inline-flex rounded-lg border border-border bg-card p-1">
          {STORES.map((s, i) => (
            <button
              key={s.city}
              role="tab"
              aria-selected={i === index}
              onClick={() => setIndex(i)}
              className={cn(
                "px-5 py-2 rounded-md text-sm font-medium transition-colors",
                i === index ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary",
              )}
            >
              {s.city}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-card">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle as={headingLevel} className="text-lg text-primary">{t("Наш адрес")}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-foreground mb-1">{t("г. {city}", { city: store.city })}</p>
            <p className="text-muted-foreground text-sm">{store.address}</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
              <Phone className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle as={headingLevel} className="text-lg text-primary">{t("Контакты")}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-1">
              {store.phones.map((phone) => (
                <a
                  key={phone.href}
                  href={phone.href}
                  className="block font-semibold text-lg hover:text-primary transition-colors"
                >
                  {phone.display}
                </a>
              ))}
            </div>
            <div className="flex justify-center gap-3">
              {SOCIALS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-brand-green-dark transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle as={headingLevel} className="text-lg text-primary">{t("Режим работы")}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-1">
            <div>
              <p className="font-semibold">{t("Пн–Сб:")}</p>
              <p className="text-muted-foreground text-sm">08:00–12:00, 13:00–18:00</p>
            </div>
            <div>
              <p className="font-semibold">{t("Воскресенье:")}</p>
              <p className="text-muted-foreground text-sm">{t("Выходной")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-brand overflow-hidden">
        <CardContent className="p-0">
          <div className="w-full h-[300px] md:h-[400px]">
            <iframe
              key={store.city}
              src={mapEmbedUrl(store)}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={t("Карта: магазин AFSONA, {city}", { city: store.city })}
            />
          </div>
          <div className="p-4 bg-muted/30">
            <div className="grid grid-cols-2 gap-3">
              <Button asChild variant="outline" size="sm" className="w-full">
                <a href={store.mapUrl} target="_blank" rel="noopener noreferrer">
                  <MapPin className="w-4 h-4 mr-2" />
                  Google Maps
                </a>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full">
                <a href={yandexMapUrl(store)} target="_blank" rel="noopener noreferrer">
                  <MapPin className="w-4 h-4 mr-2" />
                  {t("Яндекс.Карты")}
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreLocator;
