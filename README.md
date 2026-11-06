# Stagwell on AEM Edge Delivery Services

Migration of stagwellglobal.com to Edge Delivery Services. Content is authored in Document Authoring (DA).

## Environments
- Preview: https://main--eds-stagwell--dmccntadobe-ctrl.aem.page/
- Live: https://main--eds-stagwell--dmccntadobe-ctrl.aem.live/
- Authoring: https://da.live/#/dmccntadobe-ctrl/eds-stagwell

## Blocks
| Block | Purpose | Authoring model |
|---|---|---|
| hero | Home hero: logo, call-to-action, video stage | One row: logo image, then link and h1 (optionally a `<video>`) |
| showcase | Capabilities / points-of-view slider | Row 1: intro (heading, text, list). Other rows: title + text, image |
| people | Featured leader plus leadership slider | Row 1: photo, quote + name link + title. Other rows: photo, name link + title |
| stats | Large number counters | Each row: number, label |
| agencies | Tabbed agency list with "show more" | Each row: category, linked name |
| news | Latest news cards | Each row: image, date + linked title |
| newsletter | Sign-up form | Optional https link = form endpoint |
| cards, columns, header, footer, fragment | Standard blocks, restyled | See block code |

Section styles (Section Metadata "Style"): `intro`, `sky`, `light`, `navy`, `teal`, `band`, `statement`, `features`, `split`, `contact`, `full`. Block variants used by columns: `story`, `band`, `statement`, `sky`, `highlights`, `outsider`, `contact`, `contact single`.

## Development
```sh
npm i
npm run lint
npx -y @adobe/aem-cli up --no-open
```
Open a pull request with the `{branch}--eds-stagwell--dmccntadobe-ctrl.aem.page` links for the affected pages.
