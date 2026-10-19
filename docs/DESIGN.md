# Design notes

A small character page for Dr. Jayy: React + Vite + Tailwind v4, deployed to
GitHub Pages at `/pink_apl/`.

## Pages

| Page            | URL                    | File                      |
| --------------- | ---------------------- | ------------------------- |
| Hospital Lobby  | `/`                    | `src/pages/Lobby.tsx`     |
| Dr. Jayy        | `/info`                | `src/pages/Profile.tsx`   |
| Lore            | `/info/lore`           | `src/pages/Lore.tsx`      |
| Main Characters | `/oc` (`?page=2`, ...) | `src/pages/CardPages.tsx` |
| Species         | `/species`             | `src/pages/CardPages.tsx` |
| Pharmacy        | `/pharmacy`            | `src/pages/CardPages.tsx` |

`src/routes.ts` is the one list of pages. Adding a page means adding it there
and giving it a component in `App.tsx` (TypeScript complains until you do).

## Multiple pages on GitHub Pages

GitHub Pages only serves files that exist. The `page-html` plugin in
`vite.config.ts` reads `routes.ts` and writes a copy of `index.html` for every
page (`oc/index.html`, `info/lore/index.html`, ...), each with its own
`<title>`. Deep links and refreshes load with a normal 200. A `404.html` copy
shows the app's "page not found" screen for anything else.

Paging uses `?page=N` rather than new paths, so it needs no extra files.

## Layout

- **Wide screens** (`min-width: 768px` and `min-height: 500px`): every page is
  a fixed 1280×800 canvas, scaled to fit the window (`components/Stage.tsx`).
  Pages style this with the custom `stage:` Tailwind variant.
- **Phones and short landscape screens**: the same content stacks in a normal
  scrolling column (base Tailwind classes).

The media query is written twice, in `index.css` (`@custom-variant stage`) and
in `Stage.tsx` (`STAGE_QUERY`). Keep them the same.

The apple in the corner and the icon next to each page title link back to the
lobby (the ① marks in the sketches).

## Content and images

- Text, links and card lists: `src/content/*.ts`.
- Every image URL: `src/content/assets.ts` (and the card images in
  `content/cards.ts`). All are placeholders for now (stock photos and placehold.co). To use real
  art, put the files in `public/img/` and swap the URL for `img('file.png')`.
  Never write image paths with a leading `/`: the site lives under `/pink_apl/`.

## Fonts

Self-hosted in `src/assets/fonts/`:

- **Costa Rica** (headings) by Rafael Ferran, SIL Open Font License
  (`CostaRica-OFL.txt`). From https://www.dafont.com/costarica.font.
  Not the "Costa Rica" blackletter on FontSpace, which is a different font.
- **Sant Joan Despi Regular** (body, heart-shaped O) by Forma & Co, 2013.
  Listed as free for personal use only; the customer is sorting out the licence.

## Deploying

`.github/workflows/deploy.yml` builds and deploys on every push to `main`
(or by hand from the Actions tab). In the repo settings, Pages → Source must be
set to "GitHub Actions".
