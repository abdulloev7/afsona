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
import { Plus, Pencil, Trash2, Image as ImageIcon, Eye } from "lucide-react";
import { transliterate } from "@/lib/utils";
import { z } from "zod";
import RichTextEditor from "./RichTextEditor";
import MediaUploader from "./MediaUploader";
import NewsPreview from "./NewsPreview";

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  caption?: string;
  file?: File;
}

interface News {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  image: string | null;
  media: any;
  author_id: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
}

const newsSchema = z.object({
  title: z.string().min(5, "Заголовок должен содержать минимум 5 символов").max(200, "Заголовок не должен превышать 200 символов"),
  slug: z.string().min(1, "Slug обязателен").regex(/^[a-z0-9-]+$/, "Slug должен содержать только латинские буквы, цифры и дефисы"),
  content: z.string().min(50, "Контент должен содержать минимум 50 символов"),
  excerpt: z.string().max(300, "Краткое описание не должно превышать 300 символов").optional(),
  published: z.boolean(),
});

const NewsManagement = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [newsToDelete, setNewsToDelete] = useState<News | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    published: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить новости",
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
      slug: editingNews ? formData.slug : transliterate(value),
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
      const validated = newsSchema.parse({
        ...formData,
        excerpt: formData.excerpt || undefined,
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Пользователь не авторизован");

      let imageUrl = editingNews?.image || null;
      if (imageFile) {
        imageUrl = await uploadFile(imageFile, "news");
      }

      const uploadedMedia: MediaItem[] = [];
      for (const item of mediaItems) {
        if (item.file) {
          const url = await uploadFile(item.file, item.type === 'image' ? 'news-images' : 'news-videos');
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

      const newsData = {
        title: validated.title,
        slug: validated.slug,
        content: validated.content,
        excerpt: validated.excerpt || null,
        image: imageUrl,
        media: uploadedMedia as any,
        author_id: user.id,
        published: validated.published,
        published_at: validated.published ? new Date().toISOString() : null,
      };

      if (editingNews) {
        const { error } = await supabase
          .from("news")
          .update(newsData)
          .eq("id", editingNews.id);

        if (error) throw error;
        toast({ title: "Успешно", description: "Новость обновлена" });
      } else {
        const { error } = await supabase.from("news").insert(newsData);

        if (error) throw error;
        toast({ title: "Успешно", description: "Новость создана" });
      }

      setDialogOpen(false);
      resetForm();
      fetchNews();
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

  const handleEdit = (newsItem: News) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      slug: newsItem.slug,
      content: newsItem.content,
      excerpt: newsItem.excerpt || "",
      published: newsItem.published,
    });
    setImagePreview(newsItem.image || "");
    setMediaItems((newsItem.media as unknown as MediaItem[]) || []);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!newsToDelete) return;

    try {
      if (newsToDelete.image) {
        const imagePath = newsToDelete.image.split("/").slice(-2).join("/");
        await supabase.storage.from("product-images").remove([imagePath]);
      }

      if (newsToDelete.media) {
        const mediaArray = newsToDelete.media as unknown as MediaItem[];
        if (mediaArray && mediaArray.length > 0) {
          const mediaPaths = mediaArray.map(item => {
            const parts = item.url.split("/");
            return parts.slice(-2).join("/");
          });
          await supabase.storage.from("product-images").remove(mediaPaths);
        }
      }

      const { error } = await supabase
        .from("news")
        .delete()
        .eq("id", newsToDelete.id);

      if (error) throw error;

      toast({ title: "Успешно", description: "Новость удалена" });
      setDeleteDialogOpen(false);
      setNewsToDelete(null);
      fetchNews();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить новость",
        variant: "destructive",
      });
    }
  };

  const togglePublished = async (newsItem: News) => {
    try {
      const newPublishedState = !newsItem.published;
      const { error } = await supabase
        .from("news")
        .update({
          published: newPublishedState,
          published_at: newPublishedState ? new Date().toISOString() : null,
        })
        .eq("id", newsItem.id);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: newPublishedState ? "Новость опубликована" : "Новость снята с публикации",
      });
      fetchNews();
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
      content: "",
      excerpt: "",
      published: false,
    });
    setImageFile(null);
    setImagePreview("");
    setMediaItems([]);
    setEditingNews(null);
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
        <h2 className="text-2xl font-bold">Управление новостями</h2>
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Добавить новость
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingNews ? "Редактировать новость" : "Новая новость"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Заголовок *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Заголовок новости"
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

              <div className="space-y-2">
                <Label htmlFor="excerpt">Краткое описание</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Краткое описание для списка новостей"
                  maxLength={300}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Полный текст * (Rich Text)</Label>
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
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full h-48 object-cover rounded-md"
                    />
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setPreviewOpen(true)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Предпросмотр
              </Button>
              <Button variant="outline" onClick={() => handleDialogClose(false)}>
                Отмена
              </Button>
              <Button onClick={handleSubmit}>
                {editingNews ? "Сохранить" : "Создать"}
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
              <TableHead>Заголовок</TableHead>
              <TableHead>Дата публикации</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {news.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Новостей пока нет
                </TableCell>
              </TableRow>
            ) : (
              news.map((newsItem) => (
                <TableRow key={newsItem.id}>
                  <TableCell>
                    {newsItem.image ? (
                      <img
                        src={newsItem.image}
                        alt={newsItem.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{newsItem.title}</TableCell>
                  <TableCell>
                    {newsItem.published_at
                      ? new Date(newsItem.published_at).toLocaleDateString("ru-RU")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={newsItem.published ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => togglePublished(newsItem)}
                    >
                      {newsItem.published ? "Опубликовано" : "Черновик"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(newsItem)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setNewsToDelete(newsItem);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
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
            <AlertDialogTitle>Удалить новость?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Новость "{newsToDelete?.title}" будет удалена навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <NewsPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title={formData.title}
        content={formData.content}
        excerpt={formData.excerpt}
        image={imagePreview}
        media={mediaItems}
        published={formData.published}
      />
    </div>
  );
};

export default NewsManagement;
