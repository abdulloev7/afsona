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

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category_id: string;
  brand: string | null;
  eco: boolean;
  in_stock: boolean;
  archived: boolean;
  sizes: string[] | null;
  features: string[] | null;
  image_fit?: 'cover' | 'contain';
  category?: {
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [newSize, setNewSize] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [showArchived]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name)
        `)
        .eq('archived', showArchived)
        .order('name');

      if (error) throw error;
      setProducts((data || []).map(p => ({
        ...p,
        image_fit: (p.image_fit as 'cover' | 'contain') || 'cover'
      })));
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, productId?: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Ошибка",
        description: "Можно загружать только изображения",
        variant: "destructive",
      });
      return;
    }

    // Проверка размера (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Ошибка",
        description: "Размер файла не должен превышать 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Загрузка в Storage
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Получение публичного URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      // Обновление товара с новым URL изображения
      if (productId) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ image: publicUrl })
          .eq('id', productId);

        if (updateError) throw updateError;

        toast({
          title: "Успех",
          description: "Изображение загружено",
        });

        fetchProducts();
      } else if (editingProduct) {
        // Обновление локального состояния для нового товара
        setEditingProduct({ ...editingProduct, image: publicUrl });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить изображение",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAddSize = () => {
    if (!newSize.trim() || !editingProduct) return;
    
    const currentSizes = editingProduct.sizes || [];
    if (currentSizes.includes(newSize.trim())) {
      toast({
        title: "Внимание",
        description: "Такой объем уже добавлен",
        variant: "destructive",
      });
      return;
    }
    
    setEditingProduct({
      ...editingProduct,
      sizes: [...currentSizes, newSize.trim()],
    });
    setNewSize('');
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      sizes: (editingProduct.sizes || []).filter(size => size !== sizeToRemove),
    });
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const formData = new FormData(e.currentTarget);
      const productData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string),
        category_id: formData.get('category_id') as string,
        brand: formData.get('brand') as string,
        eco: formData.get('eco') === 'true',
        in_stock: formData.get('in_stock') === 'true',
        image: editingProduct.image,
        image_fit: (formData.get('image_fit') as 'cover' | 'contain') || 'cover',
        sizes: editingProduct.sizes,
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
        .update({ archived: !currentStatus })
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
    setEditingProduct(product || {
      id: '',
      name: '',
      description: '',
      price: 0,
      image: null,
      category_id: categories[0]?.id || '',
      brand: '',
      eco: false,
      in_stock: true,
      archived: false,
      sizes: null,
      features: null,
      image_fit: 'cover',
    });
    setDialogOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка товаров...</div>;
  }

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category_id === selectedCategory);

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
                <Label htmlFor="brand">Бренд</Label>
                <Input
                  id="brand"
                  name="brand"
                  defaultValue={editingProduct?.brand || ''}
                />
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
                <Label>Доступные объемы</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Например: 1л, 5л, 10кг"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSize();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddSize}
                    disabled={!newSize.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {editingProduct?.sizes && editingProduct.sizes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {editingProduct.sizes.map((size, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                      >
                        <span>{size}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSize(size)}
                          className="hover:bg-primary/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Изображение</Label>
                {editingProduct?.image && (
                  <div className="mt-2 mb-2 space-y-2">
                    <div className="bg-white rounded p-4">
                      <img
                        src={editingProduct.image}
                        alt="Product"
                        className={`w-full h-48 rounded ${
                          editingProduct.image_fit === 'contain' 
                            ? 'object-contain' 
                            : 'object-cover'
                        }`}
                      />
                    </div>
                    <div>
                      <Label htmlFor="image_fit">Масштаб изображения</Label>
                      <Select 
                        name="image_fit" 
                        value={editingProduct.image_fit || 'cover'}
                        onValueChange={(value: 'cover' | 'contain') => {
                          setEditingProduct({ ...editingProduct, image_fit: value });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cover">Заполнить (обрезать края)</SelectItem>
                          <SelectItem value="contain">Вместить (показать всё)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        {editingProduct.image_fit === 'contain' 
                          ? 'Изображение полностью помещается в рамку, могут быть отступы'
                          : 'Изображение заполняет всю рамку, края могут обрезаться'
                        }
                      </p>
                    </div>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e)}
                  disabled={uploading}
                />
                {uploading && <p className="text-sm text-muted-foreground mt-1">Загрузка...</p>}
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit" disabled={uploading}>
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
                  <div className="relative mb-4">
                    <div className="bg-white rounded p-2">
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
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute top-2 right-2"
                      onClick={() => document.getElementById(`upload-${product.id}`)?.click()}
                      disabled={uploading}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <input
                      id={`upload-${product.id}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, product.id)}
                    />
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="w-full h-48 bg-white rounded flex items-center justify-center">
                      <Package className="h-16 w-16 opacity-30" />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => document.getElementById(`upload-${product.id}`)?.click()}
                      disabled={uploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Загрузить фото
                    </Button>
                    <input
                      id={`upload-${product.id}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, product.id)}
                    />
                  </div>
                )}
                
                <div className="space-y-2 text-sm">
                  <p><strong>Категория:</strong> {product.category?.name}</p>
                  <p><strong>Цена:</strong> {product.price.toLocaleString('ru-RU')} сом.</p>
                  {product.brand && <p><strong>Бренд:</strong> {product.brand}</p>}
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