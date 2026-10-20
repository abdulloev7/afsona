import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IconShoppingBag, IconUser, IconLogin, IconLayoutDashboard, IconMenu2, IconPhone, IconBrandWhatsapp } from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useUserRole } from "@/hooks/useUserRole";
import { SearchDialog } from "@/components/SearchDialog";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import afsona_logo_new from "@/assets/afsona-logo-new.jpg";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { STORE_PHONE_DISPLAY, STORE_PHONE_HREF, STORE_WHATSAPP_URL } from "@/lib/contacts";
import { t } from "@/i18n";

const Header = () => {
  const { user } = useAuth();
  const { getCartCount } = useCart();
  const { isAdmin } = useUserRole();
  const location = useLocation();
  const navigate = useNavigate();
  const [completedOrdersCount, setCompletedOrdersCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);
  
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
              alt={t("AFSONA - Эко материалы для ремонта")} 
              className="h-16 w-auto object-contain"
            />
          </Link>
          
          <nav className="hidden md:flex items-center gap-5 lg:gap-6">
            <Link 
              to="/catalog"
              className="text-foreground hover:text-primary transition-colors"
            >
              {t("Каталог")}
            </Link>
            <Link 
              to="/brands"
              className="text-foreground hover:text-primary transition-colors"
            >
              {t("Бренды")}
            </Link>
            <Link 
              to="/tinting"
              className="text-foreground hover:text-primary transition-colors"
            >
              {t("Колеровка")}
            </Link>
            <Link 
              to="/news"
              className="text-foreground hover:text-primary transition-colors"
            >
              {t("Новости")}
            </Link>
            {isAdmin && (
              <Link 
                to="/portfolio"
                className="text-foreground hover:text-primary transition-colors"
              >
                {t("Портфолио")}
              </Link>
            )}
            <Link 
              to="/about"
              className="text-foreground hover:text-primary transition-colors"
            >
              {t("О нас")}
            </Link>
            <Link 
              to="/contacts"
              className="text-foreground hover:text-primary transition-colors"
            >
              {t("Контакты")}
            </Link>
          </nav>

          <div className="flex items-center gap-1">
            <LanguageSwitcher className="hidden sm:flex mr-1" />
            <a
              href={STORE_PHONE_HREF}
              className="hidden xl:inline-flex items-center gap-1.5 px-2 font-semibold text-foreground hover:text-primary transition-colors whitespace-nowrap"
            >
              <IconPhone size={18} stroke={1.75} className="text-primary" />
              {STORE_PHONE_DISPLAY}
            </a>
            <Button asChild variant="ghost" size="icon" className="xl:hidden hover:bg-primary/10">
              <a href={STORE_PHONE_HREF} aria-label={t("Позвонить")}>
                <IconPhone size={20} stroke={1.5} />
              </a>
            </Button>
            <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex hover:bg-primary/10">
              <a href={STORE_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label={t("Написать в WhatsApp")}>
                <IconBrandWhatsapp size={20} stroke={1.5} />
              </a>
            </Button>
            <SearchDialog />
            <Button asChild variant="ghost" size="icon" className="relative hover:bg-primary/10">
              <Link to="/cart" aria-label={cartCount > 0 ? t("Корзина, товаров: {count}", { count: cartCount }) : t("Корзина")}>
                <IconShoppingBag size={20} stroke={1.5} />
                {cartCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    aria-hidden="true"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Link>
            </Button>
            {user ? (
              <>
                {isAdmin && (
                  <Button asChild variant="ghost" size="sm" className="hover:bg-primary/10">
                    <Link to="/admin" aria-label={t("Админ")}>
                      <IconLayoutDashboard size={20} stroke={1.5} className="mr-1" />
                      <span className="hidden md:inline">{t("Админ")}</span>
                    </Link>
                  </Button>
                )}
                <Button asChild variant="ghost" size="sm" className="relative hidden md:inline-flex hover:bg-primary/10">
                  <Link to="/profile?tab=orders">
                    <IconUser size={20} stroke={1.5} className="mr-1" />
                    {t("Профиль")}
                    {completedOrdersCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {completedOrdersCount}
                      </Badge>
                    )}
                  </Link>
                </Button>
              </>
            ) : (
              <Button asChild variant="ghost" size="icon" className="hidden md:inline-flex hover:bg-primary/10">
                <Link to="/auth" aria-label={t("Войти")} title={t("Войти")}>
                  <IconUser size={20} stroke={1.5} />
                </Link>
              </Button>
            )}

            {/* Mobile burger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label={t("Открыть меню")}>
                  <IconMenu2 size={24} stroke={1.5} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <SheetTitle className="sr-only">{t("Меню навигации")}</SheetTitle>
                <nav className="flex flex-col py-6">
                  {[
                    { to: "/", label: t("Главная") },
                    { to: "/catalog", label: t("Каталог") },
                    { to: "/brands", label: t("Бренды") },
                    { to: "/tinting", label: t("Колеровка") },
                    { to: "/news", label: t("Новости") },
                    ...(isAdmin ? [{ to: "/portfolio", label: t("Портфолио") }] : []),
                    { to: "/about", label: t("О нас") },
                    { to: "/contacts", label: t("Контакты") },
                  ].map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`px-6 py-3 text-base transition-colors hover:bg-accent ${
                        location.pathname === item.to ? "text-primary font-semibold bg-accent/50" : "text-foreground"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}

                  <div className="border-t border-border mt-4 pt-4 px-6 flex flex-col gap-2">
                    <LanguageSwitcher variant="full" className="mb-2" />
                    <Button asChild className="w-full">
                      <a href={STORE_PHONE_HREF}>
                        <IconPhone size={18} stroke={1.5} className="mr-2" />
                        {STORE_PHONE_DISPLAY}
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <a href={STORE_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                        <IconBrandWhatsapp size={18} stroke={1.5} className="mr-2" />
                        {t("Написать в WhatsApp")}
                      </a>
                    </Button>
                    {user ? (
                      <Link to="/profile?tab=orders">
                        <Button variant="outline" className="w-full justify-start relative">
                          <IconUser size={18} stroke={1.5} className="mr-2" />
                          {t("Профиль")}
                          {completedOrdersCount > 0 && (
                            <Badge variant="destructive" className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                              {completedOrdersCount}
                            </Badge>
                          )}
                        </Button>
                      </Link>
                    ) : (
                      <Link to="/auth">
                        <Button variant="ghost" className="w-full">
                          <IconLogin size={18} stroke={1.5} className="mr-2" />
                          {t("Войти")}
                        </Button>
                      </Link>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;