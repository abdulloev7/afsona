import afsona_logo from "@/assets/afsona-logo.png";
import { MapPin, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Footer = () => {
  return (
    <footer className="bg-background text-foreground border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src={afsona_logo} 
                alt="AFSONA Logo" 
                className="h-10 w-auto"
              />
              <div>
                <h3 className="text-xl font-bold">AFSONA</h3>
                <p className="text-sm opacity-90">Эко материалы для ремонта</p>
              </div>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              Качественные краски и материалы для профессионального и домашнего ремонта. 
              Экологично, надежно, красиво.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Наши услуги</h4>
            <ul className="space-y-2 text-sm opacity-90">
              <li>• Продажа красок и материалов</li>
              <li>• Консультации специалистов</li>
              <li>• Подбор цветов</li>
              <li>• Доставка по городу</li>
              <li>• Техническая поддержка</li>
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
                  <DropdownMenuItem 
                    onClick={() => window.open('https://yandex.tj/maps/-/CLCdFG~t', '_blank')}
                    className="cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Открыть в Яндекс.Картах
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => window.open('https://share.google/dBMsPOdCoxBGsOJOy', '_blank')}
                    className="cursor-pointer"
                  >
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
          <p className="text-sm opacity-75">
            © 2025 AFSONA. Все права защищены. Эко материалы для ремонта.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
