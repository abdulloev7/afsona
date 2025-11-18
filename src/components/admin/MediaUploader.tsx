import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Upload, Image as ImageIcon, Video } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export interface MediaItem {
  type: 'image' | 'video';
  url: string;
  caption?: string;
  fit?: 'cover' | 'contain';
  file?: File;
}

interface MediaUploaderProps {
  media: MediaItem[];
  onChange: (media: MediaItem[]) => void;
}

export const MediaUploader = ({ media, onChange }: MediaUploaderProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach((file) => {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast({
          title: 'Ошибка',
          description: 'Пожалуйста, выберите изображение или видео',
          variant: 'destructive',
        });
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: 'Ошибка',
          description: 'Размер файла не должен превышать 50 МБ',
          variant: 'destructive',
        });
        return;
      }

      const type = file.type.startsWith('image/') ? 'image' : 'video';
      const url = URL.createObjectURL(file);
      
      onChange([...media, { type, url, file, caption: '', fit: 'cover' }]);
    });

    e.target.value = '';
  };

  const removeMedia = (index: number) => {
    const newMedia = [...media];
    if (newMedia[index].url.startsWith('blob:')) {
      URL.revokeObjectURL(newMedia[index].url);
    }
    newMedia.splice(index, 1);
    onChange(newMedia);
  };

  const updateCaption = (index: number, caption: string) => {
    const newMedia = [...media];
    newMedia[index].caption = caption;
    onChange(newMedia);
  };

  const updateFit = (index: number, fit: 'cover' | 'contain') => {
    const newMedia = [...media];
    newMedia[index].fit = fit;
    onChange(newMedia);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="media-upload">Загрузить медиафайлы</Label>
        <div className="mt-2">
          <label htmlFor="media-upload" className="cursor-pointer">
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Нажмите для загрузки изображений или видео
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Максимальный размер: 50 МБ
              </p>
            </div>
          </label>
          <Input
            id="media-upload"
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {media.length > 0 && (
        <div className="space-y-4">
          <Label>Загруженные медиафайлы ({media.length})</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {media.map((item, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="relative">
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.caption || `Media ${index + 1}`}
                      className={`w-full h-40 rounded ${item.fit === 'contain' ? 'object-contain bg-muted' : 'object-cover'}`}
                    />
                  ) : (
                    <div className="w-full h-40 bg-muted rounded flex items-center justify-center relative">
                      <Video className="h-12 w-12 text-muted-foreground" />
                      <video
                        src={item.url}
                        className={`absolute inset-0 w-full h-40 rounded ${item.fit === 'contain' ? 'object-contain' : 'object-cover'}`}
                        controls
                      />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => removeMedia(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="absolute top-2 left-2">
                    {item.type === 'image' ? (
                      <ImageIcon className="h-5 w-5 text-white drop-shadow-lg" />
                    ) : (
                      <Video className="h-5 w-5 text-white drop-shadow-lg" />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder="Подпись (необязательно)"
                    value={item.caption || ''}
                    onChange={(e) => updateCaption(index, e.target.value)}
                  />
                  <select
                    value={item.fit || 'cover'}
                    onChange={(e) => updateFit(index, e.target.value as 'cover' | 'contain')}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm"
                  >
                    <option value="cover">Cover (заполнить)</option>
                    <option value="contain">Contain (вместить)</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
