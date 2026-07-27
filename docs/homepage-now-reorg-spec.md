# Home page "Now" reorg — implementation spec

Status: approved by Brian, 2026-07-27. This document is the single source of truth for this reorg. All quoted copy is final — implement it verbatim. Bracketed `[...]` notes inside copy blocks are instructions to the implementer, not copy to render.

This builds on the completed homepage-v2 work (`docs/homepage-v2-spec.md`, branch `homepage-v2`). Where the two documents disagree, **this one wins**.

## 0. Read this first (constraints & conventions)

1. **Load these skills before writing any code:** `delightful-ui`, `ui-anti-slop`, `css-authoring`, `delightstack`.
2. **Hover rule (repo CLAUDE.md, non-negotiable):** every CSS block whose selector contains `:hover` starts with `transition-duration: 0s;`.
3. Naming: `snake_case` variables/properties, `camelCase()` functions, `CAPS_CASE` consts. Plain CSS with native nesting. No new dependencies.
4. **Motion:** state commits instantly; animation is presentation only; everything respects `prefers-reduced-motion`. The bokeh field already has correct reduced-motion handling — preserve it when moving the code.
5. **Existing primitives are the toolkit** (`src/lib/components/about/primitives/`). New sections go in `src/lib/components/about/sections/`.
6. Every section uses `SectionShell` (which handles `content-visibility: auto` + intrinsic-size stamping).
7. **Broken external links are fine.** The site is live but unpromoted. Choose the best ids/keys/paths; do not preserve old hashes or `?media=` keys for compatibility. What must stay consistent is the page's _own_ wiring: section ids ↔ the `stops` array ↔ `sectionNav.ts` hash deep-linking ↔ `LightboxGallery` keys must all agree after the reorg.
8. **No gallery inside a fold** (standing rule from homepage-v2): `LightboxGallery` instances must not live inside collapsed/expandable UI.
9. No new media assets are required for this reorg — every image referenced already exists on the CDN and is already referenced by the components being moved. The delightstack block is deliberately typographic (no screenshots). The one exception is the **optional** family-photo slot in §5.6: build it, leave it empty, do not invent or source an image — Brian will add the asset himself.
10. Verify in the browser (Claude in Chrome / `/run`) at desktop and 375 px widths, plus a `prefers-reduced-motion` pass. Note: the automation tab is `document.hidden`, so rAF/IntersectionObserver-driven effects freeze — use real `computer` scrolls and expect scroll-driven visuals (bokeh parallax, YearCycler, YearMark wipe) to need manual scroll stepping to verify.
11. Commit to the **current branch** (`homepage-v2`), one commit per phase (§11). Never create a new branch.

## 1. What's changing (summary)

Today the page introduces Show&Tour twice (`ShowAndTour.svelte` and `WhatImUpTo.svelte` carry near-identical copy, lockup, and screenshot), files two 2024+ projects (markable.page, scrmbld.app) inside the 2017 Entrepreneurship chapter, and splits the present day across two sections. After this reorg:

- **`ShowAndTour.svelte`** becomes the **2019 origin chapter**: it introduces the company once, anchored in 2019, and inherits the bokeh background.
- **`YearCycler` 2020–2025** stays exactly as is — the time-lapse between origin and present.
- **A new `Now.svelte`** replaces both `SideProjects.svelte` and `WhatImUpTo.svelte`: giant "NOW" year-mark, a present-tense Show&Tour status (no re-introduction), a featured delightstack block, the side-project collection (markable, scrmbld, ghtui, Video Curator — built to grow), and a short text-only bridge into the Creed.
- **`Entrepreneurship.svelte`** loses the markable and scrmbld cards and becomes a tight 2016–2019 chapter.
- **`Rewind.svelte`** gets a tune-up (§7): new lede copy, a shorter/faster scrub, a much more dramatic scroll-driven background shift, a relabeled cassette, a "stop → play" ending, and a diegetic **fast-forward button** that jumps busy visitors straight to `#now`.
- **`ChapterCard` Act 1** (§8): the film leader tightens to 5-4-3-2 and is recast as _playback_ (forward-running timecode, PLAY indicator) so it stops reading as a second countdown after the rewind.
- **The Creed coda** (§9) gets a one-line copy swap — no structural or style changes.
- **`Now.svelte` also carries a short personal bio block** ("Off the clock", §5.6) — the page is the site's de-facto About page and currently never says who Brian is outside work.

