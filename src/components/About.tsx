import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/locales/translations";

const About = () => {
  const { language } = useLanguage();
  const t = (key: any) => getTranslation(language, key);
  
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              {t('aboutTitle')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('aboutSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-primary">{t('ourMission')}</h3>
              <p className="text-base mb-6 text-foreground leading-relaxed">
                {t('missionText')}
              </p>
              <p className="text-base mb-6 text-foreground leading-relaxed">
                {t('valuesText')}
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
              <h3 className="text-2xl font-bold mb-6">{t('advantages')}</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">🌱 {t('ecoFriendly')}</h4>
                  <p className="text-sm opacity-90">
                    {t('ecoDescription')}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">🎨 {t('wideRange')}</h4>
                  <p className="text-sm opacity-90">
                    {t('wideRangeDesc')}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">💎 {t('quality')}</h4>
                  <p className="text-sm opacity-90">
                    {t('qualityDescription')}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">👨‍🎨 {t('expertAdvice')}</h4>
                  <p className="text-sm opacity-90">
                    {t('expertAdviceDesc')}
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