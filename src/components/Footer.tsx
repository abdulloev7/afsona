import { Link } from "react-router-dom";
import afsona_logo_full from "@/assets/afsona-logo-full.jpg";
import { MapPin, ExternalLink } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
            <h4 className="font-semibold mb-4">Контактная информация</h4>
            <div className="space-y-2 text-sm opacity-90">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="cursor-pointer hover:opacity-80 transition-opacity text-left">
                    <p className="flex items-center gap-1">
                      📍 г. Худжанд, 20-й микрорайон, 27
                      <ExternalLink className="w-3 h-3" />
                    </p>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-background">
                  <DropdownMenuItem onClick={() => window.open('https://yandex.tj/maps/-/CLCdFG~t', '_blank')} className="cursor-pointer">
                    <MapPin className="w-4 h-4 mr-2" />
                    Открыть в Яндекс.Картах
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.open('https://maps.app.goo.gl/MEsrzn3JajJZfYk99', '_blank')} className="cursor-pointer">
                    <MapPin className="w-4 h-4 mr-2" />
                    Открыть в Google Maps
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <p>📞 +992 927 55 79 19</p>
              <p>✉️ info@afsona.com.tj</p>
              <p>🕒 Пн-Сб: 08:00-12:00, 13:00-18:00</p>
              <p>🕒 Воскресенье: Выходной</p>
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