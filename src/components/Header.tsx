import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, LayoutGrid, LogIn, Menu, Phone, ShoppingBag, Truck, UserRound } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useUserRole } from "@/hooks/useUserRole";
import { SearchDialog } from "@/components/SearchDialog";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import afsonaEmblem from "@/assets/afsona-emblem.svg";
import afsonaWordmark from "@/assets/afsona-wordmark.svg";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { STORE_PHONE_DISPLAY, STORE_PHONE_HREF, STORE_WHATSAPP_URL } from "@/lib/contacts";
import { DELIVERY_MIN_ORDER } from "@/lib/facts";
import { NUMBER_LOCALE, t } from "@/i18n";
import { cn } from "@/lib/utils";

// Header actions are an icon with a visible label under it: a lone glyph makes
// people guess, a label doesn't. One icon set (lucide), one stroke width.
const ICON = { size: 22, strokeWidth: 1.75, "aria-hidden": true } as const;
const actionClass =
  "relative inline-flex h-[52px] min-w-[52px] shrink-0 flex-col items-center justify-center gap-1 rounded-md px-1.5 text-foreground transition-colors hover:bg-primary/10 hover:text-primary sm:min-w-[56px]";
const ActionLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-xs font-medium leading-none whitespace-nowrap">{children}</span>
);
const CountBadge = ({ count }: { count: number }) => (
  <span
    aria-hidden="true"
    className="absolute -right-2.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold leading-none text-primary-foreground tabular-nums ring-2 ring-background"
  >
    {count}
  </span>
);

