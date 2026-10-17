// Shared geometry for the home page hero carousel and its admin preview.
// The hero always keeps these proportions, so a banner looks the same on every screen
// and the admin preview shows exactly what visitors will see.

export const DESKTOP_ASPECT = 12 / 5; // 1920 × 800
export const MOBILE_ASPECT = 4 / 5; // 1080 × 1350

export const DESKTOP_SIZE = { width: 1920, height: 800 };
export const MOBILE_SIZE = { width: 1080, height: 1350 };

export const DEFAULT_POSITIONS = {
  title: { x: 25, y: 70 },
  subtitle: { x: 25, y: 78 },
  button: { x: 25, y: 88 },
};

export interface HeroBanner {
  id: string;
  image_url: string;
  mobile_image_url: string | null;
  title: string;
  subtitle: string | null;
  button_text: string | null;
  button_link: string | null;
  display_order: number;
  title_position_x: number | null;
  title_position_y: number | null;
  subtitle_position_x: number | null;
  subtitle_position_y: number | null;
  button_position_x: number | null;
  button_position_y: number | null;
  image_scale: number | null;
  image_position_x: number | null;
  image_position_y: number | null;
  mobile_image_position_x: number | null;
  mobile_image_position_y: number | null;
}

// Phones get the portrait layout only when every banner has a phone image; otherwise
// slides would need different heights, so all of them stay in the wide layout.
export const allHaveMobileImages = (banners: Pick<HeroBanner, 'mobile_image_url'>[]) =>
  banners.length > 0 && banners.every((b) => !!b.mobile_image_url);

export const getTextAlign = (x: number): string => {
  if (x < 35) return 'text-left';
  if (x > 65) return 'text-right';
  return 'text-center';
};

// Reads an image's natural size, used to warn about images that will be cropped a lot.
export const loadImageSize = (url: string) =>
  new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = url;
  });