**Tone guardrail for all copy:** nothing may read as "Show&Tour was 2019–2025 and now he's moved on." Show&Tour _and_ every side project are actively worked on today. The 2019 section speaks from the origin; the NOW section owns all present-tense claims (full-time, thousands of users, active roadmap).

## 2. New page order & wiring

`src/routes/+page.svelte` — the affected slice changes from:

```
ShowAndTour → YearCycler → SideProjects → WhatImUpTo → Creed
```

to:

```
ShowAndTour (↻ reworked, §3)
YearCycler 2020–2025 (unchanged)
Now (★ new, §5 — absorbs SideProjects + WhatImUpTo, both deleted)
Creed (unchanged)
```

Updated `stops` entries (the rest of the array is untouched):

```ts
{ id: 'showandtour', year: '2019', label: 'Show&Tour' },
{ id: 'now',         year: 'Now',  label: 'Now' },
```

Delete the `side-projects` and `Today` stop and the `what-im-up-to` stop. Remove the `SideProjects` and `WhatImUpTo` imports; add `Now`. Delete `SideProjects.svelte` and `WhatImUpTo.svelte` once `Now.svelte` has absorbed what it needs.

## 3. `ShowAndTour.svelte` — the 2019 origin chapter

### 3.1 Structural edits

- `YearMark`: `year="2019"`, **no subtitle**, keep `color="#00f2c3"`.
- Eyebrow: replace `CURRENT FOCUS · CO-FOUNDER` with exactly `CO-FOUNDER`.
- Replace the `.snt-bg` grid-lines div with the **bokeh field** (§4). The field spans the entire section (`position: absolute; inset: 0` inside the shell, same as the grid div it replaces), so the discs sit behind the lockup, the feature grid, and all three gallery blocks. Keep this section's existing `[data-theme='snt']` background gradient (the radial teal/violet glows may be removed if they fight the bokeh — implementer's judgment; the WhatImUpTo variant of the theme dropped them deliberately).
- Everything else (title lockup with logo, tagline, CTA, hero shot, six-bullet features, dashboard/delivery/brand galleries) stays as is.

### 3.2 Copy (verbatim)

Replace the two existing `.lede` paragraphs with these two:

