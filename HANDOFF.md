# Handoff: Stagwell migration to AEM Edge Delivery Services

Written at the end of the first build phase. It covers what exists, how it was built, how to operate it, what was verified, and what is still open.

## 1. Status in one paragraph

Four pages of stagwellglobal.com (Home, About Us, Our Network, Meet Mark) plus the header and footer are migrated into DA and previewed on `main`. The code (blocks, styles, scripts) is merged to `main`. The design was matched to the original by measuring its computed styles at 1440, 768 and 390px; desktop is close, tablet and mobile are closer but pages are still taller than the original. **Nothing has been published to the live site (`.aem.live`).** Several data-dependent features of the original (network map and filters, the full agency list, the hero video, newsletter submission) are not built because the data or service was not available. See section 8.

## 2. Where things live

| Thing | Location |
|---|---|
| Code repository | https://github.com/dmccntadobe-ctrl/eds-stagwell (default branch `main`) |
| Authoring (DA) | https://da.live/#/dmccntadobe-ctrl/eds-stagwell |
| Preview | https://main--eds-stagwell--dmccntadobe-ctrl.aem.page/ |
| Live (not yet published) | https://main--eds-stagwell--dmccntadobe-ctrl.aem.live/ |
| Content in DA | `index`, `about-us`, `our-network`, `meetmark`, `nav`, `footer` |
| Images in DA | `media/stagwell/<hash>.<ext>` (about 50 files). Pages reference them as `https://content.da.live/dmccntadobe-ctrl/eds-stagwell/media/stagwell/<file>`; EDS pulls them into the media bus at preview time. |
| Hero video in DA | `media/stagwell/stagwell-hero.mp4` (17.7 MB, compressed from 48 MB). **Not referenced by any page**, see section 8. |
| Source material | Saved HTML copies of the four original pages (not in the repo, 4 to 70 MB each, images embedded as base64). The original site returns 403 to scripted requests. |

### Access

- GitHub: the `gh` CLI on the build machine is logged in as `dmccntadobe-ctrl` (HTTPS). Another account (`adobeaiforum2026`) was logged in at first and has no write access.
- DA and the admin API: token from `npx github:adobe-rnd/da-auth-helper token` (browser sign-in as the `dmccntadobe-ctrl` owner). It is cached at `~/.aem/da-token.json` and lasts about 24 hours. Never commit it.

## 3. What was built

### Blocks (`blocks/`)

New: `showcase`, `people`, `stats`, `agencies`, `news`, `newsletter`. Restyled boilerplate blocks: `hero`, `cards`, `columns`, `header`, `footer`. Unchanged: `fragment`. Removed: `widget` (unused). The authoring model of each block is in README.md.

Behaviour worth knowing:
- `showcase`: slides scroll with scroll-snap; arrows move one slide; the active (gold) slide follows scrolling; counter is announced politely; respects reduced motion.
- `people`: featured first row, then a slider; arrows scroll two items.
- `agencies`: WAI-ARIA tabs (arrow keys, Home, End), first 16 names visible with "Show more".
- `newsletter`: fields and validation are built; it POSTs form data to an `https` link placed inside the block. With no link the submit button is disabled and says sign-up is not connected.
- `hero`: shows a tagline stage with a play button linking to the earnings call, unless the block contains a `<video>` or a public `.mp4` link.
- `news`: static cards; the three headlines in `tools/migration/newsitems.json` were copied by hand from stagwellglobal.com/news on 2026-11-06 and will go stale.

### Styles and tokens

`styles/styles.css` holds tokens, typography, section styles and responsive rules. `styles/fonts.css` declares the self-hosted fonts in `fonts/`. Details in README.md.

### Layout rules that are easy to break

- Content container: `max-width: 1440px`, padding from `--page-padding` (20, 48, 60px). `--page-gutter` is the edge-to-content distance used by full-bleed blocks (showcase, agencies, footer, split section).
- `split` section: two columns only from 1329px; the left column is `gutter + 516px` wide. It stacks below that.
- Navigation switches between the menu button and the full menu at 1240px (both `header.js` and `header.css`).
- Column grids use `minmax(0, Nfr)` tracks so they cannot push the page wider than the viewport.

