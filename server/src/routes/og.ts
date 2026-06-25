import { Router, Request, Response } from 'express';
import { getAdById } from '../db/ads.js';

const router = Router();

// GET /og/ads/:id
// Serves a minimal HTML page containing Open Graph + Twitter Card meta tags.
// Consumed by social platform crawlers (WhatsApp, Facebook, Discord, etc.)
// via a Vercel edge rewrite that only routes bot User-Agents here.
// Real browsers receive a <meta http-equiv="refresh"> redirect back to the SPA.
router.get('/ads/:id', async (req: Request, res: Response) => {
  const adId = parseInt(req.params.id, 10);

  if (isNaN(adId)) {
    return res.status(400).send('Invalid ad ID');
  }

  // FRONTEND_URL is the production Vercel URL (e.g. https://fakna.vercel.app)
  const frontendUrl = process.env.FRONTEND_URL ?? 'https://advertisment-delta.vercel.app';
  const defaultImage = `${frontendUrl}/og-default.png`;
  const pageUrl = `${frontendUrl}/ads/${adId}`;

  try {
    const ad = await getAdById(adId);

    if (!ad) {
      // Still return valid OG tags so bots don't get an error page
      const html = buildOgHtml({
        title: 'Ad not found — Fakna',
        description: 'This advertisement may have been removed.',
        image: defaultImage,
        url: pageUrl,
      });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(html);
    }

    const title = ad.title ?? 'Fakna — Advertisement Platform';

    // Truncate description to 200 chars for the og:description tag
    const rawDesc = ad.description ?? '';
    const description = rawDesc.length > 200
      ? rawDesc.slice(0, 197) + '...'
      : rawDesc || 'Browse and post free advertisements on Fakna.';

    // Use first image if available; images is DbAdImage[] with cloudinary_url field
    const firstImage = Array.isArray(ad.images) && ad.images.length > 0
      ? ad.images[0].cloudinary_url
      : null;

    const image = firstImage ?? defaultImage;

    const html = buildOgHtml({ title, description, image, url: pageUrl });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    // Cache for 10 minutes so repeat bot visits don't hammer the DB
    res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=600');
    return res.send(html);
  } catch (err) {
    console.error('[OG] Preview generation error:', err);

    // Fallback — still send valid OG tags even on DB error
    const html = buildOgHtml({
      title: 'Fakna — Advertisement Platform',
      description: 'Browse and post free advertisements on Fakna.',
      image: defaultImage,
      url: pageUrl,
    });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  }
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface OgData {
  title: string;
  description: string;
  image: string;
  url: string;
}

function buildOgHtml({ title, description, image, url }: OgData): string {
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  // Image and URL are Cloudinary/internal URLs — escape for attribute safety
  const img = escapeAttr(image);
  const u = escapeAttr(url);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${t} — Fakna</title>
    <meta name="description" content="${d}" />

    <!-- Open Graph (Facebook, WhatsApp, LinkedIn, Discord) -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Fakna" />
    <meta property="og:url" content="${u}" />
    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:image" content="${img}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${t}" />

    <!-- Twitter / X Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${t}" />
    <meta name="twitter:description" content="${d}" />
    <meta name="twitter:image" content="${img}" />
    <meta name="twitter:image:alt" content="${t}" />

    <!-- Redirect real browsers back to the React SPA immediately -->
    <meta http-equiv="refresh" content="0; url=${u}" />
  </head>
  <body>
    <p>Redirecting to <a href="${u}">${t}</a>&hellip;</p>
  </body>
</html>`;
}

/** Prevent XSS in HTML text content */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Prevent XSS in HTML attribute values */
function escapeAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default router;
