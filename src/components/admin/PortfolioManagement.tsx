import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Image as ImageIcon, MapPin, Calendar } from "lucide-react";
import { transliterate } from "@/lib/utils";
import { z } from "zod";
import RichTextEditor from "./RichTextEditor";
import MediaUploader from "./MediaUploader";

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  caption?: string;
  file?: File;
}

interface Portfolio {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  location: string | null;
  completion_date: string | null;
  image: string | null;
  image_fit: string | null;
  media: any;
  products_used: string[] | null;
  author_id: string;
  published: boolean;
  created_at: string;
}

const portfolioSchema = z.object({
  title: z.string().min(3, "Название должно содержать минимум 3 символа").max(200, "Название не должно превышать 200 символов"),
  slug: z.string().min(1, "Slug обязателен").regex(/^[a-z0-9-]+$/, "Slug должен содержать только латинские буквы, цифры и дефисы"),
  content: z.string().min(20, "Описание должно содержать минимум 20 символов"),
  description: z.string().max(500, "Краткое описание не должно превышать 500 символов").optional(),
  published: z.boolean(),
});

const PortfolioManagement = () => {
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Portfolio | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Portfolio | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    location: "",
    completion_date: "",
    published: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFit, setImageFit] = useState<'cover' | 'contain'>('cover');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const { data, error } = await supabase
        .from("portfolio")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPortfolio(data || []);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить портфолио",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (value: string) => {
    setFormData({
      ...formData,
      title: value,
      slug: editingItem ? formData.slug : transliterate(value),
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Ошибка",
          description: "Пожалуйста, выберите изображение",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Ошибка",
          description: "Размер файла не должен превышать 5 МБ",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async () => {
    try {
      const validated = portfolioSchema.parse({
        ...formData,
        description: formData.description || undefined,
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Пользователь не авторизован");

      let imageUrl = editingItem?.image || null;
      if (imageFile) {
        imageUrl = await uploadFile(imageFile, "portfolio");
      }

      const uploadedMedia: MediaItem[] = [];
      for (const item of mediaItems) {
        if (item.file) {
          const url = await uploadFile(item.file, item.type === 'image' ? 'portfolio-images' : 'portfolio-videos');
          uploadedMedia.push({
            type: item.type,
            url,
            caption: item.caption,
          });
        } else {
          uploadedMedia.push({
            type: item.type,
            url: item.url,
            caption: item.caption,
          });
        }
      }

      const portfolioData = {
        title: validated.title,
        slug: validated.slug,
        description: validated.description || null,
        content: validated.content,
        location: formData.location || null,
        completion_date: formData.completion_date || null,
        image: imageUrl,
        image_fit: imageFit,
        media: uploadedMedia as any,
        author_id: user.id,
        published: validated.published,
      };

      if (editingItem) {
        const { error } = await supabase
          .from("portfolio")
          .update(portfolioData)
          .eq("id", editingItem.id);

        if (error) throw error;
        toast({ title: "Успешно", description: "Проект обновлен" });
      } else {
        const { error } = await supabase.from("portfolio").insert(portfolioData);

        if (error) throw error;
        toast({ title: "Успешно", description: "Проект создан" });
      }

      setDialogOpen(false);
      resetForm();
      fetchPortfolio();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Ошибка валидации",
          description: error.issues[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Ошибка",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleEdit = (item: Portfolio) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      slug: item.slug,
      description: item.description || "",
      content: item.content,
      location: item.location || "",
      completion_date: item.completion_date || "",
      published: item.published,
    });
    setImagePreview(item.image || "");
    setImageFit((item.image_fit as 'cover' | 'contain') || 'cover');
    setMediaItems((item.media as unknown as MediaItem[]) || []);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.image) {
        const imagePath = itemToDelete.image.split("/").slice(-2).join("/");
        await supabase.storage.from("product-images").remove([imagePath]);
      }

      if (itemToDelete.media) {
        const mediaArray = itemToDelete.media as unknown as MediaItem[];
        if (mediaArray && mediaArray.length > 0) {
          const mediaPaths = mediaArray.map(item => {
            const parts = item.url.split("/");
            return parts.slice(-2).join("/");
          });
          await supabase.storage.from("product-images").remove(mediaPaths);
        }
      }

      const { error } = await supabase
        .from("portfolio")
        .delete()
        .eq("id", itemToDelete.id);

      if (error) throw error;

      toast({ title: "Успешно", description: "Проект удален" });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchPortfolio();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить проект",
        variant: "destructive",
      });
    }
  };

  const togglePublished = async (item: Portfolio) => {
    try {
      const newPublishedState = !item.published;
      const { error } = await supabase
        .from("portfolio")
        .update({ published: newPublishedState })
        .eq("id", item.id);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: newPublishedState ? "Проект опубликован" : "Проект снят с публикации",
      });
      fetchPortfolio();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус публикации",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      description: "",
      content: "",
      location: "",
      completion_date: "",
      published: false,
    });
    setImageFile(null);
    setImagePreview("");
    setImageFit('cover');
    setMediaItems([]);
    setEditingItem(null);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Управление портфолио</h2>
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Добавить проект
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Редактировать проект" : "Новый проект"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название проекта *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Название проекта"
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="url-friendly-slug"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Местоположение</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="г. Худжанд"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="completion_date">Дата завершения</Label>
                  <Input
                    id="completion_date"
                    type="date"
                    value={formData.completion_date}
                    onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Краткое описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Краткое описание для карточки"
                  maxLength={500}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Полное описание * (Rich Text)</Label>
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Главное изображение</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="mt-2 space-y-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className={`max-w-full h-48 rounded-md ${imageFit === 'contain' ? 'object-contain bg-muted' : 'object-cover'}`}
                    />
                    <select
                      value={imageFit}
                      onChange={(e) => setImageFit(e.target.value as 'cover' | 'contain')}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm"
                    >
                      <option value="cover">Cover (заполнить)</option>
                      <option value="contain">Contain (вместить)</option>
                    </select>
                  </div>
                )}
              </div>

              <MediaUploader media={mediaItems} onChange={setMediaItems} />

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, published: checked as boolean })
                  }
                />
                <Label htmlFor="published" className="cursor-pointer">
                  Опубликовать сразу
                </Label>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => handleDialogClose(false)}>
                Отмена
              </Button>
              <Button onClick={handleSubmit}>
                {editingItem ? "Сохранить" : "Создать"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Фото</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Локация</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {portfolio.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Проектов пока нет
                </TableCell>
              </TableRow>
            ) : (
              portfolio.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {item.title}
                  </TableCell>
                  <TableCell>
                    {item.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {item.location}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.completion_date && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.completion_date).toLocaleDateString('ru-RU')}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={item.published ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => togglePublished(item)}
                    >
                      {item.published ? "Опубликован" : "Черновик"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setItemToDelete(item);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить проект?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Проект "{itemToDelete?.title}" будет
              удален вместе со всеми медиафайлами.
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

export default PortfolioManagement;
