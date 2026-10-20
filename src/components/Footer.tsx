import { Link } from "react-router-dom";
import afsona_logo_full from "@/assets/afsona-logo-full.jpg";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { STORES } from "@/lib/contacts";
import { FaTelegram, FaWhatsapp, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-background text-foreground border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <img src={afsona_logo_full} alt="AFSONA - Эко материалы для ремонта" className="h-16 w-auto" />
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              Качественные краски и материалы для профессионального и домашнего ремонта. 
              Экологично, надежно, красиво.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Навигация</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="opacity-90 hover:opacity-100 hover:text-primary transition-colors">
                  Главная
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="opacity-90 hover:opacity-100 hover:text-primary transition-colors">
                  Каталог
                </Link>
              </li>
              <li>
                <Link to="/brands" className="opacity-90 hover:opacity-100 hover:text-primary transition-colors">
                  Бренды
                </Link>
              </li>
              <li>
                <Link to="/tinting" className="opacity-90 hover:opacity-100 hover:text-primary transition-colors">
                  Колеровка
                </Link>
              </li>
              <li>
                <Link to="/news" className="opacity-90 hover:opacity-100 hover:text-primary transition-colors">
                  Новости
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Информация</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="opacity-90 hover:opacity-100 hover:text-primary transition-colors">
                  О компании
                </Link>
              </li>
              <li>
                <Link to="/contacts" className="opacity-90 hover:opacity-100 hover:text-primary transition-colors">
                  Контакты
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Магазины</h4>
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
                <span>Пн–Сб: 08:00–12:00, 13:00–18:00<br />Воскресенье: выходной</span>
              </p>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <a href="https://www.instagram.com/afsona.build/" target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-primary transition-colors" aria-label="Instagram">
                <FaInstagram size={22} />
              </a>
              <a href="https://t.me/+992927557919" target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-primary transition-colors" aria-label="Telegram">
                <FaTelegram size={22} />
              </a>
              <a href="https://wa.me/992927557919" target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-primary transition-colors" aria-label="WhatsApp">
                <FaWhatsapp size={22} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm opacity-75">© 2026 AFSONA. Все права защищены. Эко материалы для ремонта.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;