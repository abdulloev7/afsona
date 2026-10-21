import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { MapPin, Calendar, ArrowRight, Briefcase } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { formatMonthYear, t } from "@/i18n";

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  caption?: string;
  fit?: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  location: string | null;
  completion_date: string | null;
  image: string | null;
  image_fit: string | null;
  media: MediaItem[] | null;
  published: boolean;
}

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  useSeo({
    title: t("Наши работы"),
    description: t("Портфолио AFSONA: примеры ремонта и отделки с нашими красками и материалами."),
  });
  const [loading, setLoading] = useState(true);
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast({
        title: t("Доступ запрещен"),
        description: t("Эта страница доступна только администраторам"),
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAdmin, roleLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchPortfolio();
    }
  }, [isAdmin]);

  const fetchPortfolio = async () => {
    try {
      const { data, error } = await supabase
        .from("portfolio")
        .select("id, title, slug, description, location, completion_date, image, image_fit, media, published")
        .order("completion_date", { ascending: false });

      if (error) throw error;
      
      // Map media from Json to MediaItem[]
      const mappedData: PortfolioItem[] = (data || []).map(item => ({
        ...item,
        media: (item.media as unknown as MediaItem[]) || null,
      }));
      
      setPortfolio(mappedData);
    } catch {
      toast({
        title: t("Ошибка"),
        description: t("Не удалось загрузить портфолио"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (roleLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t("Загрузка...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-[calc(var(--header-h)+2rem)] pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">{t("Портфолио проектов")}</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t("Объекты и проекты, выполненные с использованием нашей продукции")}
              </p>
              <Badge variant="outline" className="mt-4">
                {t("Только для администраторов")}
              </Badge>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p>{t("Загрузка проектов...")}</p>
              </div>
            ) : portfolio.length === 0 ? (
              <div className="text-center py-16">
                <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl font-bold mb-4">{t("Проектов пока нет")}</h2>
                <p className="text-muted-foreground mb-6">
                  {t("Добавьте первый проект через админ-панель")}
                </p>
                <Button onClick={() => navigate("/admin")}>
                  {t("Перейти в админ-панель")}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolio.map((item) => {
                  // Get preview image: use main image, or first media item
                  const previewImage = item.image || (item.media && item.media.length > 0 ? item.media[0].url : null);
                  const previewFit = item.image ? item.image_fit : (item.media && item.media.length > 0 ? item.media[0].fit : 'cover');
                  
                  return (
                  <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="aspect-video relative overflow-hidden bg-muted">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt={item.title}
                          className={`w-full h-full transition-transform duration-300 group-hover:scale-105 ${
                            previewFit === 'contain' ? 'object-contain' : 'object-cover'
                          }`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Briefcase className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      {!item.published && (
                        <Badge 
                          variant="secondary" 
                          className="absolute top-2 right-2"
                        >
                          {t("Черновик")}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                        {item.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{item.location}</span>
                          </div>
                        )}
                        {item.completion_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatMonthYear(item.completion_date)}
                            </span>
                          </div>
                        )}
                      </div>
                      <Link to={`/portfolio/${item.slug}`}>
                        <Button variant="outline" className="w-full group/btn">
                          {t("Подробнее")}
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Portfolio;
