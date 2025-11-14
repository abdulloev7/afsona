import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Leaf } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ProductData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  image_fit: string | null;
  brand: string | null;
  brand_id: string | null;
  sizes: string[] | null;
  features: string[] | null;
  eco: boolean | null;
  in_stock: boolean | null;
  category: {
    name: string;
    slug: string;
  } | null;
  brand_info: {
    name: string;
  } | null;
}

const categoryRoutes: { [key: string]: string } = {
  'paints-and-coatings': '/paints-coatings',
  'decorative-coatings': '/decorative-coatings',
  'facade-paints': '/facade-paints',
  'ceiling-paints': '/ceiling-paints',
  'wall-paints': '/wall-paints',
  'primers-preparatory': '/primers',
  'putties-leveling': '/putties-leveling',
  'waterproofing-materials': '/waterproofing',
  'adhesives-sealants': '/adhesives-sealants',
  'tints-thinners': '/tints-thinners',
  'tools-equipment': '/tools',
  'brushes-accessories': '/brushes-tools',
  'rollers-equipment': '/rollers',
  'spatulas-accessories': '/spatulas-accessories',
};

export default function Product() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInCart, setIsInCart] = useState(false);
  const { addToCart, items } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          image,
          image_fit,
          brand,
          brand_id,
          sizes,
          features,
          eco,
          in_stock,
          category:categories(name, slug),
          brand_info:brands(name)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить товар",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      if (!data) {
        toast({
          title: "Товар не найден",
          description: "Такой товар не существует",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setProduct(data as ProductData);
      setLoading(false);
    };

    fetchProduct();
  }, [id, navigate, toast]);

  useEffect(() => {
    if (product) {
      setIsInCart(items.some(item => item.id === product.id));
    }
  }, [items, product]);

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите в систему для добавления товаров в корзину",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (product) {
      addToCart(product.id);
      setIsInCart(true);
    }
  };

  const handleGoToCart = () => {
    navigate('/cart');
  };

  const handleBackToCategory = () => {
    if (product?.category?.slug) {
      const route = categoryRoutes[product.category.slug];
      navigate(route || '/');
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Загрузка...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={handleBackToCategory}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад к категории
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <Card className="p-6">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className={`w-full h-[400px] ${
                  product.image_fit === 'contain' ? 'object-contain' : 'object-cover'
                } rounded-lg`}
              />
            ) : (
              <div className="w-full h-[400px] bg-muted rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground">Нет изображения</span>
              </div>
            )}
          </Card>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              {(product.brand_info?.name || product.brand) && (
                <p className="text-lg text-muted-foreground">
                  {product.brand_info?.name || product.brand}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {product.eco && (
                <Badge variant="secondary" className="gap-1">
                  <Leaf className="h-3 w-3" />
                  Эко
                </Badge>
              )}
              {!product.in_stock && (
                <Badge variant="destructive">Нет в наличии</Badge>
              )}
            </div>

            <div className="text-4xl font-bold text-primary">
              {product.price.toLocaleString('ru-RU')} сом.
            </div>

            {product.description && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Описание</h2>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Доступные размеры</h2>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size, index) => (
                    <Badge key={index} variant="outline">
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {product.features && product.features.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Особенности</h2>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              {!isInCart ? (
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                  size="lg"
                  className="flex-1"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Добавить в корзину
                </Button>
              ) : (
                <Button
                  onClick={handleGoToCart}
                  size="lg"
                  className="flex-1"
                  variant="secondary"
                >
                  Перейти к заказу
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
