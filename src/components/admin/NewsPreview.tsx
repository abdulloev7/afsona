import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Image as ImageIcon, Video } from 'lucide-react';
import { formatNewsDate } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/sanitize';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  caption?: string;
  fit?: 'cover' | 'contain';
}

interface NewsPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
  excerpt?: string;
  image?: string;
  imageFit?: 'cover' | 'contain';
  media?: MediaItem[];
  published: boolean;
}

const NewsPreview = ({
  open,
  onOpenChange,
  title,
  content,
  excerpt,
  image,
  imageFit = 'cover',
  media = [],
  published,
}: NewsPreviewProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Предпросмотр новости
            <Badge variant={published ? 'default' : 'secondary'}>
              {published ? 'Опубликовано' : 'Черновик'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <article className="space-y-6">
          {/* Title */}
          <h1 className="text-3xl font-bold">{title || 'Без заголовка'}</h1>

          {/* Date */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatNewsDate(new Date().toISOString())}</span>
          </div>

          {/* Main Image */}
          {image && (
            <img
              src={image}
              alt={title}
              className={`w-full rounded-lg max-h-[400px] ${imageFit === 'contain' ? 'object-contain bg-muted' : 'object-cover'}`}
            />
          )}

          {/* Excerpt */}
          {excerpt && (
            <div className="bg-muted p-4 rounded-lg border-l-4 border-primary">
              <p className="text-muted-foreground italic">{excerpt}</p>
            </div>
          )}

          {/* Rich Text Content */}
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(content || '<p>Нет содержания</p>') }}
          />

          {/* Media Gallery */}
          {media.length > 0 && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Медиагалерея ({media.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {media.map((item, index) => (
                  <div key={index} className="space-y-2">
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt={item.caption || `Media ${index + 1}`}
                        className={`w-full h-60 rounded-lg ${item.fit === 'contain' ? 'object-contain bg-muted' : 'object-cover'}`}
                      />
                    ) : (
                      <div className="relative">
                        <video
                          src={item.url}
                          controls
                          className={`w-full h-60 rounded-lg ${item.fit === 'contain' ? 'object-contain bg-muted' : 'object-cover'}`}
                        />
                        <div className="absolute top-2 left-2 bg-black/60 rounded px-2 py-1">
                          <Video className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                    {item.caption && (
                      <p className="text-sm text-muted-foreground text-center">
                        {item.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </DialogContent>
    </Dialog>
  );
};

export default NewsPreview;
