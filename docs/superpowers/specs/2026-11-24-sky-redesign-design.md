# Sky redesign: footer palette, Projects windows, Experience timeline

_Agreed with Kerem on 2026-11-24. Replaces the colour tokens in the foundation spec (§4.1), the look of the Projects cards and bouquets (`2026-11-21-projects-design.md`) and the Experience layout (`2026-11-21-experience-design.md`). Mockups: `.superpowers/brainstorm/1949-1795544569/content/palette.html` (option C) and `sections.html` (Projects A, Experience A)._

## 1. Why

Kerem likes the footer (the hilltop computer under a deep blue sky) more than anything else on the site: it looks high quality, the computer gives it character, and the sky, grass and flowers are fresh and saturated. The rest of the page is pale cream with soft greens and feels like a different, weaker site. Projects and Experience in particular read as "slop": white rounded cards, soft shadows and pill tags, the layout thousands of portfolios use. Experience's two-column grid also has uneven card heights, which look broken, especially with the bullet points expanded.

The goal: the whole page lives in the footer's world. It reads as one long sky that deepens as you scroll and runs straight into the footer. Projects gets a personality of its own from the footer's old computer.

## 2. Goals, non-goals, anti-goals

**Goals**
- One continuous sky behind the page, from almost cream under the hero to the footer's deep blue, with no seam at the footer.
- A palette taken from the footer picture, used for every colour on the page.
- Projects as classic '80s computer windows.
- Experience as one straight timeline: one column, nothing out of line, even with everything expanded.

**Non-goals (now)**
- A new hero picture. Kerem likes the idea of a sky hero that matches the footer, but it needs new art in the footer's 3D style, which he would supply. That is a later step; the current watercolour hero stays.
- Copy. All text is still placeholder.
- A photo of Kerem anywhere. He doesn't want his face on the site.

**Anti-goals (a failure even if it works)**
- The computer look spreading beyond Projects. Kerem explicitly doesn't want to "overdo the computer thing". The Experience timeline is clean and modern, not retro.
- Anything still looking like a generic template card.
- A visible seam or colour jump between the page's sky and the footer's sky.
- Text that fails WCAG AA anywhere on the gradient.
- Experience cards that end at different heights side by side.

## 3. The palette (sampled from `src/assets/footer/sky.webp`)

| Name | Hex | Use |
| --- | --- | --- |
| Deep sky | `#3A64AC` | The footer's top row (the existing `--color-footer-sky`); the sky's end colour; links and labels on pale sky |
| Sky | `#5D85C0` | Middle of the gradient |
| Light sky | `#82A7CD` | Gradient; screenshot placeholders |
| Haze | `#C9DBEB` / `#E3EDF7` | Upper gradient; hover tints |
| Cream | `#FBF7EE` | The sky's start colour (the hero fade target); text on deep blue |
| Night ink | `#15264A` | Body text and headings on pale sky; window outlines |
| Computer cream | `#ECE2CC` | Experience cards; window title bars |
| Paper | `#FFFDF8` | Window bodies |
| Grass / Deep grass / Lit grass | `#3D5A1A` / `#18210C` / `#8FAE3A` | Sparing accents only |
| Dandelion | `#DAAC17` | Rare highlight: the current job's timeline dot |
| Screen bars | `#FBF26E #7CEDF9 #7FED74 #EB71F6 #EA6251 #5369EE` | Tiny accents only, never areas; optional |

The meadow tokens (`meadow`, `meadow-deep`, `meadow-tint`, `poppy`, `cornflower`, `sky`, `ink`, `ink-soft`) are replaced; every use in `src/` moves to the new palette. Token names are the builder's call, but they should name the new colours.

## 4. The sky

- The page background below the hero is one vertical gradient: cream at the hero's bottom edge, then pale haze through About and Projects, deepening only slightly (roughly `#E3EDF7` → `#B9CFE6`, as in the mockup), then a quick deepening through the empty space between Projects' last card and Experience's heading, so Experience sits on a near-flat deep blue (no lighter than about `#4C76B7` behind any text, ending at exactly `#3A64AC` where the footer starts).
- **Why (my call, after a contrast check):** between roughly `#4C76B7` and `#6A8FC6` neither cream nor night ink reaches 4.5:1 for small text, so that band must only ever sit behind empty space. Night ink passes on everything from cream down to `#6A8FC6`; cream passes from `#4C76B7` down to `#3A64AC`.
- **Contrast must be predictable on every screen size.** Section heights differ a lot between phone and desktop, so the colour behind each section's text must not drift into a range where its text colour fails. Anchoring the gradient stops to the sections (each section owns its stretch of the gradient, and the stretches meet edge to edge) is the expected way; the exact technique is the builder's call.
- **Text colour by section:**
  - About and Projects: night ink on pale and mid sky.
  - Experience: cream. Its cards are computer cream with night-ink text.
  - Footer: unchanged.
  - The section label (eyebrow) is deep sky where that passes AA (on roughly `#E3EDF7` or lighter), otherwise night ink, and cream on deep blue. My call: it's small text, so it must pass 4.5:1 where it actually sits.
  - The hero's dark button (now `bg-ink`) becomes night ink.