const NAV_LINKS = [
  { to: "/brands", label: "Бренды" },
  { to: "/tinting", label: "Колеровка" },
  { to: "/news", label: "Новости" },
  { to: "/portfolio", label: "Портфолио", adminOnly: true },
  { to: "/about", label: "О нас" },
  { to: "/contacts", label: "Контакты" },
];

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

  const headerRef = useRef<HTMLElement>(null);

  // Pages pad their top by --header-h; the header changes height with the
  // breakpoint (two rows on phones and wide screens, one in between).
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isActive = (to: string) => location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex flex-wrap items-center gap-x-1 sm:flex-nowrap sm:gap-x-3 xl:gap-x-4 min-h-[60px] sm:h-[72px]">
          <Link to="/" aria-label={t("AFSONA - Эко материалы для ремонта")} className="flex shrink-0 items-center mr-auto sm:mr-1">
            <img src={afsonaEmblem} alt="" className="h-11 sm:h-[52px] w-auto" />
            <img src={afsonaWordmark} alt="" className="ml-2 sm:ml-2.5 h-[22px] sm:h-[28px] w-auto" />
          </Link>

          <Button asChild size="lg" className="hidden xl:inline-flex h-11 shrink-0 gap-2 px-5 text-[15px] font-semibold">
            <Link to="/catalog">
              <LayoutGrid size={20} strokeWidth={2} aria-hidden="true" />
              {t("Каталог")}
            </Link>
          </Button>

          {/* On phones the search field wraps onto its own full-width row. */}
          <SearchDialog className="order-last mb-2.5 basis-full sm:order-none sm:mb-0 sm:basis-auto sm:flex-1" />

          <div className="hidden md:flex shrink-0 flex-col gap-0.5 px-1">
            <a
              href={STORE_PHONE_HREF}
              className="inline-flex items-center gap-1.5 text-base font-semibold tabular-nums whitespace-nowrap text-foreground hover:text-primary transition-colors"
            >
              <Phone size={18} strokeWidth={2} className="text-primary" aria-hidden="true" />
              {STORE_PHONE_DISPLAY}
            </a>
            <span className="pl-6 text-xs text-muted-foreground whitespace-nowrap">
              {t("Пн–Сб 08:00–18:00")}
              <span className="hidden xl:inline">
                {" · "}
                <a
                  href={STORE_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2 hover:text-foreground"
                >
                  WhatsApp
                </a>
              </span>
            </span>
          </div>

          <a href={STORE_PHONE_HREF} className={cn(actionClass, "md:hidden")}>
            <Phone {...ICON} />
            <ActionLabel>{t("Звонок")}</ActionLabel>
          </a>

          {user && isAdmin && (
            <Link to="/admin" className={cn(actionClass, "hidden xl:inline-flex")}>
              <LayoutDashboard {...ICON} />
              <ActionLabel>{t("Админ")}</ActionLabel>
            </Link>
          )}
          {user ? (
            <Link to="/profile?tab=orders" className={cn(actionClass, "hidden xl:inline-flex")}>
              <span className="relative inline-flex">
                <UserRound {...ICON} />
                {completedOrdersCount > 0 && <CountBadge count={completedOrdersCount} />}
              </span>
              <ActionLabel>{t("Профиль")}</ActionLabel>
            </Link>
          ) : (
            <Link to="/auth" className={cn(actionClass, "hidden xl:inline-flex")}>
              <UserRound {...ICON} />
              <ActionLabel>{t("Войти")}</ActionLabel>
            </Link>
          )}

          <Link
            to="/cart"
            className={actionClass}
            aria-label={cartCount > 0 ? t("Корзина, товаров: {count}", { count: cartCount }) : undefined}
          >
            <span className="relative inline-flex">
              <ShoppingBag {...ICON} />
              {cartCount > 0 && <CountBadge count={cartCount} />}
            </span>
            <ActionLabel>{t("Корзина")}</ActionLabel>
          </Link>

          {/* Mobile burger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button type="button" className={cn(actionClass, "xl:hidden")} aria-label={t("Открыть меню")}>
                <Menu {...ICON} />
                <ActionLabel>{t("Меню")}</ActionLabel>
              </button>
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
                  ...(isAdmin ? [{ to: "/admin", label: t("Админ") }] : []),
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
                      <Phone size={18} strokeWidth={1.75} className="mr-2" aria-hidden="true" />
                      {STORE_PHONE_DISPLAY}
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <a href={STORE_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                      <FaWhatsapp size={18} className="mr-2" aria-hidden="true" />
                      {t("Написать в WhatsApp")}
                    </a>
                  </Button>
                  {user ? (
                    <Button asChild variant="outline" className="w-full justify-start relative">
                      <Link to="/profile?tab=orders">
                        <UserRound size={18} strokeWidth={1.75} className="mr-2" aria-hidden="true" />
                        {t("Профиль")}
                        {completedOrdersCount > 0 && (
                          <Badge className="ml-auto h-5 min-w-5 rounded-full px-1 flex items-center justify-center text-xs">
                            {completedOrdersCount}
                          </Badge>
                        )}
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild variant="ghost" className="w-full">
                      <Link to="/auth">
                        <LogIn size={18} strokeWidth={1.75} className="mr-2" aria-hidden="true" />
                        {t("Войти")}
                      </Link>
                    </Button>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <div className="hidden xl:flex h-[42px] items-stretch gap-6 border-t border-border/60">
          <nav className="flex flex-1 items-stretch gap-6 whitespace-nowrap text-[15px]">
            {NAV_LINKS.filter((item) => !item.adminOnly || isAdmin).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                aria-current={isActive(item.to) ? "page" : undefined}
                className={cn(
                  "flex items-center border-b-2 transition-colors",
                  isActive(item.to)
                    ? "border-primary font-semibold text-primary"
                    : "border-transparent text-foreground hover:text-primary",
                )}
              >
                {t(item.label)}
              </Link>
            ))}
          </nav>
          <span className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
            <Truck size={18} strokeWidth={1.75} className="text-primary" aria-hidden="true" />
            {t("Доставка по городу от {amount} сом", { amount: DELIVERY_MIN_ORDER.toLocaleString(NUMBER_LOCALE) })}
          </span>
          <LanguageSwitcher className="self-center" />
        </div>
      </div>
    </header>
  );
};

export default Header;