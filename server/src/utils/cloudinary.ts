import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/index.js';

// Configure Cloudinary client
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Uploads a local file or file buffer to Cloudinary.
 * @param fileBuffer Buffer containing the image file data
 * @param folder Cloudinary folder to upload the asset into
 * @returns The secure CDN URL of the uploaded image
 */
export const uploadImage = async (fileBuffer: Buffer, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `adhub/${folder}`,
        resource_type: 'image'
      },
      (error, result) => {
        if (error || !result) {
          console.error('Cloudinary upload error:', error);
          return reject(error || new Error('Upload failed'));
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Extract public ID from a Cloudinary URL.
 * URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567/folder/public_id.jpg
 */
export const getPublicIdFromUrl = (url: string): string | null => {
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    
    // Remove the version tag (e.g. v1234567/) if present
    let publicIdWithExtension = parts[1];
    const versionMatch = publicIdWithExtension.match(/^v\d+\/(.+)$/);
    if (versionMatch) {
      publicIdWithExtension = versionMatch[1];
    }
    
    // Remove file extension at the end
    const lastDotIndex = publicIdWithExtension.lastIndexOf('.');
    if (lastDotIndex === -1) return publicIdWithExtension;
    
    return publicIdWithExtension.substring(0, lastDotIndex);
  } catch (err) {
    console.error('Error extracting public ID from url:', url, err);
    return null;
  }
};

/**
 * Deletes an asset from Cloudinary using its secure URL.
 * @param url Cloudinary URL of the image to delete
 */
export const deleteImageByUrl = async (url: string): Promise<void> => {
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) {
    console.warn(`Could not extract public ID for URL: ${url}, skipping Cloudinary deletion.`);
    return;
  }
  
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== 'ok' && result.result !== 'not found') {
      console.warn(`Cloudinary destroy returned non-ok result for ${publicId}:`, result);
    } else {
      console.log(`Cloudinary asset deleted successfully: ${publicId}`);
    }
  } catch (error) {
    console.error(`Failed to delete Cloudinary asset for ${publicId}:`, error);
    // Non-blocking error, just log it
  }
};
