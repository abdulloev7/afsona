import { Link } from "react-router-dom";
import afsonaEmblem from "@/assets/afsona-emblem.svg";
import afsonaWordmark from "@/assets/afsona-wordmark.svg";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { STORES } from "@/lib/contacts";
import { FaTelegram, FaWhatsapp, FaInstagram } from "react-icons/fa";
import { t } from "@/i18n";

const Footer = () => {
  return (
    <footer className="bg-background text-foreground border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            {/* Same vector logo as the header; the tagline is live text so /tg gets it in Tajik. */}
            <div className="mb-4 flex items-center gap-3" role="img" aria-label={t("AFSONA - Эко материалы для ремонта")}>
              <img src={afsonaEmblem} alt="" className="h-16 w-auto" />
              <div className="flex flex-col gap-1.5">
                <img src={afsonaWordmark} alt="" className="h-[34px] w-auto self-start" />
                <span className="text-[11px] font-medium uppercase leading-none tracking-[0.06em] text-[#1C6A50]">
                  {t("Эко материалы для ремонта")}
                </span>
              </div>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              {t("Качественные краски и материалы для профессионального и домашнего ремонта. Экологично, надежно, красиво.")}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("Навигация")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="opacity-90 hover:opacity-100 hover:text-primary transition-colors">
                  {t("Главная")}
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="opacity-90 hover:opacity-100 hover:text-primary transition-colors">
                  {t("Каталог")}
                </Link>
              </li>
              <li>
                <Link to="/brands" className="opacity-90 hover:opacity-100 hover:text-primary transition-colors">
                  {t("Бренды")}
                </Link>
              </li>
              <li>
                <Link to="/tinting" className="opacity-90 hover:opacity-100 hover:text-primary transition-colors">
                  {t("Колеровка")}
                </Link>
              </li>
              <li>
                <Link to="/news" className="opacity-90 hover:opacity-100 hover:text-primary transition-colors">
                  {t("Новости")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("Информация")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="opacity-90 hover:opacity-100 hover:text-primary transition-colors">
                  {t("О компании")}
                </Link>
              </li>
              <li>
                <Link to="/contacts" className="opacity-90 hover:opacity-100 hover:text-primary transition-colors">
                  {t("Контакты")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("Магазины")}</h4>
            <div className="space-y-3 text-sm opacity-90">
              {STORES.map((store) => (
                <div key={store.city}>
                  <a
                    href={store.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 hover:text-primary transition-colors"
                  >
                    <MapPin className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                    <span>
                      <span className="font-medium">{store.city}</span>, {store.address}
                    </span>
                  </a>
                  {store.phones.map((phone) => (
                    <a key={phone.href} href={phone.href} className="flex items-center gap-2 mt-1 hover:text-primary transition-colors">
                      <Phone className="w-4 h-4 shrink-0 text-primary" />
                      {phone.display}
                    </a>
                  ))}
                </div>
              ))}
              <a href="mailto:info@afsona.com.tj" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="w-4 h-4 shrink-0 text-primary" />
                info@afsona.com.tj
              </a>
              <p className="flex items-start gap-2">
                <Clock className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                <span>{t("Пн–Сб: 08:00–12:00, 13:00–18:00")}<br />{t("Воскресенье: выходной")}</span>
              </p>
            </div>
            <div className="flex items-center gap-1 mt-3 -ml-2.5">
              <a href="https://www.instagram.com/afsona.build/" target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-md text-foreground/70 hover:text-primary transition-colors" aria-label="Instagram">
                <FaInstagram size={22} />
              </a>
              <a href="https://t.me/+992927557919" target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-md text-foreground/70 hover:text-primary transition-colors" aria-label="Telegram">
                <FaTelegram size={22} />
              </a>
              <a href="https://wa.me/992927557919" target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-md text-foreground/70 hover:text-primary transition-colors" aria-label="WhatsApp">
                <FaWhatsapp size={22} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm opacity-75">{t("© 2026 AFSONA. Все права защищены. Эко материалы для ремонта.")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;