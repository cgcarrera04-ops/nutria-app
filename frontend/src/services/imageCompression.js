/**
 * imageCompression.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Utilidad del lado del cliente para comprimir imágenes de forma eficiente
 * utilizando el elemento <canvas> de HTML5. Reduce las dimensiones proporcionales
 * y comprime la calidad JPEG para ahorrar ancho de banda y evitar sobrecargar la red.
 *
 * @param {File} file - Archivo de imagen original (File)
 * @param {number} maxDimension - Tamaño máximo en píxeles para el lado más largo (default: 1024)
 * @param {number} quality - Calidad de compresión de 0.0 a 1.0 (default: 0.75)
 * @returns {Promise<File>} - Promesa que resuelve a un nuevo objeto File comprimido
 */
export const compressImage = (file, maxDimension = 1024, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    // Si no es una imagen, resolver de inmediato con el archivo original
    if (!file.type.startsWith("image/")) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Redimensionar proporcionalmente respetando la relación de aspecto
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("No se pudo obtener el contexto 2D del Canvas"));
        }

        // Dibujar la imagen original escalada en el canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Exportar a un Blob JPEG comprimido
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error("Error al procesar la compresión en Canvas"));
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};
