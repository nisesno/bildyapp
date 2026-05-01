import sharp from 'sharp';

// Optimiza la firma antes de subirla: max 800px de ancho y la pasamos a webp
// para que ocupe menos. Lo hacemos siempre que el usuario sube una firma.
export const optimizeSignature = async (buffer) => {
  return sharp(buffer)
    .resize(800, null, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();
};
