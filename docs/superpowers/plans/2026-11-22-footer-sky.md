# Footer Sky Background Plan

**Spec:** `docs/superpowers/specs/2026-11-22-footer-sky-design.md`

- [x] **Art:** rewrite `scripts/prepare-footer-art.mjs` to write `sky.webp` and the square `sky-phone.webp`; delete `band.webp`.
- [x] **Footer:** centre the content over the image, with the geometry in `index.css` (`.sky-footer`).
- [x] **Check in headless Chrome** at phone, tablet, laptop, 1080p, 1440p and ultrawide sizes:
  - no sideways scroll, no text over the computer, no seam at the top of the image;
  - measured contrast behind every piece of text ≥ 4.5:1;
  - focus rings and "Copy email" still work.
- [x] **Finish:** gate, Lighthouse, docs, fresh Opus review, merge, push (no `reference/` files).
