# Stagwell on AEM Edge Delivery Services

Migration of [stagwellglobal.com](https://www.stagwellglobal.com/) to AEM Edge Delivery Services (EDS). Content is authored in Document Authoring (DA); this repository holds the code (blocks, styles, scripts).

For the full project history, decisions, open items and operating instructions, read [HANDOFF.md](./HANDOFF.md).

## Environments

| | URL |
|---|---|
| Preview | https://main--eds-stagwell--dmccntadobe-ctrl.aem.page/ |
| Live | https://main--eds-stagwell--dmccntadobe-ctrl.aem.live/ |
| Authoring (DA) | https://da.live/#/dmccntadobe-ctrl/eds-stagwell |
| Code | https://github.com/dmccntadobe-ctrl/eds-stagwell |

Branch previews use `https://{branch}--eds-stagwell--dmccntadobe-ctrl.aem.page/`. **Branch names must not contain a slash** (use `fix-header`, not `fix/header`), otherwise the preview host cannot resolve the branch.

## Pages migrated

| Source | Path |
|---|---|
| Home ("Transforming Marketing") | `/` |
| About Us | `/about-us` |
| Our Network | `/our-network` |
| Meet Mark | `/meetmark` |
| Header and footer | `/nav`, `/footer` |

## Blocks

| Block | Purpose | Authoring model (rows and cells) |
|---|---|---|
| `hero` | Home hero: logo, call-to-action, video stage | One row: logo image, then a link and an `h1`. Optional `<video>` or a public `.mp4` link. |
| `showcase` | Capabilities and points-of-view slider | Row 1: intro (heading, text, bullet list). Other rows: title + text, image. |
| `people` | Featured leader plus leadership slider | Row 1: photo, quote + name link + title. Other rows: photo, name link + title. |
| `stats` | Large number counters | Each row: number, label. |
| `agencies` | Tabbed agency list with "show more" | Each row: category, linked name. |
| `news` | Latest news cards | Each row: image, date + linked title. |
| `newsletter` | Sign-up form | Optional `https` link inside the block is the form endpoint; without it the form is disabled. |
| `cards`, `columns`, `header`, `footer`, `fragment` | Standard blocks, restyled | See block code. |

### Section styles (Section Metadata, `Style`)

Separate multiple styles with commas, for example `navy, split`.

`intro`, `sky`, `light`, `navy`, `teal`, `band`, `statement`, `features`, `split`, `contact`, `full`.

### Block variants used with `columns`

`story`, `band`, `statement`, `sky`, `highlights`, `outsider`, `contact`, `contact single`.

## Design tokens

Values were measured from the original site's computed styles. They live in `styles/styles.css`.

- Colours: navy `#003349` (text, headings), gold `#ffb81c`, teal `#009cbd` (display text), `#00748c` (small teal text on light backgrounds), light grey `#f5f7f6`.
- Fonts: Montserrat (variable, 300 to 700) for text and headings; Spectral italic (300, 400) for the accent line in headings. Both are self-hosted in `fonts/` and declared in `styles/fonts.css`.
- Breakpoints: below 768px mobile tokens; 768px and up desktop type sizes with 48px gutters; 981px and up 60px gutters and multi-column layouts; 1240px and up full navigation (below it the menu button); 1329px and up two-column "split" stats section.

## Development

```sh
npm i
npm run lint          # eslint + stylelint
npx -y @adobe/aem-cli up --no-open   # local code against previewed content
```

Rules for this repository are in [AGENTS.md](./AGENTS.md). In short: do not edit `scripts/aem.js`, scope CSS to the block name, keep `fragment/fragment.js` as the only cross-block import, and use `.hlxignore` for files that must not be served.

Pull requests must include preview links in the form `https://{branch}--eds-stagwell--dmccntadobe-ctrl.aem.page/{path}` for the affected pages.

## Tools

- `tools/migration/`: one-off scripts that converted the saved original pages into DA content and published them. See HANDOFF.md.
- `tools/qa/`: browser checks for overlapping text and sideways scrolling across viewport widths.

Both folders are listed in `.hlxignore` and are not served.
