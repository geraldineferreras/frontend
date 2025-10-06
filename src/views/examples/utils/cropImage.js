// Utility to crop an image using canvas (for react-easy-crop)
export default function getCroppedImg(imageSrc, pixelCrop) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => {
      const imgW = image.naturalWidth;
      const imgH = image.naturalHeight;

      // Clamp cropX and cropY to 0
      let cropX = Math.max(0, Math.round(pixelCrop.x));
      let cropY = Math.max(0, Math.round(pixelCrop.y));
      // Clamp cropWidth and cropHeight so they don't exceed image bounds
      let cropWidth = Math.round(pixelCrop.width);
      let cropHeight = Math.round(pixelCrop.height);

      if (cropX + cropWidth > imgW) cropWidth = imgW - cropX;
      if (cropY + cropHeight > imgH) cropHeight = imgH - cropY;

      // If crop area is still invalid, fallback to the largest possible area
      if (cropWidth <= 0 || cropHeight <= 0) {
        cropX = 0;
        cropY = 0;
        cropWidth = imgW;
        cropHeight = imgH;
      }

      if (
        isNaN(cropX) || isNaN(cropY) ||
        isNaN(cropWidth) || isNaN(cropHeight) ||
        cropWidth <= 0 || cropHeight <= 0
      ) {
        alert('Invalid crop area: ' + JSON.stringify({ pixelCrop, imgW, imgH, cropX, cropY, cropWidth, cropHeight }));
        reject(new Error('Invalid crop area'));
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );
      try {
        const dataUrl = canvas.toDataURL('image/png');
        if (!dataUrl) {
          alert('Canvas toDataURL failed');
          reject(new Error('Canvas toDataURL failed'));
          return;
        }
        resolve(dataUrl);
      } catch (err) {
        alert('Canvas toDataURL threw: ' + err.message);
        reject(err);
      }
    };
    image.onerror = (e) => {
      alert('Image failed to load');
      reject(new Error('Failed to load image'));
    };
    image.src = imageSrc;
  });
} 