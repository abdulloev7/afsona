import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Leaf, ShoppingBag } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ProductSizeSelector } from "@/components/ProductSizeSelector";

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
  size_variants: { volume: string; price: number }[] | null;
  features: string[] | null;
  eco: boolean | null;
  in_stock: boolean | null;
  media: { type: 'image' | 'video'; url: string; caption?: string; fit?: 'cover' | 'contain' }[] | null;
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
  const [showSizeSelector, setShowSizeSelector] = useState(false);
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
          size_variants,
          features,
          eco,
          in_stock,
          media,
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
        navigate('/');
        return;
      }

      // Cast size_variants from Json to proper type
      const typedData = {
        ...data,
        size_variants: data.size_variants as { volume: string; price: number }[] | null,
        media: data.media as { type: 'image' | 'video'; url: string; caption?: string; fit?: 'cover' | 'contain' }[] | null
      };

      setProduct(typedData);
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

    if (!product) return;

    // Если у товара есть несколько размеров, показать диалог
    if (product.sizes && product.sizes.length > 1) {
      setShowSizeSelector(true);
      return;
    }

    // Если размер один или нет размеров, добавить сразу
    const size = product.sizes?.[0] || null;
    addToCart(product.id, 1, size);
    setIsInCart(true);
    toast({
      title: "Товар добавлен",
      description: "Товар успешно добавлен в корзину",
    });
  };

  const handleSizeSelected = async (size: string, quantity: number) => {
    if (!product) return;
    
    try {
      await addToCart(product.id, quantity, size);
      setShowSizeSelector(false);
      setIsInCart(true);
      toast({
        title: "Товар добавлен",
        description: "Товар успешно добавлен в корзину",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить товар в корзину",
        variant: "destructive",
      });
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
          {/* Product Media/Image */}
          <div className="space-y-4">
            {product.media && product.media.length > 0 ? (
              <div className="space-y-4">
                {product.media.map((item, index) => (
                  <Card key={index} className="p-6">
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt={item.caption || product.name}
                        className={`w-full h-[400px] ${
                          item.fit === 'contain' ? 'object-contain' : 'object-cover'
                        } rounded-lg`}
                      />
                    ) : (
                      <video
                        src={item.url}
                        controls
                        className={`w-full h-[400px] ${
                          item.fit === 'contain' ? 'object-contain' : 'object-cover'
                        } rounded-lg`}
                      />
                    )}
                    {item.caption && (
                      <p className="text-sm text-muted-foreground mt-2 text-center">
                        {item.caption}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            ) : product.image ? (
              <Card className="p-6">
                <img
                  src={product.image}
                  alt={product.name}
                  className={`w-full h-[400px] ${
                    product.image_fit === 'contain' ? 'object-contain' : 'object-cover'
                  } rounded-lg`}
                />
              </Card>
            ) : (
              <Card className="p-6">
                <div className="w-full h-[400px] bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground">Нет изображения</span>
                </div>
              </Card>
            )}
          </div>

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
              {product.size_variants && product.size_variants.length > 0 ? (
                (() => {
                  const prices = product.size_variants.map(v => v.price);
                  const minPrice = Math.min(...prices);
                  const maxPrice = Math.max(...prices);
                  return minPrice === maxPrice 
                    ? `${minPrice.toLocaleString('ru-RU')} сом.`
                    : `от ${minPrice.toLocaleString('ru-RU')} до ${maxPrice.toLocaleString('ru-RU')} сом.`;
                })()
              ) : (
                `${product.price.toLocaleString('ru-RU')} сом.`
              )}
            </div>

            {product.description && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Описание</h2>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            )}

            {(product.size_variants && product.size_variants.length > 0) ? (
              <div>
                <h2 className="text-xl font-semibold mb-2">Доступные объемы</h2>
                <div className="flex flex-wrap gap-2">
                  {product.size_variants.map((variant, index) => (
                    <Badge key={index} variant="outline" className="text-sm py-1 px-3">
                      {variant.volume} - {variant.price.toLocaleString('ru-RU')} сом
                    </Badge>
                  ))}
                </div>
              </div>
            ) : product.sizes && product.sizes.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Доступные объемы</h2>
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
              {((product.size_variants && product.size_variants.length > 1) || 
                (product.sizes && product.sizes.length > 1)) ? (
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                  size="lg"
                  className="flex-1"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Добавить в корзину
                </Button>
              ) : !isInCart ? (
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
                  variant="secondary"
                  className="flex-1"
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Перейти к заказу
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <ProductSizeSelector
        product={product}
        isOpen={showSizeSelector}
        onClose={() => setShowSizeSelector(false)}
        onAddToCart={handleSizeSelected}
      />
      <Footer />
    </div>
  );
}
