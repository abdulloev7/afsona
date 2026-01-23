const About = () => {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              О компании AFSONA
            </h2>
            <p className="text-lg text-muted-foreground">
              Ваш надежный партнер в мире красок и материалов для ремонта
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-card border rounded-lg p-8 text-foreground shadow-card">
              <h3 className="text-2xl font-bold mb-6">Наша миссия</h3>
              <p className="text-base mb-6 leading-relaxed">
                AFSONA — это больше чем магазин красок. Мы стремимся предоставить нашим клиентам 
                только самые качественные и экологичные материалы для создания уютного и красивого дома.
              </p>
              <p className="text-base mb-6 leading-relaxed">
                Наша команда экспертов поможет вам выбрать идеальные материалы для любого проекта — 
                от небольшого ремонта до масштабной реновации.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-accent rounded-full mr-4"></div>
                  <span>Более 500 видов красок и материалов</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-accent rounded-full mr-4"></div>
                  <span>Только проверенные производители</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-accent rounded-full mr-4"></div>
                  <span>Экспертные консультации и поддержка</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-accent rounded-full mr-4"></div>
                  <span>Быстрая доставка по городу</span>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-8 text-foreground shadow-card">
              <h3 className="text-2xl font-bold mb-6">Наши преимущества</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">🌱 Экологичность</h4>
                  <p className="text-sm opacity-90">
                    Приоритет экологически чистым материалам, безопасным для здоровья
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">🎨 Широкий выбор</h4>
                  <p className="text-sm opacity-90">
                    Огромная палитра цветов и текстур для воплощения любых идей
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">💎 Премиум качество</h4>
                  <p className="text-sm opacity-90">
                    Работаем только с проверенными брендами высшего качества
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">👨‍🎨 Экспертная поддержка</h4>
                  <p className="text-sm opacity-90">
                    Профессиональные консультации на каждом этапе вашего проекта
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;