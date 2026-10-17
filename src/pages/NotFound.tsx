import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 text-center py-16">
          <p className="text-6xl font-bold text-primary mb-4">404</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Страница не найдена</h1>
          <p className="text-muted-foreground mb-8">
            Возможно, ссылка устарела или товар больше не продаётся. Загляните в каталог или позвоните нам: +992 927 55 79 19
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/catalog">Перейти в каталог</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/">На главную</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