> [Josh](https://joshmais.com) and I started Show&Tour in 2019. It's a project delivery platform for real estate photographers — beautiful property websites, branded delivery pages, smart invoicing, and a workflow built around how photographers actually work.

> Everything else on this page was practice for this. A decade of shipping other people's projects, a string of products that almost worked — and then the one that stuck.

[Keep the existing `joshmais.com` link markup on "Josh". Do **not** include "full-time", "thousands of users", or any "now" framing here — that all lives in §5.3.]

## 4. New primitive: `BokehField.svelte`

Extract the bokeh implementation from `WhatImUpTo.svelte` (the `BOKEH` array, the `.bokeh`/`.near`/`.grain` styles, the `twinkle`/`flicker` keyframes, the scroll-driven `shift` parallax effect, and the reduced-motion handling) into `src/lib/components/about/primitives/BokehField.svelte`. Preserve the existing code comments — they document non-obvious constraints (why scroll-driven instead of view timelines, why the rim gradient, why uneven keyframe offsets).

Props:

```ts
let {
	density = 1, // 1 = the full 17-disc field; 0.5 ≈ half the discs
	mask = 'radial-gradient(ellipse 70% 62% at 42% 50%, transparent, #000 88%)',
}: { density?: number; mask?: string } = $props();
```

- `density < 1` renders a deterministic subset of the hand-placed `BOKEH` array (e.g. every other disc, always keeping at least one `near` disc). Do not randomize — the placement is hand-tuned and must be stable across renders.
- `mask` lets each section keep copy legible its own way. The ShowAndTour section is tall with content throughout, so it should pass a gentler mask (e.g. `linear-gradient(#000, #000)` with per-disc opacity doing the work, or a vertical fade — implementer verifies legibility over the feature cards in the browser and adjusts).

Usage: `ShowAndTour` renders `<BokehField />` (full density); `Now` renders `<BokehField density={0.5} />` — same atmosphere six years later, deliberately sparser so the two teal sections read as one continuous era without being identical.

## 5. New section: `Now.svelte`

`SectionShell` props: `id="now"`, `year="Now"`, `label="Now"`, `theme="snt"` (shared with ShowAndTour — the continuity is the point). Contains, in order:

### 5.1 Opening beat

The playback line, moved verbatim from `WhatImUpTo` (it closes the cassette metaphor `Rewind` opens — keep its existing styles and the code comment):

> ⏵ Playback complete — you're all caught up.

### 5.2 The NOW mark

`<YearMark year="NOW" subtitle="All of it, actively" color="#00f2c3" />` — the same giant outlined-numeral treatment every year on the page gets, which is exactly why "NOW" in that style lands. (`YearMark` renders any string; verified. No `fringe`.)

### 5.3 Show&Tour, present tense

No logo lockup, no screenshot, no re-introduction — the 2019 chapter and its galleries are a scroll behind us. A compact block:

Heading (h2, section-title scale):

> Still building **Show&Tour.**

[Bold/accent the "Show&Tour." span in the section's teal.]

Body paragraph:

> Show&Tour is my full-time work, today and for the foreseeable future. Thousands of photographers deliver their projects through it, and the roadmap is longer than it has ever been. Six years in, it still gets the best hours of my day.

CTA row: keep the existing primary pill from `WhatImUpTo` ("Visit showandtour.com" with the arrow SVG). Drop the "Why I build this way" ghost CTA — its job moves to the closing beat (§5.6).

### 5.4 delightstack — featured block

A full-width featured block, visually heavier than the side-project cards below it. Deliberately typographic: the packages themselves are the artwork. No screenshots.

Eyebrow (mono, tracked, teal): `THE TOOLKIT`

Heading (h3, large):

> delightstack

Tagline (mono, teal): `A full-stack toolkit for building delightful apps on Cloudflare.`

Body:

> Twenty years of building things leaves you with opinions about how software should feel. Delightstack is where mine ended up: Svelte 5 components, edge-native auth, a reactive database on Durable Objects, real-time websockets, image processing, billing, AI — eleven packages designed to work together and usable on their own. It runs under this site, under my side projects, and under everything I start now.

Package grid — render all eleven as small chips/cells (mono type, `@delightstack/` prefix de-emphasized, package name emphasized), each with its one-line role. Data:

| package      | role                               |
| ------------ | ---------------------------------- |
| components   | Svelte 5 component library         |
| styles       | OKLCH design tokens & base CSS     |
| utilities    | shared utilities & DelightError    |
| editor       | rich-text block editor             |
| auth         | edge-native sessions & OAuth       |
| database     | reactive SQLite on Durable Objects |
| websocket    | real-time presence & messaging     |
| rate-limiter | sliding-window rate limiting       |
| images       | image processing & uploads         |
| ai           | embeddings, gateway, streaming     |
| stripe       | billing & metered usage            |

Link row (two links, same treatment as other external links in the section): `thedelight.co` → https://thedelight.co and `docs.thedelight.co` → https://docs.thedelight.co.

Design latitude: the block should feel like _infrastructure_ — a grid, a system — in contrast to the playful cards below. A subtle hover on each chip is welcome (remember the hover rule). Don't invent a fake terminal or fake code editor for it (ui-anti-slop).

### 5.5 Side projects

Sub-heading (h3) + lede:

> …and whatever else I feel like building.

> Nights, weekends, and the occasional all-consuming obsession. None of these are finished, because none of them are abandoned — this list only grows.

Then the collection. **Layout principle (per Brian): a plain grid is the baseline, and individual projects are allowed to break out of it.** The markup should make adding a future project a matter of adding one card. Current contents, in order:

1. **scrmbld.app — breakout, full-width.** Moves from `Entrepreneurship.svelte`. Keep the interactive `FlipText` split-flap board (including the `flapEggs` easter-egg words array) at generous size — it is the centerpiece of the collection and is _supposed_ to be bigger than everything else. Copy (edited from the original to drop "made for fun, not for money", which undercuts the framing):

   Card title: [scrmbld.app](https://scrmbld.app) — a daily word game in split-flap style

   > You're given 8 letters. One is a decoy. Unscramble the other 7 into the day's word. Letters animate on like a split-flap display — I spent a stupid amount of time hand-crafting the look and feel of that animation.

2. **markable.page — standard card.** Moves from `Entrepreneurship.svelte` with its copy and 5-image gallery intact (gallery may compress to a 2–3 image row inside the card, with the full set in the lightbox):

   Card title: [markable.page](https://markable.page) — a PDF planner builder for e-ink tablets

   > A planner builder that generates highly customizable PDFs with internal links, designed for devices like the reMarkable. Originally called "Remarkably Organized". Open-sourced. **200+ stars on GitHub.** Built with Svelte.
   >
   > [github.com/brianschwabauer/remarkably-organized](https://github.com/brianschwabauer/remarkably-organized)

3. **ghtui — standard card.** Moves from `SideProjects.svelte` unchanged: the terminal-chrome card (traffic-light dots, `~/projects/ghtui — bash` title bar), existing copy, GitHub link, and screen-recording image.

4. **Video Curator — standard card.** Moves from `SideProjects.svelte` unchanged: VIDEO TOOL tag, existing copy, GitHub link, both screenshots.

The three standard cards keep their per-project flavor (terminal chrome, video tag, planner photos) — variety within a consistent card frame, not four clones. Grid: 2-up at desktop, 1-up below ~900 px, with the scrmbld breakout spanning full width above or between rows (implementer's judgment on rhythm).

`LightboxGallery` keys: one gallery per card where needed, keyed `now-scrmbld` (n/a — FlipText, no lightbox), `now-markable`, `now-ghtui`, `now-video-curator`. Old keys (`side-projects`, `entrepreneurship-markable`) die with their sections — fine per §0.7.

### 5.6 Off the clock — the bio block

After the side projects, before the closing beat. This is the page's only who-is-he-outside-work moment, and it's the natural widening of the section's "all of it, actively" framing: the current projects include a treehouse and a renovation, not just software. Deliberately brief — one eyebrow, one paragraph, one optional photo. **Not** inside an `Expand`/fold or behind a "Learn more" — collapsing it would signal it's an appendix, and brevity is the containment strategy here.

Eyebrow (mono, tracked): `OFF THE CLOCK`

Body (verbatim):

> When I'm not shipping, I'm in Kansas City with my wife and our four kids — building them a treehouse, camping, out on a run, or halfway through the next DIY renovation. I play guitar and write songs. I 3D-print things we could've just bought. The projects don't stop when I close the laptop; they just change material.

[The last sentence deliberately hands off into the §5.7 bridge line — keep them adjacent.]

**Photo slot:** lay the block out to accommodate one optional photo beside or under the paragraph (a `LazyMedia`, styled consistently with the section — this would be the only non-screenshot photo in NOW, so give it a warmer, snapshot-like treatment, e.g. a simple rounded frame, no glow). Ship it **empty**: gate it on a `bio_photo` const that is `null`/commented at launch, with a clearly marked `TODO(brian): add family photo` and the expected shape (`src`/`width`/`height`/`alt`). Brian supplies the asset later; the block must look complete and intentional as text-only. No lightbox needed for this one.

### 5.7 Closing beat — the bridge to the Creed

A short, text-only beat at the end of the section (not a new `SectionShell` — it lives inside `Now.svelte`, styled as a quiet centered interstitial with generous vertical space; typographically closer to the playback line than to a heading):

> The projects keep changing. The way I build them doesn't.

Below it, a single ghost link (reuse the `cta-ghost` treatment + down-arrow SVG from the old `WhatImUpTo`): `Why I build this way` → `#creed`.

[With §5.6 in place this line now reads as spanning both work and life — that's intended.]

## 6. `Entrepreneurship.svelte` — trim to 2016–2019

- Delete the `markable` and `scrmbld` project cards, the `markableImages` array, the `entrepreneurship-markable` gallery, the `flapEggs` const, the `FlipText` import, and the `.splitflap` styles. (`flapEggs` and the splitflap sizing CSS move to `Now.svelte` with the board — port the `--flip-size` container-query sizing comment and technique as-is.)
- Remaining cards: Tower of the Americas, TapNotion, Engagement Grower, Wyoti. No copy changes.
- Check `sectionExtras` and any gallery index offsets still line up after the removals.

## 7. `Rewind.svelte` — faster, louder, and with an exit

The rewind stays (the cassette metaphor is the page's spine — the NOW playback line and the Credits both depend on it), but it gets five changes. The conceptual frame for §7 + §8 together: **rewind and playback are different transport modes on the same deck.** The Rewind is ◄◄; the Act-1 leader is ▶. Right now nothing marks the mode change, which is why they read as two countdowns.

### 7.1 New lede (verbatim)

Replace the current lede ("That's today. But none of it started with a company…") with:

> Twenty years of startups, apps, and videos. But it didn't start with any of that. It started with a miniDV camera, a bedroom wall painted green, and a friend named Kevin. **Keep scrolling to rewind twenty years.**

[This picks up the hero lede's "startups, apps, videos" list on purpose — the hero makes a claim, the rewind says "let me prove it, from the beginning." Keep the existing `<strong>` treatment on the last sentence. Eyebrow (`◄◄ Rewind the tape`) and title (`Where it all started.`) are unchanged.]

### 7.2 Faster scrub

Shorten the `PinScrub` from `260vh` to `~180vh`. **Keep the existing heavy `easeInOut` exactly as is** — the first and last years must still linger long enough to read; the shorter pin makes the middle years whip past even faster, which is the effect's personality. Tune in the browser: the whole rewind should feel like a flick, not a commitment.

### 7.3 Dramatic scroll-driven background shift

The section background must visibly change color as the tape rewinds — currently the static theme gradient reads as barely moving. Drive it from the scrub progress `p`: **cool indigo/blue at `p=0` (today) → distinctly warm amber/sepia at `p=1` (2006)** — rewinding into nostalgia. Implementation latitude (e.g. CSS vars set from `p` feeding gradient stops, or a cross-fading overlay pair — whatever composites cheaply), but the result must be unmistakable: someone watching the section scrub should _see_ the room change color. Copy legibility at both extremes; under reduced motion show the fully-rewound (warm) state to match the existing rewound-static behavior.

### 7.4 Relabel the cassette

`HUNKY SPUNKY PRODUCTIONS` is a payoff with no setup at this point in the page. New label text (SVG `label-text` / `label-sub`):

> EVERYTHING I'VE MADE
>
> TAPE 01 · 2006–TODAY

[The tape is the body of work, not the life — which is why it starts in 2006, not 1992. Adjust letter-spacing if needed to sit well in the 284-wide label rect; the new text is shorter than the old, so this should be easy.]

### 7.5 Stop → play ending

The existing `done` state (hubs turn green at 2006) gains a mode readout: when `done`, the eyebrow swaps from `◄◄ Rewind the tape` to `⏹ REWOUND TO 2006 · ▶ PLAY`. Same styling; a brief crossfade is fine. This is the section visibly _ending its gesture_ — the leader in §8 is then the tape starting, not another countdown.

### 7.6 The fast-forward button

A diegetic skip for visitors who want "what does he do now" without the twenty-year tour. Placement: in the pinned intro block, directly under the lede — the pin holds it on screen for the entire scrub, so it can be styled quietly and still be unmissable. **Balance (per Brian): quiet, but not hidden.** It must read as a pressable control at a glance:

- A real `<a href="#now">`, pill-shaped, hairline border, mono label: `►► FAST-FORWARD TO NOW`
- Section amber accent at ~75% strength, full strength + slight lift on hover (hover rule applies)
- Keyboard-focusable with a visible focus ring; NOT sticky/floating — one placement only
- Visually subordinate to the story (it must not read as the page's primary CTA), but larger than the eyebrow text — a control, not a footnote

Verify the jump lands correctly on `#now` (SectionShell intrinsic-size stamping + `sectionNav.ts` already handle deep jumps — confirm in browser).

## 8. `ChapterCard` Act 1 — the leader becomes playback

Three changes to the Act-1 scene in `ChapterCard.svelte`; Acts 2 and 3 are untouched. **Keep the `FilmGate` grain/wobble and the `ViewfinderFrame` treatment exactly as they are** (explicitly confirmed by Brian) — this is a recast, not a restyle.

1. **Tighten the leader:** `NUMERALS` becomes `[5, 4, 3, 2]`. The existing `COUNT_END`/`STEP` math adapts automatically. Shorten the Act-1 pin from `200vh` to `150vh` (matching the other acts) so the pacing matches the shorter count.
2. **Timecode runs forward.** `timecodeAt` currently runs backwards ("still rewinding into the past") — that is exactly the double-countdown feel being removed. Make it count **up from `00:00:00:00`** across the scrub (same format, same 30fps step feel). The tape is playing now.
3. **PLAY indicator.** Add a `▶ PLAY` mode label to the viewfinder OSD for Act 1 — period-correct camcorder playback UI. Check `ViewfinderFrame.svelte` for where the timecode/REC furniture lives and match its styling; if the frame needs a new optional prop (e.g. `mode`), add it without disturbing other usages.

The splice flash and title-card handoff ("Act I · The Film Kid") stay exactly as they are.

## 9. Creed coda — one-line swap

In `Creed.svelte` (§`.coda`), the current text ("That's the whole page. That's the whole plan…") is stale — it was written when the Creed was the bottom of the page, and it contradicts tenet IV directly above it. Replace the `coda-text` with (verbatim):

> Twenty years in, and the plan hasn't changed. I live to create. I work to delight.

Everything else — the hairline, the serif styling, the `— Brian` signature — stays exactly as is. [The second half is the hero's lede verbatim; the bookend is intentional, do not "improve" it.]

## 10. Verification checklist

1. `pnpm` build/typecheck passes; oxlint clean.
2. Browser pass (desktop + 375 px): scroll the full page. Confirm — bokeh renders and parallaxes across the whole 2019 section with copy legible everywhere; YearCycler unchanged; "NOW" renders correctly in the YearMark treatment at both widths (it's 3 characters vs 4 — check it doesn't look lost at the clamp sizes); scrmbld flip board works including easter-egg clicks; all four project cards' lightboxes open with correct `?media=` params; `#now` and `#showandtour` hash navigation land correctly (stops ↔ ids ↔ sectionNav); Entrepreneurship ends at Wyoti with no dangling gallery indices; the bio block looks complete and intentional with no photo.
3. Rewind/leader pass: the rewind completes in noticeably less scrolling with the first/last years still readable; the background shift from cool to warm is obvious while scrubbing; the cassette label reads `EVERYTHING I'VE MADE`; the eyebrow flips to the `⏹ … ▶ PLAY` readout at `done`; the fast-forward button is visible throughout the pin, reads as pressable, and lands on `#now`; Act 1 counts 5-4-3-2 with a forward-running timecode and a `▶ PLAY` OSD label, grain/wobble intact; Acts 2–3 unchanged.
4. `prefers-reduced-motion` pass: bokeh holds still (no twinkle, no parallax) in both sections; rewind shows the fully-rewound warm state; leader collapses to its static title card as before; page remains fully readable.
5. Grep the finished sections for the forbidden framings: no "full-time" in `ShowAndTour.svelte`, no re-introduction of what Show&Tour is in `Now.svelte`, nothing past-tense about Show&Tour anywhere.
6. Creed coda reads the new line; `The End` and `Credits` unchanged.

## 11. Phases / commits (one commit each, on `homepage-v2`)

1. **Extract `BokehField.svelte`** and swap `WhatImUpTo` to use it (pure refactor, page visually unchanged).
2. **Rework `ShowAndTour.svelte`**: year mark, eyebrow, copy, bokeh background (§3).
3. **Build `Now.svelte`** (§5, incl. the bio block) and wire it into `+page.svelte`; delete `SideProjects.svelte` + `WhatImUpTo.svelte`; update stops.
4. **Trim `Entrepreneurship.svelte`** (§6).
5. **Rework `Rewind.svelte` + Act-1 leader** (§7 + §8).
6. **Creed coda swap** (§9).
7. **Verification fixes** from §10, if any.
