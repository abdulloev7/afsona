import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Upload, MoveUp, MoveDown } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  website: string | null;
  country: string | null;
  established_year: number | null;
  display_order: number;
}

const BrandManagement = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo: '',
    description: '',
    website: '',
    country: '',
    established_year: '',
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить бренды",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите изображение",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, logo: publicUrl }));
      
      toast({
        title: "Успех",
        description: "Логотип загружен",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить логотип",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const openEditDialog = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name,
        slug: brand.slug,
        logo: brand.logo || '',
        description: brand.description || '',
        website: brand.website || '',
        country: brand.country || '',
        established_year: brand.established_year?.toString() || '',
      });
    } else {
      setEditingBrand(null);
      setFormData({
        name: '',
        slug: '',
        logo: '',
        description: '',
        website: '',
        country: '',
        established_year: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSaveBrand = async () => {
    if (!formData.name || !formData.slug) {
      toast({
        title: "Ошибка",
        description: "Название и slug обязательны",
        variant: "destructive",
      });
      return;
    }

    try {
      const brandData = {
        name: formData.name,
        slug: formData.slug,
        logo: formData.logo || null,
        description: formData.description || null,
        website: formData.website || null,
        country: formData.country || null,
        established_year: formData.established_year ? parseInt(formData.established_year) : null,
        display_order: editingBrand ? editingBrand.display_order : brands.length,
      };

      if (editingBrand) {
        const { error } = await supabase
          .from('brands')
          .update(brandData)
          .eq('id', editingBrand.id);

        if (error) throw error;
        toast({ title: "Успех", description: "Бренд обновлен" });
      } else {
        const { error } = await supabase
          .from('brands')
          .insert([brandData]);

        if (error) throw error;
        toast({ title: "Успех", description: "Бренд добавлен" });
      }

      setDialogOpen(false);
      fetchBrands();
    } catch (error: any) {
      console.error('Error saving brand:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось сохранить бренд",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот бренд?')) return;

    try {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: "Успех", description: "Бренд удален" });
      fetchBrands();
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить бренд",
        variant: "destructive",
      });
    }
  };

  const moveBrand = async (brand: Brand, direction: 'up' | 'down') => {
    const currentIndex = brands.findIndex(b => b.id === brand.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= brands.length) return;

    const otherBrand = brands[newIndex];
    
    try {
      await supabase.from('brands').update({ display_order: otherBrand.display_order }).eq('id', brand.id);
      await supabase.from('brands').update({ display_order: brand.display_order }).eq('id', otherBrand.id);
      
      fetchBrands();
    } catch (error) {
      console.error('Error reordering brands:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось изменить порядок",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-8">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Управление брендами</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openEditDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить бренд
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBrand ? 'Редактировать бренд' : 'Добавить бренд'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Название *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Soudal"
                />
              </div>
              <div>
                <Label>Slug (URL) *</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="soudal"
                />
              </div>
              <div>
                <Label>Логотип</Label>
                <div className="space-y-2">
                  {formData.logo && (
                    <div className="w-full h-32 bg-white rounded border flex items-center justify-center p-4">
                      <img src={formData.logo} alt="Logo" className="max-h-full object-contain" />
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </div>
              </div>
              <div>
                <Label>Описание</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Краткое описание бренда"
                />
              </div>
              <div>
                <Label>Веб-сайт</Label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Страна</Label>
                  <Input
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Бельгия"
                  />
                </div>
                <div>
                  <Label>Год основания</Label>
                  <Input
                    type="number"
                    value={formData.established_year}
                    onChange={(e) => setFormData({ ...formData, established_year: e.target.value })}
                    placeholder="1966"
                  />
                </div>
              </div>
              <Button onClick={handleSaveBrand} className="w-full">
                Сохранить
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {brands.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Нет брендов. Добавьте первый бренд.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand, index) => (
            <Card key={brand.id}>
              <CardHeader>
                {brand.logo ? (
                  <div className="w-full h-32 bg-white rounded flex items-center justify-center p-4">
                    <img src={brand.logo} alt={brand.name} className="max-h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-full h-32 bg-muted rounded flex items-center justify-center">
                    <span className="text-4xl font-bold text-muted-foreground">{brand.name[0]}</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <CardTitle className="mb-2">{brand.name}</CardTitle>
                {brand.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {brand.description}
                  </p>
                )}
                <div className="text-xs text-muted-foreground">
                  {brand.country && <div>Страна: {brand.country}</div>}
                  {brand.established_year && <div>Основан: {brand.established_year}</div>}
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => moveBrand(brand, 'up')}
                  disabled={index === 0}
                >
                  <MoveUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => moveBrand(brand, 'down')}
                  disabled={index === brands.length - 1}
                >
                  <MoveDown className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => openEditDialog(brand)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteBrand(brand.id)}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrandManagement;
