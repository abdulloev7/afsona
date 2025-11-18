import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Package, Pencil, Upload, Trash2, Plus, X, Archive } from 'lucide-react';
import { z } from 'zod';
import { MediaUploader, MediaItem } from './MediaUploader';

const productSchema = z.object({
  name: z.string().trim().min(1, "Название обязательно").max(200, "Название должно быть короче 200 символов"),
  description: z.string().trim().max(2000, "Описание должно быть короче 2000 символов").optional().or(z.literal('')),
  price: z.number().positive("Цена должна быть положительной").max(999999.99, "Цена слишком высокая"),
  category_id: z.string().uuid("Выберите категорию"),
  brand_id: z.string().uuid("Неверный идентификатор бренда").nullable(),
  eco: z.boolean(),
  in_stock: z.boolean(),
  image_fit: z.enum(['cover', 'contain']),
});

interface SizeVariant {
  volume: string;
  price: number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category_id: string;
  brand_id: string | null;
  brand: string | null; // Keep for backwards compatibility with old data
  eco: boolean;
  in_stock: boolean;
  archived: boolean;
  sizes: string[] | null;
  size_variants?: SizeVariant[] | null;
  features: string[] | null;
  image_fit?: 'cover' | 'contain';
  media?: MediaItem[] | null;
  category?: {
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [newVariantVolume, setNewVariantVolume] = useState('');
  const [newVariantPrice, setNewVariantPrice] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [showArchived]);

