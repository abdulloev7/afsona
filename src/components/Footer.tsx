import afsona_logo from "@/assets/afsona-logo.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/locales/translations";

const Footer = () => {
  const { language } = useLanguage();
  const t = (key: any) => getTranslation(language, key);
  
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
                <h3 className="text-xl font-bold">{t('companyName')}</h3>
                <p className="text-sm opacity-90">{t('heroSubtitle')}</p>
              </div>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              {t('heroDescription')}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t('ourServices')}</h4>
            <ul className="space-y-2 text-sm opacity-90">
              <li>• {t('paintsSales')}</li>
              <li>• {t('professionalConsulting')}</li>
              <li>• {t('colorSelection')}</li>
              <li>• {t('delivery')}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t('contacts')}</h4>
            <div className="space-y-2 text-sm opacity-90">
              <p>📍 {t('addressText')}</p>
              <p>📞 +992 927 55 79 19</p>
              <p>✉️ info@afsona.com.tj</p>
              <p>🕒 {t('workHoursText')}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm opacity-75">
            © 2025 AFSONA. {t('allRightsReserved')}.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
