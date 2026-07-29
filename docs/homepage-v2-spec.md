# Home page v2 — implementation spec

Status: approved by Brian, 2026-07-24 (copy reviewed and edited by Brian — implement quoted copy verbatim). This document is the single source of truth for the home-page overhaul. Bracketed `[...]` notes inside copy blocks are instructions to the implementer, not copy to render.

## 0. Read this first (constraints & conventions)

1. **Load these skills before writing any code:** `delightful-ui`, `ui-anti-slop`, `css-authoring`, `delightstack`.
2. **Hover rule (repo CLAUDE.md, non-negotiable):** every CSS block whose selector contains `:hover` starts with `transition-duration: 0s;`.
3. Naming: `snake_case` variables/properties, `camelCase()` functions, `CAPS_CASE` consts. Plain CSS with native nesting. No new dependencies.
4. **Motion:** state commits instantly; animation is presentation only; everything respects `prefers-reduced-motion` (collapse movement to opacity fades). Use the existing `reducedMotion()` helper pattern found in `Creed.svelte`.
5. **Existing primitives are the toolkit.** Reuse `SectionShell`, `PinScrub`, `Reveal`, `LazyMedia`, `LightboxGallery`, `ViewfinderFrame`, `ScrubVideo` etc. (all in `src/lib/components/about/primitives/`). New primitives go in the same folder; new sections in `src/lib/components/about/sections/`.
6. **Sections use `content-visibility: auto`** with `contain-intrinsic-size` estimates (see `SectionShell.svelte` / `sectionNav.ts` comment). Every new section must follow the same pattern and provide a sane intrinsic-size estimate, or scroll-jumping breaks.
7. **Link consistency is internal-only.** The site is pre-release: breaking previously-shared URLs is fine. What must stay consistent is the page's own wiring — section `#hash` ids, `?media=<key>&i=<n>` lightbox links (via `LightboxGallery`), and the `stops` array in `src/routes/+page.svelte` must all agree with each other after the reorder.
8. Media URLs are `https://cdn.brianschwabauer.com/media/<path>` where `<path>` is the file's path under the local `media/` folder (a 1:1 mirror of the R2 `media/` prefix). Before using any asset listed in this doc, verify it resolves (`curl -sIf <url>`); if one 404s, upload it: `wrangler r2 object put brianschwabauer/media/<path> --file=media/<path> --remote`.
9. Verify in the browser (Claude in Chrome / `/run`) at desktop and 375 px widths, plus a `prefers-reduced-motion` pass. No e2e tests.
10. Commit to the **current branch**, one commit per phase (§10).

## 1. Final page order

New sequence for `src/routes/+page.svelte` (★ = new, ↻ = moved/changed):

```
Hero                       (unchanged — the above-the-fold experience stays exactly as is)
Rewind
ChapterCard act=1          ★ "The Film Kid" + film-leader countdown (§4)
HumbleBeginnings
GreenScreen
FeatureLength
TakingItSeriously
MusicVideos
Animation
Festivals
ChapterCard act=2          ★ "The Pivot" (§4)
College
Spunksters
EmptyYearMark 2014
WhatMakesUsHuman
ChapterCard act=3          ★ "The Builder" + bridge line (§4)
Freelancer                 ↻ tabbed archive window (§6)
Entrepreneurship           ↻ tabbed archive window (§6)
ShippedWall                ★ diagonal screenshot set piece (§7)
EmptyYearMark 2018
ShowAndTour
YearCycler 2020–2025
SideProjects
WhatImUpTo                 ↻ relocated + reframed as the arrival (§5)
Creed                      ↻ fourth tenet; confetti code moves out (§8)
TheEnd                     ★ "The End" card + confetti cannons (§9.1)
Credits                    ★ auto-rolling credits + crawl easter egg (§9.2)
CreditsStinger             ★ post-credits scene (§9.3)
```

Updated `stops` array (labels shown in the YearScrubber; ids may be renamed freely if a better name emerges — just keep ids, hashes, and stops in sync):

