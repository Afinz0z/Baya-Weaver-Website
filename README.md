# Baya Weaver Resorts website

Static website for Baya Weaver Resorts, a pre-opening resort in Old Vythiri, Wayanad, Kerala.
Published with GitHub Pages from the `main` branch at https://afinz0z.github.io/Baya-Weaver-Website/

## Structure

| Path | What it is |
| --- | --- |
| `index.html` | Home page: all sections, schema (JSON-LD) and FAQ |
| `privacy.html`, `terms.html`, `accessibility.html` | Legal and accessibility pages |
| `404.html` | Not-found page (uses `<base href="/Baya-Weaver-Website/">`) |
| `css/site.css` | The only stylesheet. Colour and shape tokens are at the top |
| `js/theme.js` | Sets the light or dark theme before first paint |
| `js/main.js` | All behaviour. Each feature checks its own elements exist |
| `images/site/` | Web images (WebP). Each has a full size and a `-sm` size |
| `images/icons.svg` | Icon sprite (Phosphor Icons, MIT) |
| `fonts/` | Self-hosted Cormorant Garamond and DM Sans (SIL OFL) |
| `sitemap.xml`, `robots.txt`, `llms.txt`, `site.webmanifest` | Search and app metadata |

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

## Images

- Name files by what they show, e.g. `site-2026-03-22-villa-plastered.webp` for site photos (with the date taken)
  or `render-open-pool-deck.webp` for architect renders.
- Export WebP at about 1280 px wide for renders and 720 px for phone photos, plus a `-sm` copy (640 or 400 px).
- Always set `width`, `height` and `alt`. Label renders as renders and date site photos in the caption.

## Forms

Both forms post to Formspree. Set the real form endpoint in the `action` attribute of `#newsletterForm` and
`#contactForm`. `form-action` and `connect-src` in the Content Security Policy (in each page's `<head>`) must allow
the form provider's domain.

## Releasing

1. Work on a branch and preview locally.
2. Bump the `?v=` number on `css/site.css`, `js/main.js` and `js/theme.js` in every HTML file when those files change.
3. Open a pull request, review, then merge to `main`. GitHub Pages publishes within a few minutes.
4. Check the live site with a hard refresh (pages are cached for about 10 minutes).
