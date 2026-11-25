# Night mode

_Agreed with Kerem on 2026-11-25. Adds a night version of the whole page on top of the sky redesign (`2026-11-24-sky-redesign-design.md`) and the sky hero (`2026-11-24-sky-hero-design.md`). Mockup: `.superpowers/brainstorm/424-1795609734/content/night.html`, option C._

## 1. Why

Kerem wants a dark mode that is a **night version of the same world**:

- the hero's computer on its cloud under a starry sky;
- the footer's hilltop computer under the Milky Way;
- everything in between at night.

His idea: the TV lights up its surroundings. He made both night pictures, and they match the day ones shot for shot:

- `reference/hero-dark.png` (2730×1536) lines up pixel-for-pixel with `647386481.png` (checked 2026-11-25);
- `reference/footer-dark.png` (2730×1536) is the same hilltop framing as `674561874.png`.

## 2. Goals, non-goals, anti-goals

**Goals**

- Day and night versions of the whole page. A visitor's first view follows their device setting (`prefers-color-scheme`); a sun/moon button switches, and the choice is remembered on that device.
- The night hero keeps everything the day hero has: the cloud as its own layer in the same place, the same shy behaviour, and cream text that passes AA.
- The TV glows: a soft coloured light around the screen that moves with the cloud and flickers very gently.
- The in-between page follows option C, "night windows that glow".

**Non-goals**

- A third theme, or a schedule (night after sunset).
- New copy.
- Changing the day look.

**Anti-goals**

- A flash of the wrong theme on load.
- Downloading both themes' big pictures on every visit.
- A starless patch where the night cloud used to be.
- Glow that reads as neon, or flicker anyone could find uncomfortable.
- Any text below AA in either theme.

## 3. Switching

- **The theme lives on `<html>` as `data-theme="day" | "night"`.**
  - A tiny inline script in `index.html` sets it before first paint: the saved choice from `localStorage`, else `prefers-color-scheme`.
  - Every read or write of `localStorage` is wrapped in try/catch, and with no storage it simply follows the device.
- **While no choice is saved, the page follows the device live** (a `prefers-color-scheme` change listener). Once the visitor presses the button, their choice wins.
- **The button:**
  - in the nav, before the Résumé button, on desktop and phones;
  - a round icon button: a moon in day, a sun at night (`lucide-react`, which the project already uses);
  - `aria-label` says what it does ("Switch to night" / "Switch to day"), with `aria-pressed` not used;
  - styled for all three nav looks: transparent over the hero, the haze bar, and the phone menu.
- **The switch crossfades in about 400ms (my call):**
  - the hero and footer pictures fade between their day and night versions;
  - the colours transition;
  - with reduced motion, it's instant.
- **`<meta name="theme-color">`** follows the theme: cream by day, the night sky's dark navy at night.
- **Picture weight:** only the current theme's hero and footer pictures load on page load. The other theme's load when the visitor switches. The crossfade waits for the new picture, or fades as soon as it's ready.

## 4. The night hero