- The hero picture and its copy are unchanged. Its bottom fade ends in the sky's start colour, which stays cream, so the fade needs at most a check.
- **Nav:** night ink on a pale haze bar is my call; it must stay readable over every part of the page it scrolls over, the footer included.
- **Focus outlines:** deep sky on pale backgrounds, cream on deep ones (the footer already uses cream).
- **Overscroll bounce:** the page's root colour should match what's next to it (cream at the top, deep sky at the bottom; the footer already handles the bottom).

## 5. About

- Layout, copy, the painting and its living koi pond stay as they are, recoloured to the new palette: tags and text in night ink and sky tones, no greens unless they read well.
- Kerem hasn't decided whether the watercolour painting and the pond fit the new sky. The default is to keep them; once the page is built, he looks and may ask for them to be removed. Don't remove them now.

## 6. Projects: classic windows

- **The corner bouquets go**: the images, `useCornerBouquets`, `sinkBy` and its tests, `art.ts`'s bouquet exports, `npm run art:projects` with its script, and the committed bouquet WebPs. The section's large bottom padding for them goes too.
- **Each card is an '80s computer window:**
  - **Title bar:**
    - Horizontal pinstripes in night ink on paper.
    - A small square close box at the left. It's decoration, not a button.
    - The project's short name in a monospace font, centred on a paper patch over the stripes. The slug (`hoi4-multiplayer`) is fine.
  - **Frame:** a 2px night-ink outline and square corners, with a flat offset shadow (about 5px right and down, night ink, no blur) instead of the soft blurred one.
  - **Body:** the screenshot (or the placeholder, now a haze-to-light-sky gradient) fills the window's width under the title bar. Below it, on paper:
    - the name;
    - the one-line summary;
    - the tags, as small rectangular outlined labels in the monospace font, not pills;
    - a footer row with "open source / closed source" and the open action.
- The grid stays as it is: `gridClass`, two columns on desktop, one on phones. Visible tags still use `visibleTags`, with its "+N".
- **Interaction:**
  - The whole window still opens the existing panel, and is keyboard focusable as now.
  - On hover and focus it may lift slightly, with the offset shadow growing. That must not move it with reduced motion.
- **The panel (native `<dialog>`) matches:**
  - the same title bar, which carries the dialog's real close button, at its usual place in the panel;
  - the night-ink outline, square corners and paper body;
  - its slide and fade behaviour unchanged.
- **Monospace font: my call.** Use a system monospace stack (`ui-monospace, 'Cascadia Mono', Consolas, monospace`), so no new font file. It's only used in Projects and for the Experience dates.

## 7. Experience: one straight timeline

- **One column, newest first:** Ihlas Holding (current) at the top, then by end date. That replaces the featured card and the two-column grid. Ordering by date rather than by "featured" is my call; the `experienceLogic` helpers adapt.
- **Desktop:**
  - The dates sit in a left column in the monospace font, right-aligned, in cream.
  - A thin cream line (partly transparent) runs down beside them, with a dot for each job. The current job's dot is dandelion yellow.
  - The cards are to the right, all the same width.
- **Cards:**
  - Computer cream with night-ink text, rounded corners kept small (about 10px), no blur shadow or only a faint one. The timeline is clean and modern, not retro.
  - Each card has the company, role, location / work mode, the "Now" marker for the current job, bullets, and tags.
  - Highlight numbers (~2.5M monthly visits, 13+ portals) stay inside their job's card. Placement is the builder's call, for example a small row of numbers at the card's top right, or above the bullets on phones.
- **Show more / show less** behaves as today, and the card grows downward. With every card expanded, the line, the dots and the dates stay aligned to their cards.
- **Phones:** the dates move above each card, and the line and dots run down the left edge. My call.
- The tags here use the same rectangular label style as Projects, on computer cream.

## 8. Unchanged

- The footer.
- The hero picture and copy.
- The Reveal behaviour.
- The section order and the nav behaviour.

## 9. Quality bar (from the foundation spec, restated)

- **Contrast:** WCAG AA for all text, measured on real rendered pixels: headless Chrome over CDP against `npm run preview`, at the usual set of sizes, phones included, with Experience expanded and collapsed. The gradient makes this the main risk.
- **Reduced motion:** no movement, fades only.
- **No layout shift** from the new styles.
- **The gate:** `npm test && npm run typecheck && npm run lint && npm run format:check && npm run build`.
- **Docs:**
  - `docs/PROGRESS.md` and CLAUDE.md's "Look" line are updated.
  - The Projects and Experience specs get a short note pointing here.
- **Review:** a fresh Opus review before merging, per the usual loop.

## 10. Left to the builder

- How the gradient is built and anchored (§4).
- Token names.
- Exact pinstripe density, shadow offsets and spacing.
- The hover lift.
- Where the highlight numbers sit inside the card.
- Whether a screen-bar stripe appears anywhere at all. It's optional, and at most one or two tiny uses.
