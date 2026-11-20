# Hero Section and Nav: Design

**Date:** 2026-11-21
**Status:** Agreed in conversation with Kerem. This builds on the foundation spec, `2026-11-20-portfolio-foundation-design.md`, which still governs anything not covered here.
**Mockups:**
- `.superpowers/brainstorm/39-1795204904/content/hero-mockup.html` (the final hero and nav)
- `sway-spike.html` in the same folder (the sway comparison)

---

## 1. Intent

The first screen should feel like standing in a painted meadow while a light wind passes through. The words stay plain and specific: who Kerem is and what he builds. The motion is the "craft" signal, and it must stay **very subtle and never overdone**.

## 2. Decisions made by Kerem

- **Sway technique: WebGL** (option B). A shader bends each art layer by height, so heads move more than stems and roots stay still, and a soft gust wave rolls left to right. CSS whole-stem leaning (option A) was rejected.
- **No availability pill.**
- **Buttons:** "See my work" (primary) → `#projects` and "Get in touch" (secondary) → `#contact`. **Résumé lives only in the nav.**
- **Headline:** keep the placeholder "Rooted in the back end. Blooming on the front." Kerem rewrites all copy at the end.
- **Text alignment:** left, as mocked. Centred was offered and not chosen.
- **Nav behaviour:** Claude's proposal, accepted after seeing it in the mockup (§6).

## 3. Art: the five layers

The source files are `reference/hero/1.png` to `5.png`. Each is 2730×1536 (16:9), and stacked they rebuild the meadow exactly.

| Order (back → front) | File | Content | Bend strength |
|---|---|---|---|
| 1 | `4.png` (opaque) | Sky, clouds, hills, grass | 0 (never moves) |
| 2 | `3.png` | Mid-distance meadow flowers | 0.006 |
| 3 | `5.png` | Tall single stems (left group and right group) | 0.016 |
| 4 | `2.png` | Left foreground cluster | 0.011 |
| 5 | `1.png` | Right foreground cluster | 0.011 |

