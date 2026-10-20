import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Mail } from "lucide-react";
import { FaTelegram, FaWhatsapp, FaInstagram } from "react-icons/fa";
import StoreCard from "@/components/StoreCard";
import { STORES, STORE_HOURS, STORE_WHATSAPP_URL } from "@/lib/contacts";

const ContactsPreview = () => {
  return (
    <section id="contacts" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto mb-6">
          <h2 className="text-3xl md:text-4xl font-semibold mb-2 text-foreground">
            Наши магазины
          </h2>
          <p className="text-muted-foreground">
            Худжанд и Душанбе. Приезжайте или звоните, поможем подобрать материалы.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {STORES.map((store) => (
              <StoreCard key={store.city} store={store} />
            ))}
          </div>

          <div className="rounded-lg border border-border bg-card p-5 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="flex items-center gap-2 text-sm text-foreground">
              <Clock className="w-4 h-4 shrink-0 text-primary" />
              {STORE_HOURS}, воскресенье выходной
            </p>
            <div className="flex items-center gap-2">
              {[
                { href: STORE_WHATSAPP_URL, label: "WhatsApp", Icon: FaWhatsapp },
                { href: "https://t.me/afsona_build", label: "Telegram-канал", Icon: FaTelegram },
                { href: "https://www.instagram.com/afsona.build/", label: "Instagram", Icon: FaInstagram },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-brand-green-dark transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
              <a
                href="mailto:info@afsona.com.tj"
                aria-label="Email"
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-brand-green-dark transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

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
