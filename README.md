# Baya Weaver Resorts website

Static website for Baya Weaver Resorts, a pre-opening resort in Old Vythiri, Wayanad, Kerala.
Published with GitHub Pages from the `main` branch at https://afinz0z.github.io/Baya-Weaver-Website/

## Structure

| Path | What it is |
| --- | --- |
| `index.html` | Home page: all sections, schema (JSON-LD) and FAQ |
| `wayanad-guide.html` | Guide to places within two hours' drive, with drive times from the resort |
| `privacy.html`, `terms.html`, `accessibility.html` | Legal and accessibility pages |
| `404.html` | Not-found page (uses `<base href="/Baya-Weaver-Website/">`) |
| `css/site.css` | The only stylesheet. Colour and shape tokens are at the top |
| `js/theme.js` | Sets the light or dark theme before first paint |
| `js/main.js` | All behaviour. Each feature checks its own elements exist |
| `images/site/` | Web images (WebP). Each has a full size and a `-sm` size |
| `images/logo.svg`, `images/logo-reverse.svg` | The full horizontal logo, traced from the owner's new artwork (Oct 2026) with its metallic gold gradients: for light and for dark backgrounds. The header carries the same lockup inline |
| `images/logo-mark.svg`, `images/favicon.svg`, `favicon.ico`, `images/icon-*.png`, `images/logo.png` | Bird mark, favicons, app icons and a transparent logo for search engines. Brand gold is #E7BA44; the logo itself uses gradients from #925a08 to #ffe48e |
| `images/icons.svg` | Icon sprite (Phosphor Icons, MIT) |
| `fonts/` | Self-hosted Cormorant Garamond and DM Sans (SIL OFL) |
| `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`, `site.webmanifest` | Search, AI-assistant and app metadata |
| `23a44ca67918918938748f5db03c11cc.txt` | IndexNow key (lets the site notify Bing and others of changes). Keep it |

No build step and no dependencies: every file is served as it is.

## Preview locally

```
python -m http.server 8000
```

Then open http://localhost:8000/. The 404 page expects the `/Baya-Weaver-Website/` path, so preview it on the live site.

## Updating facts

Facts such as the villa count, target opening, distances and the site-update date appear in several places.
When one changes, search the repository for it and update every match, including:

- the visible copy in `index.html`
- the FAQ answers and the JSON-LD block in `index.html` (they must match each other)
- `llms.txt`, and the meta descriptions and social tags
- `lastmod` dates in `sitemap.xml`, and the "Last updated" date on any legal page you change

## Wayanad guide

- Drive times and distances were calculated from the resort's pin (11.535045, 76.038681) with OpenStreetMap
  data routed by OSRM, without traffic. Recalculate if you add places, and say "without traffic".
- Facts that change (permits, closures, timings) belong in the yellow "check before you go" notes, not in the
  description. Review the guide at least every season; update the date at the top and in `sitemap.xml`.
- When you add a place, also add it to `llms-full.txt` (the guide section) and to `llms.txt` if the count changes.

## Images

- Name files by what they show, e.g. `site-2026-03-22-villa-plastered.webp` for site photos (with the date taken)
  or `render-open-pool-deck.webp` for architect renders.
- Export WebP at about 1280 px wide for renders and 720 px for phone photos, plus a `-sm` copy (640 or 400 px).
- The home hero render fills the screen, so it also has `-1920` and `-2560` copies, upscaled from the architect's
  original. If you replace it with an image of a different shape, update the `40/17` and `236vh` in its `sizes`.
- Always set `width`, `height` and `alt`. Label renders as renders and date site photos in the caption.

## Forms

Both forms post to Formspree. Set the real form endpoint in the `action` attribute of `#newsletterForm` and
`#contactForm`. `form-action` and `connect-src` in the Content Security Policy (in each page's `<head>`) must allow
the form provider's domain.

## Testing before release

- Check every page at phone (320 to 430 px), tablet (768 to 1024 px), laptop and large-monitor widths, in light
  and dark themes. There should be no sideways scrolling, and the nav should stay on one line.
- Validate the HTML, and run an accessibility checker (such as axe) on each page.
- Submit both forms against a test endpoint, not the live one.

## Releasing

1. Work on a branch and preview locally.
2. Bump the `?v=` number on `css/site.css`, `js/main.js` and `js/theme.js` in every HTML file when those files change.
3. Open a pull request, review, then merge to `main`. GitHub Pages publishes within a few minutes.
4. Check the live site with a hard refresh (pages are cached for about 10 minutes).
5. Tell search engines about changed pages with IndexNow:
   `curl -X POST https://api.indexnow.org/indexnow -H "Content-Type: application/json" -d '{"host":"afinz0z.github.io","key":"23a44ca67918918938748f5db03c11cc","keyLocation":"https://afinz0z.github.io/Baya-Weaver-Website/23a44ca67918918938748f5db03c11cc.txt","urlList":["https://afinz0z.github.io/Baya-Weaver-Website/"]}'`
