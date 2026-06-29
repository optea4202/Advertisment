import { query } from '../db/index.js';
import 'dotenv/config';

async function setFeaturedAds() {
  // Fetch the top 8 most recent ads
  const adsResult = await query(
    `SELECT id FROM ads ORDER BY created_at DESC LIMIT 8`,
    []
  );

  const ids = adsResult.rows.map((r: any) => r.id);
  console.log('Setting featured_ad_ids to:', ids);

  await query(
    `UPDATE pages SET featured_ad_ids = $1 WHERE slug = 'home'`,
    [ids]
  );

  const check = await query(
    `SELECT featured_ad_ids FROM pages WHERE slug = 'home'`,
    []
  );
  console.log('Saved featured_ad_ids:', check.rows[0].featured_ad_ids);
  process.exit(0);
}

setFeaturedAds().catch((err) => {
  console.error(err);
  process.exit(1);
});
