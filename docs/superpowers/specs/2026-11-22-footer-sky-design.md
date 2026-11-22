# Footer Sky Background: Design

**Date:** 2026-11-22
**Status:** Kerem chose the image and asked for it to be built, with permission to merge and push. The layout details are Claude's calls; they weren't shown as mockups first.
**Replaces:** the look of `2026-11-21-footer-design.md` (the ink background and the flower band). Its content, links, copy behaviour and quality bar still apply.

## 1. Decided by Kerem

- The footer's background is his image `reference/674561874.png`: a retro computer (no logo: he painted it out) showing colour bars on a grassy hill under a blue sky (2730×1536).
- This is a deliberate exception to the foundation's "painterly everywhere" rule.

## 2. Layout (Claude's calls)

- **Content:** the same items in the same order, centred in the empty sky above the computer.
- **The image:** full width and anchored to the bottom. Above it the footer continues in the sky's own top colour, so longer copy grows the sky and never covers the computer.
- **Text line:** content always ends above 32% of the image's height (the computer starts at 45%).
- **Phones:** the image is never narrower than 900px and is centred. Up to 500px wide, a square centre crop is served, so the computer stays readable and the file stays small.
- **Fitting the screen:** up to 15% of the image (grass, and some hills at the sides) is cropped from the bottom when the screen is too short to show the whole footer. The computer is never cropped.
- **No bottom strip (Kerem, 2026-11-22):** no copyright, no "Back to top", nothing under the grass. The image is the end of the page.

## 3. Contrast

- All text is full cream, the eyebrow included (meadow fails on blue).
- `npm run art:footer` slightly deepens the upper sky, easing out by 60% of the height, so text reaches 4.5:1. The computer is masked out, and nothing below 60% is altered.

## 4. Art and quality bar

- The raw PNG stays private in `reference/`. Only the WebP masters in `src/assets/footer/` are committed.
- The image is decorative (`alt=""`), lazy and still.
- No horizontal scroll at 360px, CLS 0, Lighthouse mobile Performance ≥ 90 and the others ≥ 95.