- **`npm run art:hero` also writes the night layers from `hero-dark.png`.** The pictures line up, so it reuses the day cut-out's alpha mask with the night picture's colours. The night cloud layer has exactly the same box as the day one, so `cloud-box.json`, the placement and the shy logic serve both.
- **The night background is refilled with real starfield, not a gradient.** It's copied from sky elsewhere in the same picture at similar heights, and blended over the same feathered area as the day refill, so moving the cloud right reveals stars and sky rather than a smooth patch. It must not reveal a duplicated, recognisable pattern next to its source. The Milky Way band, which crosses behind the computer's top, may be continued faintly or left out, whichever looks natural.
- **No deepening is needed if cream passes on the night sky already.** Measure; deepen only where it fails.
- **The TV glow:**
  - a soft radial light, centred on the screen (about 47% across and 22% down in the cloud layer's box), tinted with the screen's bar colours (a slight rainbow), blended with `mix-blend-mode: screen`, reaching roughly the cloud's top and the sky around the computer;
  - it's part of the cloud's moving element, so it travels and tilts with the shy cloud;
  - **the flicker:** a slow, irregular opacity change of a few percent, as an old CRT does. Never fast, never a strobe; well under 3 changes per second, with no large jumps;
  - with reduced motion the glow stays and the flicker stops;
  - night only; the day hero has no glow.
- The night portrait crop uses the same placement as day.

## 5. The night footer

- **`npm run art:footer` also writes `sky-night.webp` and `sky-night-phone.webp` from `footer-dark.png`,** with the same crops as day.
- The deepening step applies only if the night sky needs it for cream text (measure). The footer's solid colour above the image (`--color-footer-sky`) becomes the night picture's top colour at night, about `#060f21`, sampled by the script.

## 6. The page at night (option C)

- **Night tokens.** The exact hexes are left to the builder, sampled from the night art:
  - night sky stops: about `#1a2c46` under the hero, through `#142540` and `#0c1a33`, to the footer's top `#060f21`;
  - window and card navy: about `#0f1d36` and `#16284a`;
  - a pale outline: about `#c9dbeb`;
  - cream text;
  - a light sky blue for eyebrows and links, about `#9cc2f0`, whichever passes AA.

  The contrast test (`src/theme/palette.test.ts`) gains the night pairs.
- **The section gradients** (`.sky-about`, `.sky-projects`, `.sky-experience`) get night versions that meet edge to edge, from the hero's bottom fade (which fades into the night sky colour at night) down to the footer's night top.
  - Cream passes everywhere, so the day mode's contrast "gap" constraint doesn't apply at night.
  - The mid blues must still pass for any text placed on them.
- **Projects windows at night:**
  - a navy body, with pale (`#c9dbeb`) outline, pinstripes, close box and title patch;
  - cream text, with the tag labels in the pale outline colour;
  - the hard offset shadow becomes a faint glow in the TV's colours (each window may lean to a different bar colour);
  - the hover lift still works, with reduced motion respected;
  - the panel (`<dialog>`) follows: a navy body, cream text, pale borders.
- **Experience at night:**
  - night-blue cards with cream text;
  - the timeline line and dots stay cream, and the current job's dandelion dot glows softly;
  - tags and numbers use the pale and light-blue tokens.
- **About:**
  - text and tags recoloured for night;
  - the koi painting, its frame and the pond stay unchanged, a framed print on the night page. Kerem judges it after.
- **Focus rings stay visible on every night background,** with cream or light sky as needed.
- **The nav:**
  - transparent and cream over the hero, as by day;
  - once solid, a night haze bar (dark navy, translucent) with cream text;
  - the phone menu is a navy card.

## 7. Quality bar

- **Contrast:** AA on real pixels in **both** themes, with the existing checks rerun at night: the hero (26 sizes), the page's text (27 sizes, Experience collapsed and expanded), focus rings, and the timeline alignment.
- **No flash:** load with the device set to dark shows night from the first frame. Loading with a saved "day" on a dark device shows day from the first frame.
- **Picture loading:** a check that only the current theme's hero and footer pictures were requested on load.
- **The flicker:** its frequency and amplitude are checked as above, and it's off with reduced motion.
- **Behaviour:** the shy cloud works the same at night.
- **The gate,** and a fresh **Sonnet** reviewer before merging (Kerem: no Opus subagents).

## 8. Settled after the builder check (my calls, 2026-11-25)

1. **The night cloud reuses the day cut-out's alpha.**
   - A spike composited the night cloud, cut with the day mask, at its new place and showed no fringe or halo.
   - The refill technique the spike proved: a smooth per-row base interpolated from the blurred sky on either side of the hole, plus the *star detail* (picture minus its blur) taken from 1250px to the left on the same rows. It leaves stars, no seam, and the Milky Way fading out naturally.
   - Kerem judges the result in the browser.
2. **The CSS glow is a gentle addition, not a replacement.**
   - The refill replaces the light baked into the sky around the computer with plain sky.
   - The CSS glow brings some of that light back, travelling with the cloud.
   - Keep it subtle (its peak opacity well under the baked light's).
3. **The cloud becomes a wrapper element** (a `div` the size of the cloud's box) holding the cloud `<img>` and the glow.
   - `useCloudPlacement` and `useShyCloud` place and move the wrapper instead of the `<img>`; their logic and `cloud-box.json` don't change.
   - The glow may extend past the box. The hero's `overflow: clip` still bounds it.
4. **Only the current theme's pictures render.** The hero background, the cloud and the footer are chosen from the theme state, so the other theme's files are requested only on switching. During a crossfade both are in the DOM for a moment. Only the current theme's hero background gets `fetchPriority="high"`.
5. **On switching, the colours change at once and the pictures crossfade when the new one has loaded.**
6. **Night hero contrast:** measure first. If cream fails behind the copy, deepen the night sky there gently (dimming, not removing, the stars), like the day script's step 6.
7. **The starfield is judged by eye:** the builder's screenshots, then Kerem.
8. **The koi painting stays as it is,** frame included, until Kerem says otherwise.
9. **The share image and favicon stay day-only.**
10. **On phones, the theme button sits in the bar next to the Résumé and menu buttons** (the Résumé button is already in the bar). It comes before Résumé in both the focus order and the layout.

## 9. Left to the builder

- The night hexes (sampled), and token names.
- How the theme is expressed in CSS: a Tailwind `@custom-variant` such as `night`, overriding custom properties under `[data-theme=night]`, or both.
- The flicker's keyframes, within the limits above.
- How the inactive theme's pictures are kept from loading.
- The starfield fill technique.
- The button's icon size.
