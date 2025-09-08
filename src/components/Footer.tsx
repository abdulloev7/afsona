const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/lovable-uploads/0cfee039-9423-4008-a9cd-6439832fb35b.png" 
                alt="AFSONA Logo" 
                className="h-10 w-auto filter brightness-0 invert"
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
              <p>📍 г. Ташкент, ул. Примерная, 123</p>
              <p>📞 +998 90 123 45 67</p>
              <p>✉️ info@afsona.uz</p>
              <p>🕒 Пн-Пт: 9:00-19:00</p>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-sm opacity-75">
            © 2024 AFSONA. Все права защищены. Эко материалы для ремонта.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;