export async function imageBitmapToBlob(imageBitmap: ImageBitmap, mimeType = "image/jpeg") {
  const canvas = new OffscreenCanvas(
    imageBitmap.width,
    imageBitmap.height,
  );

  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.drawImage(imageBitmap, 0, 0);
  }else{
    throw new Error("Failed to get 2D context from OffscreenCanvas");
  }

  return canvas.convertToBlob({ type: mimeType });
}