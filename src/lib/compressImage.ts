// Shrinks photos in the browser before they go to Supabase Storage.
// The free plan has no image resizing, so whatever is uploaded is what shoppers download.

const RESIZABLE = ["image/jpeg", "image/png", "image/webp"];
const SMALL_ENOUGH = 200 * 1024;

const loadImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Не удалось прочитать изображение"));
    };
    img.src = url;
  });

/**
 * Returns a WebP no wider than `maxWidth`, or the original file when it is not a
 * photo (video, GIF, SVG), is already small, or re-encoding would not make it lighter.
 */
export async function compressImage(file: File, maxWidth = 2000, quality = 0.82): Promise<File> {
  if (!RESIZABLE.includes(file.type)) return file;

  try {
    const img = await loadImage(file);
    if (file.size <= SMALL_ENOUGH && img.naturalWidth <= maxWidth) return file;

    const scale = Math.min(1, maxWidth / img.naturalWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    // Safari before 14 falls back to PNG; keep the original then.
    if (!blob || blob.type !== "image/webp" || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], name, { type: "image/webp" });
  } catch {
    return file;
  }
}
