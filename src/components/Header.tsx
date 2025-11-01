import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, User, LogIn, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useUserRole } from "@/hooks/useUserRole";
import afsona_logo from "@/assets/afsona-logo.png";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const { user } = useAuth();
  const { getCartCount } = useCart();
  const { isAdmin } = useUserRole();
  const location = useLocation();
  const [completedOrdersCount, setCompletedOrdersCount] = useState(0);
  
  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
    } else {
      const element = document.getElementById(sectionId);
      element?.scrollIntoView({ behavior: 'smooth' });
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
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src={afsona_logo} 
              alt="AFSONA Logo" 
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold text-primary">AFSONA</h1>
              <p className="text-xs text-muted-foreground">Эко материалы для ремонта</p>
            </div>
          </Link>
          
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

          <div className="flex items-center space-x-2">
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