## 4. How the content was produced

The content is generated, not hand-authored. The scripts are in `tools/migration/` (one-off, not served; listed in `.hlxignore`):

| Script | Does |
|---|---|
| `media.mjs` | Extracts every base64 image and the video from the saved pages into `./media/` (file name = SHA-1 prefix + extension). |
| `convert.mjs` | Parses the saved pages (cheerio) and writes first-pass DA HTML to `./content/`. |
| `compose.mjs` | Turns that into final block markup, section styles and metadata in `./final/`. Per-page layout decisions live here. |
| `navfooter.mjs` | Builds `nav` and `footer` from the original header and footer. |
| `publish.sh` | Runs convert, compose and navfooter, uploads referenced images and all pages to DA, and triggers preview. |
| `newsitems.json` | Data for the news block. |

To re-run (needs Node 22, `npm i --no-save cheerio`, the saved source files, and a valid DA token):

```sh
cd tools/migration
mkdir -p content final media
SRC_DIR=/path/to/saved/pages node media.mjs
bash publish.sh
```

The source file names the scripts expect are `Stagwell _ Transforming Marketing (1).html`, `Stagwell _ About Us - Stagwell.html`, `Stagwell _ Our Network - Stagwell.html`, `Stagwell _ Meet Mark - Stagwell.html`.

Caveats:
- Re-running overwrites the six pages in DA. Any edits authors made in DA to those pages will be lost. Once authors own the content, stop using these scripts for pages and edit in DA instead.
- DA rules the scripts rely on: images must be reachable URLs (DA media URLs work); section styles in Section Metadata are comma separated; `<strong><a>` becomes a primary button (the arrow-circle link style); MP4 is capped at 36 MB and `content.da.live` URLs are not public, so video links to it do not work for visitors.
- The 48 MB video was compressed with ffmpeg: `-vf "scale='min(1280,iw)':-2" -c:v libx264 -crf 27 -c:a aac -b:a 96k -movflags +faststart`.

## 5. Working agreement for changes

1. Branch from `main`. Branch names without slashes.
2. `npm run lint` must pass (CI runs it on every push). Working copies on Windows may show CRLF noise; `.gitattributes` forces LF in the repository.
3. Open a PR with preview links for the affected pages (AGENTS.md requires it).
4. Merge to `main` ships the code. Content is separate: edit in DA, then preview and publish (Sidekick, or `admin.hlx.page` preview and live endpoints).
5. A code change that needs new block names or section styles in content must be merged before the content that uses it is previewed on `main`, otherwise `main` shows unstyled content.

### Pull request history

| PR | Result |
|---|---|
| 1 | Closed. First blocks; the branch name contained a slash and its preview never had code. |
| 2 | Merged. Blocks, pages, first styling. |
| 3 | Merged. Rebuilt blocks to match the original look and behaviour. |
| 4 | Merged. News block, hero video support, CTA colours. |
| 5 | Merged. Measured visual match, QA/QC fixes, self-hosted fonts, repo hygiene. |
| 6 | Merged. Wide and mid-width layout fixes (stats overlay, squeezed footer, overflow). |

## 6. Verification performed

- Lint: `eslint` and `stylelint` clean on `main`.
- Visual: the original saved pages and the new pages were rendered in headless Edge at 1440, 768 and 390px. Computed fonts, colours, sizes and section boxes were compared programmatically, and full-page screenshots were reviewed side by side. Home and About Us were reviewed in detail at desktop width; Network and Meet Mark at desktop width; Home at mobile width.
- Overlap and overflow audit (`tools/qa/overlap.mjs`, `tools/qa/sweep.mjs`) at 2560, 1920, 1564, 1414, 1300, 1240, 1200, 1024, 768 and 390px on the four pages: no overlapping text or sideways scrolling, with two exceptions noted below. Run these again after any layout change:

