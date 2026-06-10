import { pool } from '../db/index.js';
import { uploadImage, deleteImageByUrl } from '../utils/cloudinary.js';
import { DbAd, getAdById, getAdImagesByAdId, deleteAdRecord } from '../db/ads.js';

interface CreateAdInput {
  title: string;
  description: string;
  category: string;
  price: number;
  location: string;
  contact_info: string;
}

/**
 * Handles transactional ad creation: uploads images to Cloudinary,
 * inserts the ad record, and saves image references.
 */
export const createAd = async (
  ownerId: number,
  adInput: CreateAdInput,
  files: Express.Multer.File[]
): Promise<DbAd> => {
  const { title, description, category, price, location, contact_info } = adInput;
  
  // 1. Upload images to Cloudinary concurrently
  console.log(`🖼️ Uploading ${files.length} images for new ad "${title}" to Cloudinary...`);
  const uploadPromises = files.map((file) => uploadImage(file.buffer, 'ads'));
  const uploadedUrls = await Promise.all(uploadPromises);
  console.log('✅ Uploaded image URLs:', uploadedUrls);

  // 2. Perform DB operations in a transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert ad
    const adSql = `
      INSERT INTO ads (owner_id, title, description, category, price, location, contact_info)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const adRes = await client.query(adSql, [
      ownerId,
      title,
      description,
      category,
      price,
      location,
      contact_info
    ]);
    const createdAd = adRes.rows[0];

    // Insert image records
    const imageSql = `
      INSERT INTO ad_images (ad_id, cloudinary_url, display_order)
      VALUES ($1, $2, $3)
    `;
    for (let i = 0; i < uploadedUrls.length; i++) {
      await client.query(imageSql, [createdAd.id, uploadedUrls[i], i]);
    }

    await client.query('COMMIT');
    
    // Retrieve complete ad with images aggregated
    const completeAdSql = `
      SELECT a.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', img.id,
                   'ad_id', img.ad_id,
                   'cloudinary_url', img.cloudinary_url,
                   'display_order', img.display_order
                 ) ORDER BY img.display_order
               ) FILTER (WHERE img.id IS NOT NULL),
               '[]'::json
             ) as images
      FROM ads a
      LEFT JOIN ad_images img ON a.id = img.ad_id
      WHERE a.id = $1
      GROUP BY a.id
    `;
    const completeAdRes = await client.query(completeAdSql, [createdAd.id]);
    
    const finalAd = completeAdRes.rows[0];
    return {
      ...finalAd,
      price: parseFloat(finalAd.price)
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Ad creation transaction failed, rolling back DB records:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Handles ad deletion: fetches all associated images, deletes them from Cloudinary,
 * and deletes the ad record from the database (database handles cascading delete for ad_images).
 */
export const deleteAd = async (adId: number): Promise<void> => {
  const ad = await getAdById(adId);
  if (!ad) {
    throw new Error('Advertisement not found');
  }

  // 1. Delete all associated images from Cloudinary
  if (ad.images && ad.images.length > 0) {
    console.log(`🖼️ Cleaning up ${ad.images.length} images from Cloudinary for ad ${adId}...`);
    const deletePromises = ad.images.map((img) => deleteImageByUrl(img.cloudinary_url));
    await Promise.all(deletePromises);
  }

  // 2. Delete database record
  await deleteAdRecord(adId);
  console.log(`✅ Ad ${adId} and its database references deleted.`);
};

/**
 * Handles ad updating: manages Cloudinary image cleanup for deleted images,
 * uploads new images, and updates ad text details in a transaction.
 */
export const updateAd = async (
  adId: number,
  adInput: CreateAdInput,
  keepImageUrls: string[],
  newFiles: Express.Multer.File[]
): Promise<DbAd> => {
  const { title, description, category, price, location, contact_info } = adInput;

  // 1. Fetch current images associated with this ad
  const currentImages = await getAdImagesByAdId(adId);
  const currentUrls = currentImages.map(img => img.cloudinary_url);

  // 2. Identify images to delete (present in DB but not in keep list)
  const urlsToDelete = currentUrls.filter(url => !keepImageUrls.includes(url));

  if (urlsToDelete.length > 0) {
    console.log(`🖼️ Deleting ${urlsToDelete.length} removed images from Cloudinary...`);
    const deletePromises = urlsToDelete.map(url => deleteImageByUrl(url));
    await Promise.all(deletePromises);
  }

  // 3. Upload new images to Cloudinary concurrently
  let uploadedUrls: string[] = [];
  if (newFiles.length > 0) {
    console.log(`🖼️ Uploading ${newFiles.length} new images to Cloudinary...`);
    const uploadPromises = newFiles.map(file => uploadImage(file.buffer, 'ads'));
    uploadedUrls = await Promise.all(uploadPromises);
  }

  // 4. Combine kept image URLs with newly uploaded ones (preserves order: kept first, then new)
  const finalImageUrls = [...keepImageUrls, ...uploadedUrls];

  // Enforce the maximum of 5 images invariant
  if (finalImageUrls.length > 5) {
    throw new Error('Maximum of 5 images allowed per advertisement.');
  }

  // 5. Run DB updates in a transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Update ad text fields
    const updateAdSql = `
      UPDATE ads
      SET title = $2, description = $3, category = $4, price = $5, location = $6, contact_info = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    await client.query(updateAdSql, [
      adId,
      title,
      description,
      category,
      price,
      location,
      contact_info
    ]);

    // Clear old image associations in DB
    await client.query('DELETE FROM ad_images WHERE ad_id = $1', [adId]);

    // Re-insert image records with new display orders
    const insertImageSql = `
      INSERT INTO ad_images (ad_id, cloudinary_url, display_order)
      VALUES ($1, $2, $3)
    `;
    for (let i = 0; i < finalImageUrls.length; i++) {
      await client.query(insertImageSql, [adId, finalImageUrls[i], i]);
    }

    await client.query('COMMIT');

    // Retrieve and return complete updated ad details
    const completeAd = await getAdById(adId);
    if (!completeAd) {
      throw new Error('Ad update completed, but failed to fetch details.');
    }
    return completeAd;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Ad update transaction failed, rolled back changes:', error);
    throw error;
  } finally {
    client.release();
  }
};
