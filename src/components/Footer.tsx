import afsona_logo from "@/assets/afsona-logo.png";

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
              <p>📍 г. Худжанд, 20-й микрорайон, 27</p>
              <p>📞 +992 927 55 79 19</p>
              <p>✉️ info@afsona.uz</p>
              <p>🕒 Пн-Пт: 08:00-12:00, 13:00-18:00</p>
              <p>🕒 Суббота: 08:00-12:00, 13:00-18:00</p>
              <p>🕒 Воскресенье: Выходной</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm opacity-75">
            © 2024 AFSONA. Все права защищены. Эко материалы для ремонта.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;