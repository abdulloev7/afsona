import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNewsDate } from "@/lib/utils";
import { Calendar, ArrowLeft, Home } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  image: string | null;
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
        .select("id, title, content, image, published_at")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setNotFound(true);
      } else {
        setNews(data);
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

          {/* Image */}
          {news.image && (
            <img
              src={news.image}
              alt={news.title}
              className="w-full rounded-lg mb-8 max-h-[500px] object-cover"
            />
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-12">
            <p className="whitespace-pre-wrap text-foreground leading-relaxed">
              {news.content}
            </p>
          </div>

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
