-- Add media field to news table for multiple images/videos
ALTER TABLE public.news
ADD COLUMN media JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.news.media IS 'Array of media objects: [{type: "image"|"video", url: string, caption: string}]';