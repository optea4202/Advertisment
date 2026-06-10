/**
 * Compresses an image file on the client side using Canvas.
 * Resizes the image to fit within maxDimension (width or height)
 * and outputs a compressed JPEG file.
 */
export const compressImage = (file: File, maxDimension = 1200, quality = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    // Fallback if browser environment lacks support
    if (!window.FileReader || !window.HTMLCanvasElement) {
      return resolve(file);
    }

    // Skip compression for animated GIFs or non-images to avoid breaking them
    if (file.type === 'image/gif') {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Only resize if the image exceeds the max dimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file);
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas content to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }
            // Create a new File object from the blob
            const fileName = file.name.substring(0, file.name.lastIndexOf('.')) + '.jpg';
            const compressedFile = new File([blob], fileName, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        resolve(file); // fallback to original file if loading fails
      };
    };

    reader.onerror = () => {
      resolve(file); // fallback to original file if reading fails
    };
  });
};
