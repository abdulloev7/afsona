import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNewsDate } from "@/lib/utils";
import { Calendar, ArrowLeft, Home, Image as ImageIcon, Video } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  caption?: string;
}

interface NewsItem {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  image: string | null;
  media: MediaItem[];
  published_at: string;
}

const NewsDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchNews();
    }
  }, [slug]);

  useEffect(() => {
    if (news) {
      document.title = `${news.title} - AFSONA`;
    }
    return () => {
      document.title = "AFSONA";
    };
  }, [news]);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("id, title, content, excerpt, image, media, published_at")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setNotFound(true);
      } else {
        setNews({
          ...data,
          media: (data.media as unknown as MediaItem[]) || [],
        });
      }
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить новость",
        variant: "destructive",
      });
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
          <Skeleton className="h-8 w-64 mb-8" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-6 w-48 mb-8" />
          <Skeleton className="h-96 w-full mb-8" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !news) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold mb-4">Новость не найдена</h1>
            <p className="text-muted-foreground mb-8">
              Запрашиваемая новость не существует или была удалена
            </p>
            <Button asChild>
              <Link to="/news">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Вернуться к новостям
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">
            <Home className="h-4 w-4" />
          </Link>
          <span>/</span>
          <Link to="/news" className="hover:text-foreground transition-colors">
            Новости
          </Link>
          <span>/</span>
          <span className="text-foreground">{news.title}</span>
        </nav>

        <article>
          {/* Title */}
          <h1 className="text-4xl font-bold mb-4">{news.title}</h1>

          {/* Date */}
          <div className="flex items-center gap-2 text-muted-foreground mb-8">
            <Calendar className="h-5 w-5" />
            <time dateTime={news.published_at}>
              {formatNewsDate(news.published_at)}
            </time>
          </div>

          {/* Main Image */}
          {news.image && (
            <img
              src={news.image}
              alt={news.title}
              className="w-full rounded-lg mb-8 max-h-[500px] object-cover"
            />
          )}

          {/* Excerpt */}
          {news.excerpt && (
            <div className="bg-muted p-4 rounded-lg border-l-4 border-primary mb-8">
              <p className="text-muted-foreground italic">{news.excerpt}</p>
            </div>
          )}

          {/* Rich Text Content */}
          <div
            className="prose prose-lg max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />

          {/* Media Gallery */}
          {news.media && news.media.length > 0 && (
            <div className="space-y-4 border-t pt-8 mb-12">
              <h3 className="text-2xl font-semibold flex items-center gap-2">
                <ImageIcon className="h-6 w-6" />
                Медиагалерея ({news.media.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {news.media.map((item, index) => (
                  <div key={index} className="space-y-2">
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt={item.caption || `Media ${index + 1}`}
                        className="w-full h-80 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="relative">
                        <video
                          src={item.url}
                          controls
                          className="w-full h-80 object-cover rounded-lg"
                        />
                        <div className="absolute top-3 left-3 bg-black/60 rounded px-2 py-1">
                          <Video className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    )}
                    {item.caption && (
                      <p className="text-sm text-muted-foreground text-center">
                        {item.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Back button */}
          <Button onClick={() => navigate("/news")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к новостям
          </Button>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default NewsDetail;
