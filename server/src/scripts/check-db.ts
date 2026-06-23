import { query } from '../db/index.js';

async function run() {
  try {
    const adsRes = await query('SELECT COUNT(*) as count FROM ads');
    const usersRes = await query('SELECT COUNT(*) as count FROM users');
    const imagesRes = await query('SELECT COUNT(*) as count FROM ad_images');
    const categoriesRes = await query('SELECT COUNT(*) as count FROM categories');
    
    console.log('Database Status:');
    console.log(`- Ads count: ${adsRes.rows[0].count}`);
    console.log(`- Users count: ${usersRes.rows[0].count}`);
    console.log(`- Images count: ${imagesRes.rows[0].count}`);
    console.log(`- Categories count: ${categoriesRes.rows[0].count}`);
    
    if (parseInt(adsRes.rows[0].count, 10) > 0) {
      const sampleAds = await query('SELECT id, title, category, price FROM ads LIMIT 3');
      console.log('Sample Ads:', sampleAds.rows);
    }
  } catch (err) {
    console.error('Error querying database:', err);
  } finally {
    process.exit(0);
  }
}

run();
