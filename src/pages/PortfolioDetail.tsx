import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, MapPin, Calendar, ChevronRight } from "lucide-react";
import DOMPurify from "dompurify";

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  caption?: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  location: string | null;
  completion_date: string | null;
  image: string | null;
  image_fit: string | null;
  media: MediaItem[];
  published: boolean;
  created_at: string;
}

const PortfolioDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [item, setItem] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast({
        title: "Доступ запрещен",
        description: "Эта страница доступна только администраторам",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAdmin, roleLoading, navigate]);

  useEffect(() => {
    if (isAdmin && slug) {
      fetchPortfolioItem();
    }
  }, [isAdmin, slug]);

  const fetchPortfolioItem = async () => {
    try {
      const { data, error } = await supabase
        .from("portfolio")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        toast({
          title: "Не найдено",
          description: "Проект не найден",
          variant: "destructive",
        });
        navigate("/portfolio");
        return;
      }

      setItem({
        ...data,
        media: (data.media as unknown as MediaItem[]) || [],
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить проект",
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
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-[400px] w-full mb-6" />
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!item) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link to="/" className="hover:text-foreground transition-colors">
                Главная
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/portfolio" className="hover:text-foreground transition-colors">
                Портфолио
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">{item.title}</span>
            </nav>

            {/* Back button */}
            <Button
              variant="ghost"
              onClick={() => navigate("/portfolio")}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к портфолио
            </Button>

            {/* Status badge */}
            {!item.published && (
              <Badge variant="secondary" className="mb-4">
                Черновик
              </Badge>
            )}

            {/* Main image */}
            {item.image && (
              <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-8">
                <img
                  src={item.image}
                  alt={item.title}
                  className={`w-full h-full ${
                    item.image_fit === 'contain' ? 'object-contain' : 'object-cover'
                  }`}
                />
              </div>
            )}

            {/* Title and metadata */}
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{item.title}</h1>
            
            <div className="flex flex-wrap gap-4 text-muted-foreground mb-8">
              {item.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{item.location}</span>
                </div>
              )}
              {item.completion_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>
                    {new Date(item.completion_date).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {item.description && (
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {item.description}
              </p>
            )}

            {/* Rich text content */}
            <article 
              className="prose prose-lg dark:prose-invert max-w-none mb-12"
              dangerouslySetInnerHTML={{ 
                __html: DOMPurify.sanitize(item.content) 
              }}
            />

            {/* Media gallery */}
            {item.media && item.media.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Галерея</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {item.media.map((mediaItem, index) => (
                    <div key={index} className="rounded-lg overflow-hidden bg-muted">
                      {mediaItem.type === 'video' ? (
                        <video
                          src={mediaItem.url}
                          controls
                          className="w-full aspect-video"
                        />
                      ) : (
                        <img
                          src={mediaItem.url}
                          alt={mediaItem.caption || `Изображение ${index + 1}`}
                          className="w-full aspect-video object-cover"
                        />
                      )}
                      {mediaItem.caption && (
                        <p className="p-3 text-sm text-muted-foreground">
                          {mediaItem.caption}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Back button at bottom */}
            <div className="mt-12 pt-8 border-t">
              <Button
                variant="outline"
                onClick={() => navigate("/portfolio")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Вернуться к списку проектов
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PortfolioDetail;
