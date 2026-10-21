import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Leaf, ShoppingBag, ChevronRight, Palette } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ProductSizeSelector } from "@/components/ProductSizeSelector";
import { ProductMediaCarousel } from "@/components/ProductMediaCarousel";
import NotFound from "./NotFound";
import { useSeo } from "@/hooks/useSeo";
import { SITE_URL, toDescription } from "@/lib/seo";
import { getCategoryLink } from "@/lib/categories";
import { TINT_TIME } from "@/lib/facts";
import ProductStores from "@/components/ProductStores";
import RelatedProducts from "@/components/RelatedProducts";
import { formatPrice, lang, localized, pathFor, t } from "@/i18n";

// Categories whose products can be tinted in the store.
const TINTABLE_CATEGORIES = ['paints-and-coatings', 'decorative-coatings'];

interface ProductData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  image_fit: string | null;
  brand: string | null;
  brand_id: string | null;
  category_id: string | null;
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
    slug: string;
  } | null;
}

export default function Product() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const productImage = product?.image || product?.media?.find((m) => m.type === 'image')?.url || null;
  useSeo({
    title: product ? t("{name} — купить в Душанбе и Худжанде", { name: product.name }) : !loading ? t("Страница не найдена") : undefined,
    description: product
      ? toDescription(
          product.description,
          product.brand_info?.name
            ? t("{name} от {brand} в магазине AFSONA. Цена {price}, магазины в Душанбе и Худжанде.", {
                name: product.name,
                brand: product.brand_info.name,
                price: formatPrice(product.price),
              })
            : t("{name} в магазине AFSONA. Цена {price}, магазины в Душанбе и Худжанде.", {
                name: product.name,
                price: formatPrice(product.price),
              })
        )
      : undefined,
    image: productImage,
    type: 'product',
    noindex: !loading && !product,
    jsonLd: product
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: toDescription(product.description, product.name),
          image: productImage || undefined,
          brand: product.brand_info?.name || product.brand
            ? { '@type': 'Brand', name: product.brand_info?.name || product.brand }
            : undefined,
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'TJS',
            availability: product.in_stock === false
              ? 'https://schema.org/OutOfStock'
              : 'https://schema.org/InStock',
            url: `${SITE_URL}${pathFor(lang, `/product/${product.id}`)}`,
          },
        }
      : null,
  });
  const [isInCart, setIsInCart] = useState(false);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const { addToCart, items } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [id]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          name_tg,
          description,
          description_tg,
          price,
          image,
          image_fit,
          brand,
          brand_id,
          category_id,
          sizes,
          size_variants,
          features,
          eco,
          in_stock,
          media,
          category:categories(name, slug),
          brand_info:brands(name, slug)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching product:', error);
        toast({
          title: t("Ошибка"),
          description: t("Не удалось загрузить товар"),
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!data) {
        setLoading(false);
        return;
      }

      // Cast size_variants from Json to proper type; name and description in the visitor's language
      const typedData = {
        ...data,
        name: localized(data, 'name'),
        description: localized(data, 'description') || null,
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

  // Check if product has multiple variants requiring selection
  const productHasVariants = product ? (
    (product.size_variants && product.size_variants.length > 0) ||
    (product.sizes && product.sizes.length > 1)
  ) : false;

  const handleAddToCart = () => {
    if (!product) return;

    // Если у товара есть варианты, показать диалог выбора
    if (productHasVariants) {
      setShowSizeSelector(true);
      return;
    }

    // Если размер один или нет размеров, добавить сразу
    const size = product.sizes?.[0] || null;
    addToCart(product.id, 1, size);
    setIsInCart(true);
    toast({
      title: t("Товар добавлен"),
      description: t("Товар успешно добавлен в корзину"),
    });
  };

  const handleSizeSelected = async (size: string, quantity: number) => {
    if (!product) return;
    
    try {
      await addToCart(product.id, quantity, size);
      setShowSizeSelector(false);
      setIsInCart(true);
      toast({
        title: t("Товар добавлен"),
        description: t("Товар успешно добавлен в корзину"),
      });
    } catch (error) {
      toast({
        title: t("Ошибка"),
        description: t("Не удалось добавить товар в корзину"),
        variant: "destructive",
      });
    }
  };

  const handleGoToCart = () => {
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-[calc(var(--header-h)+2rem)] pb-8">
          <div className="text-center">{t("Загрузка...")}</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) return <NotFound />;

  const brandName = product.brand_info?.name || product.brand;
  const variants = product.size_variants && product.size_variants.length > 0 ? product.size_variants : null;
  const prices = variants ? variants.map((v) => v.price) : [product.price];
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const canTint = !!product.category && TINTABLE_CATEGORIES.includes(product.category.slug);

  const media = [
    ...(product.image
      ? [{ type: 'image' as const, url: product.image, fit: (product.image_fit || 'cover') as 'cover' | 'contain' }]
      : []),
    ...(product.media || []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-[calc(var(--header-h)+2rem)] pb-16">
        <nav aria-label={t("Навигация")} className="mb-6">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
            <li>
              <Link to="/catalog" className="hover:text-primary transition-colors">{t("Каталог")}</Link>
            </li>
            {product.category && (
              <>
                <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
                <li>
                  <Link to={getCategoryLink(product.category.slug)} className="hover:text-primary transition-colors">
                    {t(product.category.name)}
                  </Link>
                </li>
              </>
            )}
            <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
            <li aria-current="page" className="text-foreground line-clamp-1">{product.name}</li>
          </ol>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 [&>*]:min-w-0">
          <div className="md:sticky md:top-[calc(var(--header-h)+1rem)] self-start">
            <ProductMediaCarousel media={media} productName={product.name} />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold mb-2">{product.name}</h1>
              {brandName && (
                product.brand_info?.slug ? (
                  <Link
                    to={`/brands/${product.brand_info.slug}`}
                    className="text-base text-muted-foreground hover:text-primary transition-colors"
                  >
                    {brandName}
                  </Link>
                ) : (
                  <p className="text-base text-muted-foreground">{brandName}</p>
                )
              )}
            </div>

            {(product.eco || !product.in_stock) && (
              <div className="flex items-center gap-2">
                {product.eco && (
                  <Badge variant="secondary" className="gap-1">
                    <Leaf className="h-3 w-3" />
                    {t("Эко")}
                  </Badge>
                )}
                {!product.in_stock && (
                  <Badge variant="destructive">{t("Нет в наличии")}</Badge>
                )}
              </div>
            )}

            <div>
              <p className="text-3xl md:text-4xl font-semibold text-primary">
                {minPrice === maxPrice ? formatPrice(minPrice) : t("от {price}", { price: formatPrice(minPrice) })}
              </p>
              {variants && variants.length > 1 && (
                <ul className="mt-4 divide-y divide-border rounded-lg border border-border bg-card">
                  {variants.map((variant, index) => (
                    <li key={index} className="flex items-center justify-between px-4 py-2.5 text-sm">
                      <span className="text-foreground">{variant.volume}</span>
                      <span className="font-semibold text-foreground">{formatPrice(variant.price)}</span>
                    </li>
                  ))}
                </ul>
              )}
              {variants && variants.length === 1 && (
                <p className="mt-2 text-sm text-muted-foreground">{t("Фасовка: {sizes}", { sizes: variants[0].volume })}</p>
              )}
              {!variants && product.sizes && product.sizes.length > 0 && (
                <p className="mt-2 text-sm text-muted-foreground">{t("Фасовка: {sizes}", { sizes: product.sizes.join(', ') })}</p>
              )}
            </div>

            {productHasVariants || !isInCart ? (
              <Button
                onClick={handleAddToCart}
                disabled={!product.in_stock}
                size="lg"
                className="w-full"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {productHasVariants ? t("Выбрать фасовку") : t("Добавить в корзину")}
              </Button>
            ) : (
              <Button onClick={handleGoToCart} size="lg" variant="secondary" className="w-full">
                <ShoppingBag className="mr-2 h-5 w-5" />
                {t("Перейти к заказу")}
              </Button>
            )}

            {canTint && (
              <Link
                to="/tinting"
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors"
              >
                <Palette className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                <span className="text-sm">
                  <span className="font-medium text-foreground">{t("Нужен свой цвет?")}</span>{' '}
                  <span className="text-muted-foreground">{t("Подберём и заколеруем за {time}. Как это работает", { time: TINT_TIME })}</span>
                </span>
              </Link>
            )}

            <ProductStores productName={product.name} />

            {product.description && (
              <div>
                <h2 className="text-lg font-semibold mb-2">{t("Описание")}</h2>
                <p className="text-muted-foreground whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {product.features && product.features.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-2">{t("Особенности")}</h2>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {product.category_id && (
          <RelatedProducts categoryId={product.category_id} productId={product.id} />
        )}
      </main>
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
