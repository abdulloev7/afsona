import { Button } from "@/components/ui/button";

import afsona_logo from "@/assets/afsona-logo.png";

const Header = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <img 
              src={afsona_logo} 
              alt="AFSONA Logo" 
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold text-primary">AFSONA</h1>
              <p className="text-xs text-muted-foreground">Эко материалы для ремонта</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => scrollToSection('home')}
              className="text-foreground hover:text-primary transition-colors"
            >
              Главная
            </button>
            <button 
              onClick={() => scrollToSection('products')}
              className="text-foreground hover:text-primary transition-colors"
            >
              Ассортимент
            </button>
            <button 
              onClick={() => scrollToSection('about')}
              className="text-foreground hover:text-primary transition-colors"
            >
              О нас
            </button>
            <button 
              onClick={() => scrollToSection('contacts')}
              className="text-foreground hover:text-primary transition-colors"
            >
              Контакты
            </button>
          </nav>

          <Button 
            variant="default"
            onClick={() => scrollToSection('contacts')}
            className="hidden md:flex"
          >
            Связаться с нами
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;