```ts
{ id: 'hero',                year: 'Start',      label: 'Delivering Delight' },
{ id: 'humble-beginnings',   year: '2006',       label: 'Humble Beginnings' },
{ id: 'green-screen',        year: '2007',       label: 'Green Screen' },
{ id: 'feature-length',      year: '2008',       label: 'Feature Length' },
{ id: 'taking-it-seriously', year: '2009',       label: 'First Websites' },
{ id: 'music-videos',        year: '2009',       label: 'Music Videos' },
{ id: 'animation',           year: '2010',       label: 'Animation & VFX' },
{ id: 'festivals-ksms',      year: '2011',       label: 'Festivals & KSMS' },
{ id: 'college',             year: '2012',       label: 'College' },
{ id: 'spunksters',          year: '2013',       label: 'The Spunksters' },
{ id: 'what-makes-us-human', year: '2015',       label: 'Senior Thesis' },
{ id: 'freelancer',          year: '2016',       label: 'Freelancer' },
{ id: 'entrepreneurship',    year: '2017',       label: 'Entrepreneurship' },
{ id: 'shipped-wall',        year: '2015–18',    label: 'The Wall of Shipped Screens' },
{ id: 'showandtour',         year: '2019',       label: 'Show&Tour' },
{ id: 'side-projects',       year: 'Today',      label: 'Side Projects' },
{ id: 'what-im-up-to',       year: 'Now',        label: 'Which Brings Us to Now' },
{ id: 'creed',               year: 'Always',     label: 'The Creed' },
{ id: 'credits',             year: 'Fin',        label: 'Credits' },
```

