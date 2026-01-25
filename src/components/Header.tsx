import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, User, LogIn, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useUserRole } from "@/hooks/useUserRole";
import { SearchDialog } from "@/components/SearchDialog";
import afsona_logo_new from "@/assets/afsona-logo-new.jpg";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const { user } = useAuth();
  const { getCartCount } = useCart();
  const { isAdmin } = useUserRole();
  const location = useLocation();
  const navigate = useNavigate();
  const [completedOrdersCount, setCompletedOrdersCount] = useState(0);
  
  const storeScrollTarget = (sectionId: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('afsona-scroll-target', sectionId);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const scrollOnPage = () => {
      const element = document.getElementById(sectionId);
      if (element) {
        const headerOffset = document.querySelector('header')?.clientHeight ?? 0;
        const elementTop = element.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top: Math.max(elementTop, 0), behavior: 'smooth' });
      } else if (sectionId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    if (location.pathname !== '/') {
      storeScrollTarget(sectionId);
      navigate(`/#${sectionId}`);
    } else {
      scrollOnPage();
    }
  };

  const cartCount = getCartCount();

  // Проверка завершенных заказов
  useEffect(() => {
    if (!user) return;

    const fetchCompletedOrders = async () => {
      const lastView = localStorage.getItem('lastOrdersView');
      
      const { data, error } = await supabase
        .from('orders')
        .select('id, status, updated_at')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (!error && data) {
        // Показываем только заказы, завершенные после последнего просмотра
        const newCompletedOrders = lastView 
          ? data.filter(order => new Date(order.updated_at) > new Date(lastView))
          : data;
        
        setCompletedOrdersCount(newCompletedOrders.length);
      }
    };

    fetchCompletedOrders();

    // Real-time подписка на изменения статуса
    const channel = supabase
      .channel('order-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new.status === 'completed') {
            fetchCompletedOrders();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center h-16">
            <img 
              src={afsona_logo_new} 
              alt="AFSONA - Эко материалы для ремонта" 
              className="h-16 w-auto object-contain"
            />
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => scrollToSection('home')}
              className="text-foreground hover:text-primary transition-colors"
            >
              Главная
            </button>
            <button 
              onClick={() => scrollToSection('brands')}
              className="text-foreground hover:text-primary transition-colors"
            >
              Наши бренды
            </button>
            <button 
              onClick={() => scrollToSection('products')}
              className="text-foreground hover:text-primary transition-colors"
            >
              Ассортимент
            </button>
            <Link 
              to="/news"
              className="text-foreground hover:text-primary transition-colors"
            >
              Новости
            </Link>
            <button 
              onClick={() => scrollToSection('tinting')}
              className="text-foreground hover:text-primary transition-colors"
            >
              Колеровка
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

          <div className="flex items-center space-x-2">
            <SearchDialog />
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm">
                      <Shield className="h-4 w-4 mr-1" />
                      <span className="hidden md:inline">Админ</span>
                    </Button>
                  </Link>
                )}
                <Link to="/cart" className="relative">
                  <Button variant="ghost" size="sm">
                    <ShoppingCart className="h-4 w-4" />
                    {cartCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {cartCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <Link to="/profile?tab=orders" className="relative">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-1" />
                    Профиль
                    {completedOrdersCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {completedOrdersCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm">
                  <LogIn className="h-4 w-4 mr-1" />
                  Войти
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;