import { query } from '../db/index.js';
import { getAds } from '../db/ads.js';
import { syncAdToAlgolia, syncUserToAlgolia, configureIndexSettings } from '../utils/algolia.js';

const backfill = async () => {
  console.log('🔄 Starting Algolia index backfill...');
  
  // Configure index settings first
  await configureIndexSettings();

  // 1. Migrate Ads (only non-banned)
  try {
    console.log('📖 Fetching advertisements from DB...');
    // getAds({}) automatically filters out banned users' ads
    const ads = await getAds({});
    console.log(`Found ${ads.length} active ads to sync.`);

    for (const ad of ads) {
      await syncAdToAlgolia(ad);
    }
    console.log('✅ Ads backfilled successfully.');
  } catch (err) {
    console.error('❌ Error backfilling ads:', err);
  }

  // 2. Migrate Users (only non-banned)
  try {
    console.log('📖 Fetching users from DB...');
    const usersRes = await query(`
      SELECT id, username, photo_url, bio, is_banned 
      FROM users 
      WHERE is_banned = FALSE
    `);
    const users = usersRes.rows;
    console.log(`Found ${users.length} active users to sync.`);

    for (const user of users) {
      await syncUserToAlgolia(user);
    }
    console.log('✅ Users backfilled successfully.');
  } catch (err) {
    console.error('❌ Error backfilling users:', err);
  }

  console.log('🏁 Algolia Migration Complete. Exiting...');
  process.exit(0);
};

backfill();