Chapter cards and TheEnd are NOT scrubber stops (they're transitions, not destinations).

## 2. The billing block

> **Cut 2026-07-26 along with the ticket booth that housed it.** Kept here for
> the record; nothing in `src/` renders it.

**Billing block** — the condensed tall-type block from the bottom of film posters:

- Typography: the classic billing-block look — a very condensed sans (use `font-stretch: condensed`/`semi-condensed` on the existing sans, or scale-x transform ~0.7 if the font has no condensed axis), ALL CAPS, tight leading, mixed sizes: role words small (~0.55rem), name/keywords larger (~0.8rem). Center-aligned, max-width ~44rem, letter-spacing 0.08em, 60% opacity, `·` separators.
- Content (verbatim, line breaks as shown):

```
A SHOWANDTOUR PRODUCTION
BRIAN SCHWABAUER · SOFTWARE ENGINEER · DESIGNER · ENTREPRENEUR
CURRENTLY BUILDING "SHOW&TOUR" · FORMERLY FILMMAKER · FREELANCER · FLASH KID
FILMED ON LOCATION IN KANSAS CITY · RUNTIME: 20 YEARS AND COUNTING
```

- "SHOW&TOUR" links to https://showandtour.com (underline on hover only; hover rule applies).
- Mobile: same block, smaller (role words ~0.5rem), 3 lines may wrap — fine.
- This block is always visible.

## 3. Deleted scenes

> **Revised 2026-07-26.** The original spec shipped a page-wide theatrical /
> director's cut with a persisted preference, a ticket booth to choose it, and a
> scrubber chip to toggle it. That whole system is gone: `cut.svelte.ts`,
> `TicketBooth.svelte`, the chip, and the `?cut=` param have all been deleted.
> What survives is the film strip, rewired as a plain local disclosure.

### 3.1 State

None. There is no store, no URL param, no `localStorage`, no SSR plumbing.

Each fold owns a `let expanded = $state(false)`. Opening one says nothing about
any other, and every strip is closed again on the next visit or refresh — the
page always opens on its short edit.

### 3.2 `FilmStrip.svelte` + `DeletedScenes.svelte`

`FilmStrip` is the marker, unchanged visually: a full-width ~3.5rem strip of cut
film — dashed 1px border top and bottom (~35% white), sprocket-hole squares
repeated along both edges via `repeating-linear-gradient`, background
`rgba(255,255,255,0.03)`, small clapperboard SVG at the left. The whole strip is
one `<button>` (min 44px hit target).

Its label is now the action, not a mode switch: mono 0.72rem / 0.14em, uppercase,
`VIEW 3 DELETED SCENES` (or `VIEW 1 DELETED SCENE`, or the `label` prop). A `↓`
sits at the right — down, because the scenes drop in below rather than taking the
reader elsewhere.

`DeletedScenes` wraps `FilmStrip` with the content it hides: collapsed renders
the strip, expanded replaces it with the children (~150ms opacity fade, no height
animation). Focus moves to the revealed region after `tick()`, since the button
the reader just pressed is torn out. There is no re-collapse — one-way within a
visit, and a refresh resets it.

No scroll anchoring is needed. Only one fold moves at a time, and the content
lands _below_ the strip, so nothing above the reader's eye shifts.

Where the hidden thing must stay mounted — a `LightboxGallery` whose `?media=`
deep links have to resolve while collapsed — render it headless and put a bare
`FilmStrip` beside it instead.

### 3.3 Large galleries

Galleries don't get a strip; they truncate. `PeekGallery` shows `peek`
thumbnails and darkens the last into a `+N MORE` tile that expands the grid in
place, exactly as the What Makes Us Human gallery already did. All items stay
mounted in the headless `LightboxGallery`, so `?media=` links and carousel
paging always cover the full set.

### 3.4 Prose asides

Prose-only material that used to carry a `DIRECTOR'S CUT` micro-label is simply
always visible now, with the label dropped. Text is cheap; hiding it behind a
strip bought nothing. This covers the College asides (NODE camera steering,
PickVid, Split Life production notes, the Fugue column) and the Flash-era stack
essay in TakingItSeriously.

### 3.5 Fold inventory — what starts collapsed

Rules: (a) set pieces never fold (Rewind, robot scrub, greenscreen slider, ShippedWall, Creed, credits, chapter cards, FilmReels, SnapStrip); (b) each section keeps its narrative prose + listed "keep" media; everything else wraps in `DeletedScenes`; (c) `LightboxGallery` `items` arrays keep **all** items either way so `?media=` deep links always resolve — only the visible thumbnails change.

| Section                               | Always visible                                                                                        | Fold into DeletedScenes (scenes count)                                 |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| HumbleBeginnings                      | Intro prose + first 2 media (ViewfinderFrame ones)                                                    | Existing "longer story" GC content + remaining 4 media (scenes: 5)     |
| GreenScreen                           | Intro prose + 3 media incl. the Pac-Attack still                                                      | "Why we never planned…" + remaining 6 media (scenes: 7)                |
| FeatureLength                         | Prose + FilmReel + 1 media                                                                            | "Two months of filming" retro + remaining 3 (scenes: 4)                |
| TakingItSeriously                     | Prose + 2 media                                                                                       | Flash-era stack essay + remaining 3 (scenes: 4)                        |
| MusicVideos                           | Prose + 2 media + **"An honest take on the music side" — PROMOTE to always-visible prose** (see §3.6) | Second GC + remaining 4 media (scenes: 5)                              |
| Animation                             | Prose + robot ScrubVideo + greenscreen slider + 2 media                                               | "Show all the VFX + BTS shots" grid + "film-making tricks" (scenes: 8) |
| Festivals                             | Prose + FilmReel + 4 media                                                                            | Remaining 9 media (scenes: 9)                                          |
| College                               | Prose + NODE ArchiveFrame + 4 media                                                                   | Both existing GCs + remaining ~15 media (scenes: 15)                   |
| Spunksters                            | Everything (SnapStrip is compact)                                                                     | nothing                                                                |
| WhatMakesUsHuman                      | Prose + hero media                                                                                    | Its existing GC content (scenes: 1)                                    |
| Freelancer                            | Prose + tabbed archive window + 2 media                                                               | "Full portfolio" content (scenes: 3)                                   |
| Entrepreneurship                      | Everything (tabbed window shrinks it)                                                                 | nothing                                                                |
| ShowAndTour, SideProjects, WhatImUpTo | Everything — Act III stays full-weight                                                                | nothing                                                                |

"First N media" = document order. If a specific image is directly referenced by adjacent prose, keep that one and drop the last of the "keep" list instead.

### 3.6 Editorial promotion

In `MusicVideos.svelte`, move the "An honest take on the music side" content out of its collapse into the visible narrative (trim to its best 2–3 paragraphs if long). Setbacks are story, not deleted scenes.

## 4. Act structure — `ChapterCard.svelte` (new)

One component, `{ act: 1 | 2 | 3 }`, three bespoke full-viewport designs. Shared behavior: full-bleed 100svh card inside a `PinScrub` (150vh for acts 2–3; 200vh for act 1's countdown); not a scrubber stop; ids `act-1`/`act-2`/`act-3`. Reduced motion: render the final static frame, no pin (plain 100svh section).

**Act 1 — "The Film Kid" (before HumbleBeginnings).** A film-leader countdown in MiniDV clothing:

- Full-viewport near-black. Center: the classic countdown — a large circle (~40svh diameter, 2px white ring) with rotating radial wipe (a conic-gradient whose angle maps to PinScrub progress within each number) and crosshair lines through center. A huge numeral counts 8 → 7 → … → 2 as progress goes 0 → 0.8 (equal steps; the wipe sweeps 360° per numeral).
- Frame it with `ViewfinderFrame` (corner brackets, REC dot, timecode). Timecode runs backwards during the countdown (cute: we're still rewinding into the past). Add subtle film grain/flicker: an overlay `opacity` jitter ≤0.06 via CSS animation, and 1–2 frames of fake dust (tiny white specks that appear for a single numeral).
- At progress 0.8–1.0: countdown snaps away (film-splice flash: one 80ms white frame) and the act title card shows — mono eyebrow `ACT I · 2006–2011`, display type `The Film Kid`, subline: "A couple of kids, one camcorder, and no idea what 'coverage' means."

**Act 2 — "The Pivot" (before College).** A film slate:

- Full-viewport. Center: a drawn clapperboard (CSS/SVG, no images): black board, white chalk-style hand lettering (use the mono font, slight rotate), fields filled in: `PROD: REAL LIFE` / `SCENE: FILM SCHOOL` / `TAKE: 2` / `DIRECTOR: B. SCHWABAUER` / `DATE: 2012`.
- The clapper arm (diagonal-striped bar) is open at progress < 0.5 and CLAPS shut at 0.5 (rotate from -18deg to 0 over ~80ms of progress, with a 1-frame white flash and a subtle 4px screen shake ≤150ms). After the clap, eyebrow `ACT II · 2012–2015`, title `The Pivot`, subline: "Film school, a senior thesis, and the slow realization that the tool he kept reaching for was a code editor."

**Act 3 — "The Builder" (before Freelancer).** A code editor, and the bridge line:

- Full-viewport `#0b0d12`. Center: a minimal editor window (reuse the ArchiveFrame chrome styling but with a file tab reading `act_3.md`), mono text **typing on** letter-by-letter mapped to PinScrub progress (not a timer), with a block cursor:

> "The medium changed. The job didn't.
> Storytelling became product thinking. Editing became iteration.
> Delighting an audience became delighting users.
> Same kid, new camera."

- After the last line (progress ≥ 0.85): eyebrow `ACT III · 2016–TODAY`, title `The Builder` fades in below the window.
- This is the §"bridge sentence" that pre-answers "why does a software engineer's site open with films" — it must land before Freelancer.

## 5. WhatImUpTo relocation — "Which brings us to now"

Move `<WhatImUpTo />` from position 2 to after `SideProjects` (see §1). Edits inside `WhatImUpTo.svelte`:

- The `id` may stay `what-im-up-to` or be renamed — just keep it in sync with the `stops` array.
- Retitle: `h2` becomes `Which brings us <span class="grad">to now</span>`. Add one sentence at the top of the lede, before the existing copy: "Twenty years of tapes, timelines, and terminals later — this is what all of it was pointed at."
- SectionShell `label` becomes `Which brings us to now`; `year` stays the current year.
- Change the `cta-ghost` link: `#showandtour` ("The longer story") no longer makes sense when the section sits _after_ ShowAndTour. Replace with `href="#creed"`, text `Why I build this way`.
- Everything else (Show&Tour lockup, screenshot, primary CTA) stays.

Also close the Rewind frame here: at the very top of the relocated section, add a small mono caption above the title (60% opacity): `⏵ PLAYBACK COMPLETE — YOU'RE ALL CAUGHT UP.` — the payoff of the cassette metaphor opened by `Rewind`.

## 6. Tabbed archive windows — `ArchiveTabs.svelte` (new primitive)

Generalizes `ArchiveFrame.svelte` (which stays for single-site usages, e.g. College's NODE viewer).

Props: `{ tabs: Array<{ title: string; src: string; host?: string; ratio?: string }>; label?: string }`.

**Chrome layout (real browser order):** tab strip on top → then the existing chrome row (traffic lights, lock, address pill, ARCHIVED pill) → stage. Reuse ArchiveFrame's exact colors/styles for the lower rows.

- **Tab strip:** trapezoid-ish tabs (border-radius top corners, 1px separators), mono 0.72rem. Each tab: a 14px favicon monogram (first letter of title in a 14px rounded square, per-tab hue rotated from a base accent) + title, ellipsized. Active tab: background matches chrome bar, full opacity, connected to the bar below (no bottom border). Inactive: 55% opacity, darker. Hover on inactive: opacity 0.8 (`transition-duration: 0s;` first).
- **Address pill** shows the active tab's host; the `ARCHIVED · {title}` pill shows the active title.
- **Loading behavior:**
  1. Initial state: no iframe anywhere. Stage shows ArchiveFrame's existing shimmer placeholder + `Load archived site` button (reuse those styles).
  2. First activation (placeholder button or the chrome `open-btn`): mount the active tab's iframe. Set `activated = true`.
  3. Once activated, clicking a tab mounts that tab's iframe if not yet visited and shows it. While an iframe hasn't fired `load`, show a spinner **inside its tab** (12px circle, replaces the favicon; the classic browser affordance).
  4. Visited tabs stay mounted — hide inactive ones with `display: none` wrapper? No: `display:none` can reset some embeds' state on some engines; use `visibility: hidden; position: absolute; inset: 0;` on inactive stage layers so switching back is instant and state (scroll position inside the archived site) survives.
  5. `open-btn` still toggles the whole stage closed (`Hide sites`) back to the placeholder; visited-tab set persists so reopening restores instantly.
- Stage `aspect-ratio`: per active tab (`ratio ?? '16 / 10'`), animate height change via the existing max-height/aspect technique or simply let it jump if all ratios are equal (they are, by default).
- Keyboard: tabs are buttons in a `role="tablist"`, arrow-key navigation, `aria-selected`.

**Usage:**

- `Freelancer.svelte`: replace its three `ArchiveFrame`s with one `ArchiveTabs` — tabs: Schwikes, Norton & Schmidt, SoundRaiser (same `src`/`host` values as the current frames, same order).
- `Entrepreneurship.svelte`: replace its two with one — tabs: Engagement Grower, Wyoti.
- Do NOT merge across sections. Reclaim the freed vertical space (delete any now-redundant intro sentences that introduced each frame separately; one short lead-in per window: Freelancer — "Three client sites, preserved exactly as they shipped:"; Entrepreneurship — "Both companies' sites, archived in amber:").

## 7. The Shipped Wall — `ShippedWall.svelte` (new section)

Position: after `Entrepreneurship`, before `EmptyYearMark 2018`. `id="shipped-wall"`. A full-bleed diagonal set piece for tall screenshots that are illegible in grids. Never folds.

**Intro band** (normal container width, above the wall): eyebrow `2015–2018`, heading `The wall of shipped screens`, standfirst: "Between client work and product experiments, a lot of pixels shipped. These are full-height captures — no scaling down, no cropping. Click any of them to inspect."

**Structure:**

- Wrap the wall in `PinScrub` with a 250vh scroll span; the pinned stage is 100svh, 100vw, `overflow: clip`.
- Inside the stage, a wrapper rotated `-12deg` and scaled `1.25` (so corners stay covered), containing **3 columns** (desktop) in a grid, `gap: clamp(12px, 2vw, 24px)`.
- Column contents (exact assets; URL = `https://cdn.brianschwabauer.com/media/` + filename; render at natural aspect with explicit `width`/`height` attributes as listed):

| Col | Direction                            | Assets (top→bottom)                                                                                                                                                                                                                                                                                                                                                               |
| --- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A   | scrolls **up**                       | `2016-01-01_engagement_grower_marketing_website-full_home_page.avif` (1907×7655)                                                                                                                                                                                                                                                                                                  |
| B   | scrolls **down**                     | `2015-08-13_blue_tape_estate_sales-website_redesign_mockup-home_page.avif` (874×2048) · `…-services_page.avif` (562×2048) · `…-sales_page.avif` (562×2048) · `…-contact_page.avif` (562×2048)                                                                                                                                                                                     |
| C   | scrolls **up**, ~0.75× col A's speed | `2018-01-01_bassless_ideas_website_design_v2.avif` (599×2048) · `2018-01-01_bassless_ideas_website_design_v1.avif` (933×2048) · `2018-01-01_tapkeep_v4-dashboard_phone_mockup-tasks_page-create_task–details.png` (1080×2352) · `2017-01-01_tapnotion_app_screenshot_home_page.avif` (375×812) plus 2 more `2017-01-01_tapnotion_app_screenshot_*` frames (375×812, pick any two) |

- **Motion:** each column gets `translate: 0 <y>` where `y = start_y + direction * travel * progress` (PinScrub progress 0→1), `travel = max(0, column_scroll_height - stage_height) * speed_factor` measured per column after images load (ResizeObserver). Up-columns start bottom-aligned and travel up; down-columns start top-aligned and travel down — every pixel of every capture passes through the viewport across the pin. Transform-only (compositor); `will-change: translate` on columns only while pinned.
- **Speed differential** is what sells the depth: A at 1.0×, B at 1.0× (opposite direction), C at 0.75×.
- **Edges:** the _stage_ (unrotated) gets `mask-image: linear-gradient(180deg, transparent, #000 8%, #000 92%, transparent)` so screenshots dissolve at top/bottom instead of guillotining.
- Screenshots styled as physical prints: `border-radius: 8px`, 1px `rgba(255,255,255,0.1)` border, heavy shadow (`0 30px 80px rgba(0,0,0,0.6)`).
- **Lightbox:** every image click opens straightened in a `LightboxGallery key="shipped-wall"` containing all wall items (captions = project name + page, e.g. "Blue Tape Estate Sales · services page"). The wall is the cinema; the lightbox is the inspection.
- **Loading:** `loading="lazy"`, `decoding="async"`, explicit dimensions (no layout shift). The 7655px-tall AVIF is ~large — give col A a plain skeleton shimmer until it decodes.
- **Mobile (<720px):** columns B and C only (drop A — a 1907px-wide capture at 375px is illegible anyway), rotation `-8deg`, pin span 200vh.
- **Reduced motion:** no pin; render a static, non-rotated 2-col masonry of the same images with the same lightbox.

## 8. Creed: the fourth tenet

In `Creed.svelte`:

1. **Opening copy:** the header currently reads "Everything on this page / comes down to three things." → change `three` to `four`. Scan the intro paragraph for other "three" references and update.
2. **New tenet 4**, appended after tenet 3 ("Do things that ~~don't~~ matter"), same `tenets` list structure (~90svh scene, statement + body, tenetDrift + reveal like the others):
   - **Statement:** `Nothing is ever final.`
   - **Body:** "Every project on this page was the 'final' version of something — right up until the next one. The kid with the camcorder became the kid with a copy of Flash became the guy with a compiler, and none of them were done. I will never write 'final' on a filename, and I mean that as a philosophy: the work continues, the tools change, the story keeps going."
   - **Visual gag** (this tenet's equivalent of tenet 1's fine print): below the body, a mono-font filename line that **rewrites itself** each time the tenet scene enters the viewport (IntersectionObserver, cycle one step per entry; type-on/backspace animation ≤600ms; reduced motion: instant swap): `homepage_final.svelte` → `homepage_final_v2.svelte` → `homepage_FINAL_final.svelte` → `homepage_FINAL_final_ACTUAL_v3.svelte` → (loop). Caption under it, fine-print size: "(see?)"
   - Accent color: reuse tenet 1's palette conventions; pick a hue not used by tenets 1–3 so the fourth scene reads distinct.
3. **Coda tweak:** the closing coda ("That's the whole page. That's the whole plan…") stays, but it no longer ends the page — the End/Credits follow. Remove any "bottom of the page" phrasing if present that would now be false.
4. **Move the confetti out:** delete the "bottom-of-page confetti cannons" `$effect` (currently `Creed.svelte` ~lines 537–584) — it relocates to `TheEnd.svelte` (§9.1). Keep the `confetti` import only if still used elsewhere in the file.

## 9. The ending sequence

### 9.1 `TheEnd.svelte` (new)

Full-viewport (100svh) black card after Creed. Center: **The End** in a script/italic display style (match era: classic film-title feel — if no script font is available, use the existing display serif/italic at ~clamp(4rem, 12vw, 9rem) with swash-like letter-spacing; do NOT add a font dependency without checking what's already loaded). Small mono line beneath, 50% opacity: `BRIAN SCHWABAUER · 2006 – ∞`.

**Confetti:** port the cannon `$effect` removed from Creed, retargeted: cannons run while ≥60% of this card is in the viewport and stop when it leaves (keep the same colors, 45°/135° corner-cannon geometry, and hysteresis pattern; anchor emitters to the card's top corners instead of the footer). Guard with `reducedMotion()` exactly as before. This preserves the current celebration feel Brian likes — it now fires at "The End" instead of the absolute page bottom, before the credits.

### 9.2 `Credits.svelte` (new)

`id="credits"`. A 100svh, full-bleed black section, `overflow: clip`. **Auto-rolling, not scroll-driven.** Page scroll is never hijacked — scrolling past is always possible and is the "skip" mechanism.

- **Roll:** the credits list is an absolutely-positioned column, centered, starting fully below the viewport. When ≥50% of the section is visible, a rAF loop translates it upward at **70 px/s** (time-based, not per-frame, so it's framerate-independent). Pause the loop entirely when the section leaves the viewport; resume where it left off on re-entry. When the last line exits the top, hold on a final centered `FIN` line (it stops and stays).
- **Fast-forward:** press-and-hold anywhere on the section (pointerdown → pointerup, mouse or touch) runs the roll at **5×**, with a small `▶▶` indicator appearing bottom-right while held. Label affordance: a persistent, quiet mono hint bottom-center, 40% opacity: `HOLD TO FAST-FORWARD · SCROLL TO SKIP`.
- **Crawl mode easter egg:** a small toggle button top-right of the section (mono, 1px border, 0.65rem): `☆ CRAWL MODE`. When on: the rolling container gets `perspective: 350px; transform: rotateX(24deg)` on a wrapper (transform-origin bottom center), text color switches to Star Wars yellow `#FFE81F`, roll speed drops to 50 px/s, and a one-line caption appears near the toggle: `(a long time ago, in a backyard far, far away — see also: star_wars_test, 2008)`. Toggle is not persisted. Keep text legible: bump font size ~15% in crawl mode.
- **Typography:** classic end-credits two-column grammar — role in small caps mono 0.7rem letter-spaced, 55% opacity, right-aligned in the left column; name in the display face ~1.05rem, left-aligned in the right column; single-column centered lines for headings/jokes/cards. Generous vertical rhythm (~1.6rem between entries, ~4rem before section headings).
- **Reduced motion:** no auto-roll — render the credits as a normal static scrollable text block (regular page flow), no pin, no crawl toggle.

**Credits content, in order** (verbatim; `[CONFIRM]` items ship as written and get flagged to Brian in review):

```
— single centered heading —        DELIVERING DELIGHT

Written, directed, and lived by    Brian Schwabauer

Executive producers                Mom & Dad
                                   (who taught me the value of hard work)

Starring                           Jordan, my lovely wife
                                   (whose overwhelming support means more to me than can be put into words)

Craft services                     also Jordan
                                   (the delightful-food department)

Co-producer                        Kevin Sikes
                                   (19 short films, zero budgets)

Boom operator                      Matthew Schwabauer, younger brother
                                   (always willing to tag along)

Filmed on location in              the backyard · the basement · Missouri State University · Texas · Kansas City

Shot on                            MiniDV · four GoPros · Canon 60D · Any camera I could find · Coffee

In loving memory of                Russell Sikes
                                   (whose encouragement was the fuel I needed when things were hard)
                                   [Link the name to the PUBLIC post /blog/loss-of-the-father — NOT the
                                    /admin/... URL. First verify that post is published (it may still be
                                    a draft from the legacy migration); if it isn't public, render the
                                    credit with no link and flag it to Brian so he can publish the post.]

In loving memory of                Adobe Flash, 1996–2020
                                   gone, but still loading… 87%

— centered card —                  This website was shot entirely on Svelte 5 and Cloudflare.
                                   Built by the director. View source: [GitHub repo URL
                                   from package.json/README]

— centered joke lines, spaced —    Based on a true story. All of it, unfortunately.
                                   No pixels were harmed in the making of this website.

— rating card —                    a bordered green MPAA-style card (rounded 2px border,
                                   ALL CAPS): "THE FOLLOWING LIFE HAS BEEN RATED D —
                                   DELIGHTFUL · SOME SCENES OF EXCESSIVE CRAFT"

— final centered line —            The director would like to thank YOU —
                                   for scrolling all twenty years.

FIN
```

### 9.3 `CreditsStinger.svelte` (new) — the post-credits scene

A ~70svh quiet black section after Credits. Plays **once per page load** when ≥50% visible (IntersectionObserver, unobserve after firing).

Sequence (total ~5s):

1. A thin "floor" line low in the frame with 6–10 static confetti scraps lying on it (small rotated rects in the confetti palette from TheEnd).
2. The hero mascot enters from the right at a walk (~2s). **Reuse the actual mascot artwork from `HeroMascot.svelte`** — extract its SVG/markup into a shared snippet or duplicate the drawing; it must be recognizably the same character (same shapes/colors). Give it a push-broom (simple SVG: angled handle + bristle block).
3. Two sweep passes: broom tilts, scraps it touches slide left ~40px and fade out (stagger per scrap).
4. Mascot exits left. Beat (~600ms). Title fades up, centered, display face: `BRIAN SCHWABAUER WILL RETURN` — sub-line, mono, 50% opacity: `in: whatever gets built next.`
5. The title stays (it's the true last thing on the page, above the site footer).

Reduced motion: skip the animation; show scraps + title immediately.

## 10. Implementation order (one commit each, current branch)

1. **Deleted-scenes core:** `FilmStrip.svelte` + `DeletedScenes.svelte`. Migrate the 9 existing GradientCollapse usages; delete `GradientCollapse.svelte` when unused.
2. **Fold inventory + editorial:** apply §3.5 gallery folds and the §3.6 promotion.
3. **Structure:** reorder `+page.svelte` (§1), relocate + reframe WhatImUpTo (§5), update `stops`.
4. **ChapterCards** ×3 (§4).
5. **ArchiveTabs** + Freelancer/Entrepreneurship migration (§6).
6. **ShippedWall** (§7) — including the R2 asset verification/upload from §0.8.
7. **Creed tenet 4** (§8).
8. **Ending sequence:** TheEnd + confetti move, Credits, CreditsStinger (§9).

Each phase ends with a browser pass (desktop + 375px). Phases are independent enough to review separately.

## 11. Acceptance checklist (verify all, in the browser)

- [ ] Every fold starts collapsed on a fresh load AND on refresh; opening one leaves the others closed; nothing is persisted anywhere.
- [ ] Section `#hash` ids, `?media=key&i=n` lightbox links, and the `stops` array are mutually consistent, and lightbox links resolve whether or not the fold above them is open (lightbox item arrays unchanged).
- [ ] YearScrubber stops match §1; scrolling and jumping still converge correctly (content-visibility interplay, `sectionNav.ts`).
- [ ] ArchiveTabs: nothing loads before first click; tab spinner shows while loading; visited tabs switch back instantly without reloading; keyboard/tablist works.
- [ ] ShippedWall: no horizontal page scroll, transform-only motion (verify no layout thrash in devtools performance), every capture fully traverses the viewport across the pin, lightbox opens straightened, mobile = 2 columns.
- [ ] Countdown, slate clap, and type-on all track scroll progress (scrub backwards works); reduced-motion renders static frames.
- [ ] Confetti fires at The End (and no longer at Creed/footer); credits auto-roll, pause off-screen, resume, hold-to-FF at 5×, crawl mode toggles, scrolling past always works; stinger plays once; `WILL RETURN` is the final beat.
- [ ] Creed says "four things"; tenet 4 present with the filename gag.
- [ ] Every new/edited `:hover` block starts with `transition-duration: 0s;` (grep the diff).
- [ ] Full `prefers-reduced-motion` pass: no pins, no auto-motion, content all reachable.
- [ ] 375px pass: film strips, tabs, wall, credits all usable.
- [ ] Russell Sikes credit: links to the PUBLIC blog post only if that post is published; otherwise unlinked and flagged.
