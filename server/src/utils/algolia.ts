import { algoliasearch } from 'algoliasearch';
import { config } from '../config/index.js';
import { query } from '../db/index.js';
import { type DbAd } from '../db/ads.js';

// Initialize the Algolia client using Admin privileges for write operations
let algoliaClient: ReturnType<typeof algoliasearch> | null = null;
try {
  const appId = config.ALGOLIA_APP_ID || '';
  const adminKey = config.ALGOLIA_ADMIN_API_KEY || '';
  if (appId && adminKey && !appId.includes('placeholder') && !adminKey.includes('placeholder')) {
    algoliaClient = algoliasearch(appId, adminKey);
  }
} catch (err) {
  console.warn('Algolia client initialization failed or skipped:', err);
}

export const client = algoliaClient;

export const adsIndexName = config.ALGOLIA_ADS_INDEX_NAME;
export const usersIndexName = config.ALGOLIA_USERS_INDEX_NAME;

/**
 * Resolves the hierarchical category tree lineage for an ad's category name.
 * E.g., if category is "PC Graphics Card", resolves to ["PC", "PC Components", "PC Graphics Card"].
 * This ensures searching parent categories matches sub-category ads in Algolia.
 */
export const getCategoryLineage = async (categoryName: string): Promise<string[]> => {
  const sql = `
    WITH RECURSIVE lineage AS (
      SELECT name, parent_id FROM categories WHERE name = $1
      UNION ALL
      SELECT c.name, c.parent_id FROM categories c
      INNER JOIN lineage l ON c.id = l.parent_id
    )
    SELECT name FROM lineage;
  `;
  try {
    const res = await query(sql, [categoryName]);
    return res.rows.map((r) => r.name);
  } catch (error) {
    console.error('Error resolving category lineage:', error);
    return [categoryName];
  }
};

/**
 * Indexes/Updates a single advertisement in Algolia
 */
export const syncAdToAlgolia = async (ad: DbAd) => {
  try {
    if (!client) {
      console.warn('Algolia client is not initialized, skipping ad sync.');
      return;
    }
    const categoriesLineage = await getCategoryLineage(ad.category);
    const firstImageUrl = ad.images && ad.images.length > 0 
      ? ad.images[0].cloudinary_url 
      : '';

    const record = {
      objectID: ad.id.toString(), // Algolia requires objectID (string)
      id: ad.id,
      title: ad.title,
      description: ad.description,
      category: ad.category,
      categories: categoriesLineage, // For nested hierarchy searching
      price: ad.price,
      location: ad.location,
      owner_id: ad.owner_id,
      owner_name: (ad as any).owner_name || '',
      owner_photo: (ad as any).owner_photo || '',
      image_url: firstImageUrl,
      created_at: new Date(ad.created_at).getTime() / 1000, // Unix timestamp for filtering/sorting
    };

    await client.saveObject({
      indexName: adsIndexName,
      body: record,
    });
    console.log(`📡 Indexed Ad #${ad.id} ("${ad.title}") to Algolia.`);
  } catch (error) {
    console.error(`❌ Algolia sync failed for Ad #${ad.id}:`, error);
  }
};

/**
 * Deletes an advertisement from Algolia
 */
export const deleteAdFromAlgolia = async (adId: number) => {
  try {
    if (!client) {
      console.warn('Algolia client is not initialized, skipping ad deletion.');
      return;
    }
    await client.deleteObject({
      indexName: adsIndexName,
      objectID: adId.toString(),
    });
    console.log(`📡 Deleted Ad #${adId} from Algolia index.`);
  } catch (error) {
    console.error(`❌ Algolia delete failed for Ad #${adId}:`, error);
  }
};

/**
 * Indexes/Updates a user in Algolia
 */
export const syncUserToAlgolia = async (user: { id: number; username: string; photo_url: string | null; bio: string | null; is_banned: boolean }) => {
  try {
    if (!client) {
      console.warn('Algolia client is not initialized, skipping user sync.');
      return;
    }
    if (user.is_banned) {
      // Banned users are deleted from search completely
      await client.deleteObject({
        indexName: usersIndexName,
        objectID: user.id.toString(),
      });
      console.log(`📡 Removed banned User #${user.id} from Algolia.`);
      return;
    }

    const record = {
      objectID: user.id.toString(),
      id: user.id,
      username: user.username,
      photo_url: user.photo_url || '',
      bio: user.bio || '',
    };

    await client.saveObject({
      indexName: usersIndexName,
      body: record,
    });
    console.log(`📡 Indexed User #${user.id} ("${user.username}") to Algolia.`);
  } catch (error) {
    console.error(`❌ Algolia sync failed for User #${user.id}:`, error);
  }
};