```sh
cd tools/qa
npm i --no-save puppeteer-core
NEW_BASE=https://main--eds-stagwell--dmccntadobe-ctrl.aem.page node overlap.mjs
NEW_BASE=https://main--eds-stagwell--dmccntadobe-ctrl.aem.page node sweep.mjs
```

Not verified:
- No testing in Safari, Firefox or on real phones; only headless Edge.
- No screen reader testing; accessibility was checked by code review and the automated checks above.
- No Lighthouse or Core Web Vitals run.
- About Us showed a one-off 80px sideways overflow at 1024px in the audit that did not reproduce when checked directly.
- The home page overflows by about 6px at exactly 1000px wide on `main` (found after the last merge, not fixed).
- Tablet (768px) and mobile (390px) pages were compared by measurement but only the home page was reviewed visually at mobile width.

## 7. Differences from the original that are known and accepted

- Small teal text on light backgrounds uses `#00748c` instead of the brand teal for contrast.
- White text on the teal sections (newsletter, "The Outsider") uses the brand teal and does not reach 4.5:1 for small text.
- The page heights at 768px and 390px are larger than the original's (for example home at 390px is 6200px against 4890px).
- Dropdown menus use a simple panel, not the original's full-width mega panels.

## 8. Open items and decisions

| Item | What is needed |
|---|---|
| Network map and filters ("Filter by Capability / Geography") | Agency list with capabilities and locations, and a decision on map provider (Google Maps needs an API key). The saved pages contain no marker or filter data. |
| Full agency list | Only 20 agencies were in the saved page; the original says 70+ and showed "Show more (32 more)". Provide a complete list (or a fuller re-save of the Network page after expanding every tab). The block already handles more rows and three tabs (Agencies, Affiliates, The Marketing Cloud). |
| Hero video | A public URL for the MP4 (CDN or the original site's upload), or approval to commit the 17.7 MB file to the repo. Then add the link to the hero block. |
| Newsletter | The sign-up endpoint (the original posted to its WordPress Gravity Form). Place its `https` URL as a link in the newsletter block. Consider a spam check. |
| Latest News | Needs a data source (for example a DA spreadsheet or `query-index.json`) instead of the static three cards. |
| Mega-menu dropdowns | Design decision; current dropdown is functional but plain. |
| Publishing | Publish the six pages to live once the above is accepted. |
| Mobile and tablet heights | Further tuning of the showcase, stats and people sections to reduce page length. |

Accessibility items from the code review that are not done: `aria-expanded` and `aria-controls` on the hamburger and dropdown buttons, arrow-key and outside-click handling for the dropdowns, the 24px minimum size for the hamburger target, a `form-action`/`connect-src` Content-Security-Policy, and clearing 9 dev-dependency audit warnings (`npm audit` reports none in production dependencies). `.github/workflows/main.yaml` is titled "Node.js 20" but runs Node 24, and its action versions were not verified.

## 9. Lessons and gotchas

- A branch name with a slash gives a preview host that never receives code. Use dashes.
- DA media URLs (`content.da.live`) need a login. Images are fine because EDS copies them into the public media bus at preview, but video and other links are not rewritten and stay behind the login.
- `decorateButtons` only turns a link into a button when it is alone in a paragraph and wrapped in `<strong>` (primary) or `<em>` (secondary).
- Section Metadata `Style` values become classes; spaces make one class, so use commas: `navy, split`.
- The boilerplate `main > .section > div` rule gives every wrapper `margin: 0 auto`, which centres grid items instead of stretching them; reset margins inside grid sections.
- Fixed pixel grid columns work at 1440px and break at other widths; the audits in section 6 catch this.
- Windows checkouts get CRLF; `.gitattributes` fixes the repository, and `sed -i 's/\r$//'` fixes a working copy.

## 10. Suggested next steps

1. Decide the open items in section 8, starting with the agency data and newsletter endpoint.
2. Fix the 6px overflow at 1000px and re-run the audits on all pages.
3. Review Network and Meet Mark visually at tablet and mobile widths.
4. Run Lighthouse on the four pages and fix anything below 90.
5. Have authors review the content in DA, then publish.
6. Retire `tools/migration` once authors own the content.