  const fetchProducts = async () => {
    try {
      const query = supabase
        .from('products' as any)
        .select(`
          *,
          category:categories(name),
          brand:brands(id, name),
          media
        `)
        .eq('archived', showArchived)
        .order('name');
      
      const { data, error } = await query as any;

      if (error) throw error;
      setProducts(((data || []) as any[]).map(p => ({
        ...p,
        archived: p.archived ?? false,
        image_fit: (p.image_fit as 'cover' | 'contain') || 'cover',
        media: p.media as MediaItem[] | null
      })) as Product[]);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить товары",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands' as any)
        .select('id, name')
        .order('name') as any;

      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };


  const handleAddVariant = () => {
    if (!newVariantVolume.trim() || !newVariantPrice || !editingProduct) return;
    
    const price = parseFloat(newVariantPrice);
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Ошибка",
        description: "Цена должна быть положительным числом",
        variant: "destructive",
      });
      return;
    }

    const exists = editingProduct.size_variants?.some(v => v.volume === newVariantVolume.trim());
    if (exists) {
      toast({
        title: "Ошибка",
        description: "Такой объем уже существует",
        variant: "destructive",
      });
      return;
    }
    
    setEditingProduct({
      ...editingProduct,
      size_variants: [...(editingProduct.size_variants || []), { volume: newVariantVolume.trim(), price }]
    });
    setNewVariantVolume('');
    setNewVariantPrice('');
  };

  const handleRemoveVariant = (index: number) => {
    if (!editingProduct) return;
    
    const newVariants = [...(editingProduct.size_variants || [])];
    newVariants.splice(index, 1);
    setEditingProduct({
      ...editingProduct,
      size_variants: newVariants
    });
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const formData = new FormData(e.currentTarget);
      const rawPrice = parseFloat(formData.get('price') as string);
      
      // Validate form data
      const validationResult = productSchema.safeParse({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        price: isNaN(rawPrice) ? 0 : rawPrice,
        category_id: formData.get('category_id') as string,
        brand_id: (() => {
          const brandId = formData.get('brand_id') as string;
          return brandId === 'none' ? null : brandId;
        })(),
        eco: formData.get('eco') === 'true',
        in_stock: formData.get('in_stock') === 'true',
        image_fit: (formData.get('image_fit') as 'cover' | 'contain') || 'cover',
      });

      if (!validationResult.success) {
        const errors = validationResult.error.issues.map(e => e.message).join(', ');
        toast({
          title: "Ошибка валидации",
          description: errors,
          variant: "destructive",
        });
        return;
      }

      // Upload media files to Storage
      const uploadedMedia: Omit<MediaItem, 'file'>[] = [];
      for (const item of media) {
        if (item.file) {
          const fileExt = item.file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, item.file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);

          uploadedMedia.push({
            type: item.type,
            url: publicUrl,
            caption: item.caption,
            fit: item.fit,
          });
        } else {
          uploadedMedia.push({
            type: item.type,
            url: item.url,
            caption: item.caption,
            fit: item.fit,
          });
        }
      }

      // Используем первое медиа как главное изображение для обратной совместимости
      const mainImage = uploadedMedia.length > 0 && uploadedMedia[0].type === 'image' 
        ? uploadedMedia[0].url 
        : editingProduct.image;
      
      const mainImageFit = uploadedMedia.length > 0 
        ? uploadedMedia[0].fit 
        : validationResult.data.image_fit;

      const productData = {
        ...validationResult.data,
        image: mainImage,
        image_fit: mainImageFit,
        media: uploadedMedia,
        sizes: null, // Больше не используем старое поле
        size_variants: editingProduct.size_variants ? JSON.parse(JSON.stringify(editingProduct.size_variants)) : null,
      };

      if (editingProduct.id) {
        // Обновление существующего товара
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;

        toast({
          title: "Успех",
          description: "Товар обновлен",
        });
      } else {
        // Создание нового товара
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;

        toast({
          title: "Успех",
          description: "Товар создан",
        });
      }

      setDialogOpen(false);
      setEditingProduct(null);
      setMedia([]);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить товар",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Успех",
        description: "Товар удален",
      });

      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить товар",
        variant: "destructive",
      });
    }
  };

  const handleToggleArchive = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ archived: !currentStatus } as any)
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Успех",
        description: currentStatus ? "Товар разархивирован" : "Товар архивирован",
      });

      fetchProducts();
    } catch (error) {
      console.error('Error toggling archive:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус товара",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (product?: Product) => {
    // Если есть старые sizes но нет size_variants, конвертируем их
    let updatedProduct = product;
    if (product && product.sizes && product.sizes.length > 0 && (!product.size_variants || product.size_variants.length === 0)) {
      updatedProduct = {
        ...product,
        size_variants: product.sizes.map(size => ({ volume: size, price: product.price }))
      };
    }
    
    setEditingProduct(updatedProduct || {
      id: '',
      name: '',
      description: '',
      price: 0,
      image: null,
      category_id: categories[0]?.id || '',
      brand_id: null,
      brand: '',
      eco: false,
      in_stock: true,
      archived: false,
      sizes: null,
      features: null,
      image_fit: 'cover',
    });
    
    // Объединяем старое изображение с новыми медиа
    const combinedMedia: MediaItem[] = [];
    if (product?.image) {
      combinedMedia.push({
        type: 'image',
        url: product.image,
        fit: product.image_fit || 'cover'
      });
    }
    if (product?.media) {
      combinedMedia.push(...product.media);
    }
    
    setMedia(combinedMedia);
    setDialogOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка товаров...</div>;
  }

  const filteredProducts = products.filter(p => {
    const categoryMatch = selectedCategory === 'all' || p.category_id === selectedCategory;
    const brandMatch = selectedBrand === 'all' || p.brand_id === selectedBrand;
    return categoryMatch && brandMatch;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Управление товарами</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="archive-filter">Статус:</Label>
            <Select value={showArchived ? 'archived' : 'active'} onValueChange={(v) => setShowArchived(v === 'archived')}>
              <SelectTrigger id="archive-filter" className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Активные товары</SelectItem>
                <SelectItem value="archived">Архивные товары</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="brand-filter">Бренд:</Label>
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger id="brand-filter" className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все бренды</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="category-filter">Категория:</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category-filter" className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории ({products.length})</SelectItem>
                {categories.map((cat) => {
                  const count = products.filter(p => p.category_id === cat.id).length;
                  return (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name} ({count})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openEditDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить товар
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct?.id ? 'Редактировать товар' : 'Добавить товар'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <Label htmlFor="name">Название *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingProduct?.name}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingProduct?.description || ''}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Цена (сом) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={editingProduct?.price}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category_id">Категория *</Label>
                  <Select
                    name="category_id"
                    defaultValue={editingProduct?.category_id}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="brand_id">Бренд</Label>
                <Select name="brand_id" defaultValue={editingProduct?.brand_id || 'none'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите бренд" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Без бренда</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eco">Эко-продукт</Label>
                  <Select name="eco" defaultValue={editingProduct?.eco ? 'true' : 'false'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Да</SelectItem>
                      <SelectItem value="false">Нет</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="in_stock">В наличии</Label>
                  <Select name="in_stock" defaultValue={editingProduct?.in_stock ? 'true' : 'false'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Да</SelectItem>
                      <SelectItem value="false">Нет</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Варианты объемов с ценами</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Объем (например: 0,7 л)"
                      value={newVariantVolume}
                      onChange={(e) => setNewVariantVolume(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Цена"
                      value={newVariantPrice}
                      onChange={(e) => setNewVariantPrice(e.target.value)}
                      className="w-32"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddVariant}
                      disabled={!newVariantVolume.trim() || !newVariantPrice}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {editingProduct?.size_variants && editingProduct.size_variants.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {editingProduct.size_variants.map((variant, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-primary/10 text-primary px-3 py-2 rounded"
                        >
                          <span className="font-medium">{variant.volume}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{variant.price} сом</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveVariant(index)}
                              className="hover:bg-primary/20 rounded-full p-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Если варианты не указаны, будет использована общая цена
                </p>
              </div>


              <div>
                <Label>Медиа галерея (фото и видео)</Label>
                <MediaUploader media={media} onChange={setMedia} />
                <p className="text-xs text-muted-foreground mt-2">
                  Первое медиа будет отображаться на карточке товара. Используйте стрелки для навигации в полном просмотре.
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit">
                  Сохранить
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        selectedCategory === 'all' ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold mb-2">Товаров пока нет</h3>
          <p className="text-muted-foreground mb-4">
            Начните с добавления первого товара
          </p>
          <Button onClick={() => openEditDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить товар
          </Button>
        </div>
        ) : (
          <div className="text-center py-16">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">Нет товаров в этой категории</h3>
            <p className="text-muted-foreground mb-4">
              Попробуйте выбрать другую категорию
            </p>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <CardTitle className="text-lg">{product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {product.image ? (
                  <div className="bg-white rounded p-2 mb-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className={`w-full h-48 rounded ${
                        product.image_fit === 'contain' 
                          ? 'object-contain' 
                          : 'object-cover'
                      }`}
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-white rounded flex items-center justify-center mb-4">
                    <Package className="h-16 w-16 opacity-30" />
                  </div>
                )}
                
                <div className="space-y-2 text-sm">
                  <p><strong>Категория:</strong> {product.category?.name}</p>
                  <p><strong>Цена:</strong> {product.price.toLocaleString('ru-RU')} сом.</p>
                  {(product as any).brand?.name && <p><strong>Бренд:</strong> {(product as any).brand.name}</p>}
                  {product.sizes && product.sizes.length > 0 && (
                    <div>
                      <p className="font-semibold mb-1">Объемы:</p>
                      <div className="flex flex-wrap gap-1">
                        {product.sizes.map((size, index) => (
                          <span key={index} className="bg-muted px-2 py-0.5 rounded text-xs">
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {product.archived && (
                      <span className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs font-semibold">
                        АРХИВ
                      </span>
                    )}
                    {product.eco && (
                      <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-xs">
                        ЭКО
                      </span>
                    )}
                    {product.in_stock ? (
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                        В наличии
                      </span>
                    ) : (
                      <span className="bg-destructive/10 text-destructive px-2 py-1 rounded text-xs">
                        Нет в наличии
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(product)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Изменить
                  </Button>
                  <Button
                    variant={product.archived ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToggleArchive(product.id, product.archived)}
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}