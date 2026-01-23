import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import BannerPositionPreview, { ElementPositions } from './BannerPositionPreview';
import BannerImagePositioner, { ImagePositionSettings } from './BannerImagePositioner';

interface Banner {
  id: string;
  image_url: string;
  title: string;
  subtitle: string | null;
  button_text: string | null;
  button_link: string | null;
  is_active: boolean;
  display_order: number;
  title_position_x: number | null;
  title_position_y: number | null;
  subtitle_position_x: number | null;
  subtitle_position_y: number | null;
  button_position_x: number | null;
  button_position_y: number | null;
  image_position_x: number | null;
  image_position_y: number | null;
  image_scale: number | null;
  created_at: string;
  updated_at: string;
}

interface BannerFormData {
  image_url: string;
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  is_active: boolean;
  positions: ElementPositions;
  imagePosition: ImagePositionSettings;
}

const DEFAULT_POSITIONS: ElementPositions = {
  title: { x: 25, y: 70 },
  subtitle: { x: 25, y: 78 },
  button: { x: 25, y: 88 },
};

const DEFAULT_IMAGE_POSITION: ImagePositionSettings = {
  x: 50,
  y: 50,
  scale: 100,
};

const BannerManagement = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<BannerFormData>({
    image_url: '',
    title: '',
    subtitle: '',
    button_text: '',
    button_link: '',
    is_active: true,
    positions: { ...DEFAULT_POSITIONS },
    imagePosition: { ...DEFAULT_IMAGE_POSITION },
  });

  const { toast } = useToast();

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_banners')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить баннеры',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, выберите изображение',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Ошибка',
        description: 'Размер файла не должен превышать 5 МБ',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `banners/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      setFormData((prev) => ({ ...prev, image_url: urlData.publicUrl }));
      setImagePreview(urlData.publicUrl);

      toast({
        title: 'Успешно',
        description: 'Изображение загружено',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить изображение',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      image_url: '',
      title: '',
      subtitle: '',
      button_text: '',
      button_link: '',
      is_active: true,
      positions: { ...DEFAULT_POSITIONS },
      imagePosition: { ...DEFAULT_IMAGE_POSITION },
    });
    setImagePreview(null);
    setEditingBanner(null);
  };

  const openEditDialog = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      image_url: banner.image_url,
      title: banner.title,
      subtitle: banner.subtitle || '',
      button_text: banner.button_text || '',
      button_link: banner.button_link || '',
      is_active: banner.is_active,
      positions: {
        title: { 
          x: banner.title_position_x ?? DEFAULT_POSITIONS.title.x, 
          y: banner.title_position_y ?? DEFAULT_POSITIONS.title.y 
        },
        subtitle: { 
          x: banner.subtitle_position_x ?? DEFAULT_POSITIONS.subtitle.x, 
          y: banner.subtitle_position_y ?? DEFAULT_POSITIONS.subtitle.y 
        },
        button: { 
          x: banner.button_position_x ?? DEFAULT_POSITIONS.button.x, 
          y: banner.button_position_y ?? DEFAULT_POSITIONS.button.y 
        },
      },
      imagePosition: {
        x: banner.image_position_x ?? DEFAULT_IMAGE_POSITION.x,
        y: banner.image_position_y ?? DEFAULT_IMAGE_POSITION.y,
        scale: banner.image_scale ?? DEFAULT_IMAGE_POSITION.scale,
      },
    });
    setImagePreview(banner.image_url);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.image_url) {
      toast({
        title: 'Ошибка',
        description: 'Загрузите изображение для баннера',
        variant: 'destructive',
      });
      return;
    }

    try {
      const bannerData = {
        image_url: formData.image_url,
        title: formData.title,
        subtitle: formData.subtitle || null,
        button_text: formData.button_text || null,
        button_link: formData.button_link || null,
        is_active: formData.is_active,
        title_position_x: formData.positions.title.x,
        title_position_y: formData.positions.title.y,
        subtitle_position_x: formData.positions.subtitle.x,
        subtitle_position_y: formData.positions.subtitle.y,
        button_position_x: formData.positions.button.x,
        button_position_y: formData.positions.button.y,
        image_position_x: formData.imagePosition.x,
        image_position_y: formData.imagePosition.y,
        image_scale: formData.imagePosition.scale,
      };

      if (editingBanner) {
        const { error } = await supabase
          .from('hero_banners')
          .update(bannerData)
          .eq('id', editingBanner.id);

        if (error) throw error;
        toast({
          title: 'Успешно',
          description: 'Баннер обновлён',
        });
      } else {
        const maxOrder = banners.length > 0 
          ? Math.max(...banners.map(b => b.display_order)) 
          : -1;

        const { error } = await supabase
          .from('hero_banners')
          .insert({
            ...bannerData,
            display_order: maxOrder + 1,
          });

        if (error) throw error;
        toast({
          title: 'Успешно',
          description: 'Баннер добавлен',
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить баннер',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!bannerToDelete) return;

    try {
      const { error } = await supabase
        .from('hero_banners')
        .delete()
        .eq('id', bannerToDelete);

      if (error) throw error;

      toast({
        title: 'Успешно',
        description: 'Баннер удалён',
      });

      fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить баннер',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setBannerToDelete(null);
    }
  };

  const toggleActive = async (banner: Banner) => {
    try {
      const { error } = await supabase
        .from('hero_banners')
        .update({ is_active: !banner.is_active })
        .eq('id', banner.id);

      if (error) throw error;

      toast({
        title: banner.is_active ? 'Баннер скрыт' : 'Баннер активирован',
      });

      fetchBanners();
    } catch (error) {
      console.error('Error toggling banner:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить статус баннера',
        variant: 'destructive',
      });
    }
  };

  const moveBanner = async (bannerId: string, direction: 'up' | 'down') => {
    const currentIndex = banners.findIndex((b) => b.id === bannerId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= banners.length) return;

    const currentBanner = banners[currentIndex];
    const swapBanner = banners[newIndex];

    try {
      await supabase
        .from('hero_banners')
        .update({ display_order: swapBanner.display_order })
        .eq('id', currentBanner.id);

      await supabase
        .from('hero_banners')
        .update({ display_order: currentBanner.display_order })
        .eq('id', swapBanner.id);

      fetchBanners();
    } catch (error) {
      console.error('Error reordering banners:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить порядок',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Загрузка баннеров...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Баннеры главной страницы</h2>
          <p className="text-muted-foreground">
            Управление слайдами карусели на главной странице
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Добавить баннер
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? 'Редактировать баннер' : 'Добавить баннер'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Image upload */}
              <div className="space-y-2">
                <Label>Изображение *</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  {uploading && <span className="text-sm text-muted-foreground">Загрузка...</span>}
                </div>
              </div>

              {/* Text inputs in a grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Заголовок</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Главный заголовок баннера"
                  />
                </div>

                {/* Subtitle */}
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Подзаголовок</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Дополнительный текст"
                  />
                </div>

                {/* Button text */}
                <div className="space-y-2">
                  <Label htmlFor="button_text">Текст кнопки</Label>
                  <Input
                    id="button_text"
                    value={formData.button_text}
                    onChange={(e) => setFormData((prev) => ({ ...prev, button_text: e.target.value }))}
                    placeholder="Например: Смотреть каталог"
                  />
                </div>

                {/* Button link */}
                <div className="space-y-2">
                  <Label htmlFor="button_link">Ссылка кнопки</Label>
                  <Input
                    id="button_link"
                    value={formData.button_link}
                    onChange={(e) => setFormData((prev) => ({ ...prev, button_link: e.target.value }))}
                    placeholder="Например: /#products"
                  />
                </div>
              </div>

              {/* Image position and scale control */}
              {imagePreview && (
                <BannerImagePositioner
                  imageUrl={imagePreview}
                  position={formData.imagePosition}
                  onPositionChange={(imagePosition) => setFormData((prev) => ({
                    ...prev,
                    imagePosition,
                  }))}
                />
              )}

              {/* Interactive text position preview */}
              {imagePreview && (
                <BannerPositionPreview
                  imageUrl={imagePreview}
                  title={formData.title}
                  subtitle={formData.subtitle}
                  buttonText={formData.button_text}
                  positions={formData.positions}
                  imagePosition={formData.imagePosition}
                  onPositionsChange={(positions) => setFormData((prev) => ({ 
                    ...prev, 
                    positions 
                  }))}
                />
              )}

              {/* Active toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Активный</Label>
                  <p className="text-sm text-muted-foreground">
                    Показывать баннер на сайте
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_active: checked }))
                  }
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}>
                  Отмена
                </Button>
                <Button onClick={handleSubmit} disabled={uploading}>
                  {editingBanner ? 'Сохранить' : 'Добавить'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {banners.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Баннеров пока нет</h3>
            <p className="text-muted-foreground text-center mb-4">
              Добавьте первый баннер для карусели на главной странице
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить баннер
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {banners.map((banner, index) => (
            <Card key={banner.id} className={!banner.is_active ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-48 h-28 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-lg truncate">{banner.title || '(без заголовка)'}</h3>
                        {banner.subtitle && (
                          <p className="text-sm text-muted-foreground truncate">
                            {banner.subtitle}
                          </p>
                        )}
                        {banner.button_text && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Кнопка: {banner.button_text} → {banner.button_link || 'нет ссылки'}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleActive(banner)}
                          title={banner.is_active ? 'Скрыть' : 'Показать'}
                        >
                          {banner.is_active ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveBanner(banner.id, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveBanner(banner.id, 'down')}
                          disabled={index === banners.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(banner)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setBannerToDelete(banner.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить баннер?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Баннер будет удалён навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BannerManagement;