**Pipeline (Claude's call):**
- Convert the PNGs once to high-quality WebP masters (q≈92, full 2730 width) in `src/assets/hero/`. The raw PNGs total about 30 MB and stay in the git-ignored `reference/`.
- `vite-imagetools` builds WebP variants at q≈80. There's no AVIF, because these images are used as WebGL textures and WebP is enough.
- **Wide screens** use full layers at **1280, 1920 or 2730** px wide. The pick is the smallest variant at least as wide as the layer's drawn width in device pixels (DPR capped at 2), or the largest variant otherwise.
- **Phones** use **crops** (added after the builder check).
  - On a phone the layers are drawn far larger than the screen and only a slice is visible. For example, on a 390×844 phone about 26% of the background and about 36% of each edge cluster.
  - Full-resolution layers total about 1.7 MB (measured). The 1280 set is about 0.6 MB but visibly soft on phones.
  - So each narrow-layout layer also gets a **45%-wide crop of exactly the part phones can see**, at 1920-equivalent resolution (864×1080):
    - background and `3.png`: the centre (x 0.275–0.725)
    - `2.png` and the left half of `5.png`: the left (x 0–0.45)
    - `1.png` and the right half of `5.png`: the right (x 0.55–1)
  - A crop is used only when it fully covers that layer's visible part, which holds for portrait phones down to about 360×640. Otherwise the full layer is used (portrait tablets, for example).
  - Target: a phone downloads **≤ ~800 KB** of hero art, with the background crop **≤ ~100 KB**.

## 4. Layout

**Hero box**
- Full viewport height (`100svh`), with a minimum height so the copy is never clipped at **360×640** or **1280×720**.
- The nav overlays the hero.

**Layer placement** (one pure function feeds both the static images and the shader):
- **Wide** (hero width ÷ height ≥ 1.2):
  - Every layer is a 16:9 rectangle that covers the hero, anchored **bottom-centre**.
  - On ultra-wide screens the sky is cropped at the top; the flowers are never cropped at the bottom.
- **Narrow** (ratio < 1.2: phones, portrait tablets):
  - The background still covers, anchored bottom-centre.
  - Foreground layers are scaled to **0.72×** the cover size and anchored at the bottom.
  - `3.png` is centred.
  - `2.png` is pinned to the **left** edge and `1.png` to the **right** edge.
  - `5.png` is drawn twice: its left half (x 0–0.5) pinned left and its right half (x 0.5–1) pinned right.
  - The result: flowers frame both bottom corners and the sky stays full-size.

**Copy block**
- **Wide:** left-aligned, starting about 7% from the left edge, with its top about 22% down the hero. Max width about 58% of the hero.
- **Narrow:** 18–24px side gutters, top about 16% down.
- **Headline** (`h1`): Inter Tight 600, letter-spacing −0.045em, line-height about 0.98. About 36px at 360px wide, growing fluidly to about 88–92px at 1440px. Ink colour.
- **Sub line:** Inter about 1.05–1.15rem, `ink-soft`, max about 44ch. "I'm Kerem, a full-stack engineer finishing my Software Engineering degree in Istanbul. I build with .NET, React and TypeScript."
- **Buttons:**
  - "See my work": pill, `ink` background, `cream` text.
  - "Get in touch": pill, 62% white background, thin ink border at 22% opacity.
  - Both show the cornflower focus ring.
- **Legibility wash** behind the copy:
  - Wide: a cream radial gradient, ellipse about 60%×55% centred at about (28%, 38%), from 78% opacity to 0.
  - Narrow: a top-to-bottom cream linear gradient, 75% → 45% at 45% height → 0 at 65%.
  - The wash is decoration; the text must meet AA contrast on the worst part of the art behind it.

## 5. Motion (WebGL)

- **Shader:** one full-screen quad per layer, drawn back to front with premultiplied alpha. For each pixel:
  - `uv` = the pixel's position inside that layer's placement rectangle. Anything outside the rectangle, or outside the layer's x-clip range, is transparent.
  - `h = 1 − uv.y` (height above the layer's bottom edge), and `bend = h²`.
  - `dx = wind(screenX + uv.y·0.15, t) · bend · bendStrength`, then sample the texture at `(uv.x − dx, uv.y)`.
  - The wind function, as mocked:
    ```glsl
    g = 0.5 + 0.5*sin(x*2.4 - t*0.55); g = g*g*g;
    idle = sin(x*9.0 + t*1.25)*0.22 + sin(x*23.0 - t*2.05)*0.10;
    wind = g*0.9 + idle*0.4;
    ```
  - These numbers are the agreed "subtle" look, and they're tuned only with Kerem's say-so.
- **Static first:** the layers render as plain `<img>` elements, placed by the same function. They are decorative (`alt=""`).
- **Load order (decided by Kerem: "fade them in"):**
  - The background loads first with high fetch priority, so it's the fast first paint.
  - Flower layers start loading only after the background has loaded. Each one fades in (opacity 0 → 1, about 500–600ms, ease-out) as it arrives, so the meadow "blooms" in.
  - A layer that's already loaded when the hero appears (a cached visit) shows instantly with no fade.
  - With `prefers-reduced-motion`, layers appear without fading.
- **Canvas on top:** the WebGL canvas takes over (crossfading in ~400ms) only once **all** layers have loaded and its first frame is drawn. Until then the static images are what's on screen. It reuses the already-loaded `<img>` elements as textures, so nothing downloads twice.
- **Fallbacks:** the canvas is never created when:
  - `prefers-reduced-motion: reduce` is set, or
  - WebGL is unavailable, or
  - the context is lost.
  - In those cases the static layers stay, and the page looks complete and correct without motion.
- **Running cost:**
  - The animation loop runs only while the hero is on screen and the tab is visible.
  - Device pixel ratio is capped at 2.
  - The canvas is resized to the hero, never larger.

## 6. Nav (replaces the scaffold nav)

**Position and look**
- Fixed at the top, about 64px tall, overlaying the hero.
- Contents: the name (links to the top), section links, and the Résumé pill button (download, with icon).
- **Transparent** when the page is scrolled to the very top.
- **Solid** (cream at 82% opacity, 10px backdrop blur, 1px soft bottom line) as soon as the page scrolls more than ~24px. That keeps the links readable over the flowers.

**Hiding and showing**
- **Hides** (slides up) while scrolling **down**, but only once the page is past the hero.
- **Shows** again on any scroll **up**.
- Never hides while the phone menu is open or while focus is inside the nav.
- With reduced motion it still hides and shows, just without the slide.

**Phone (< 640px)**
- Shows the name, the Résumé pill and a **menu button** (`aria-expanded`, `aria-controls`).
- The menu opens a cream card under the nav with the four section links (large tap targets).
- It closes on: a link tap, Escape, a tap outside, or the button again.

**Desktop**
- About · Projects · Experience · Contact, built from the existing `SECTIONS` list.

## 7. Open Graph image

A **1200×630 crop of the composed meadow** (all five layers flattened), with no text, at `public/og-image.jpg`.
- `og:image` and `twitter:image` point to it as absolute URLs via `VITE_SITE_URL`.
- `twitter:card` becomes `summary_large_image`.

This closes the foundation spec's deferred og:image item.

## 8. Quality bar for this section

- **Lighthouse (mobile):** keep the foundation targets (Performance ≥ 90; Accessibility, Best Practices and SEO ≥ 95) with the hero in place.
- **Screen sizes:**
  - No horizontal scroll at 360px.
  - The copy is never overlapped by the nav and never clipped at 360×640, 390×844, 768×1024, 1280×720 or 1440×900.
- **Keyboard:** reaches the menu button, the menu links and both buttons, with visible focus. The menu traps nothing and closes on Escape.
- **Unit tests (Vitest):** this section brings in the first real logic, so it gets unit tests:
  - the layer-placement function (wide, narrow, ultra-wide and the boundary at 1.2), including crop sub-rectangles,
  - source selection: variant width, and crop vs full layer (a crop only when it covers the visible part),
  - the nav state transitions (solid, hidden, shown, never hidden with the menu open or focus inside).

## 9. Left to the builder

- Component and file names.
- How the shader program is organised.
- The exact clamp values within the ranges above.
- Easing curves.
- The minimum hero height.
- Whether the nav state logic is a hook or a small store.
