# Pond Water: Design

**Date:** 2026-11-27
**Status:** Kerem approved the look after watching a throwaway spike on the real pond ("nice"). He waived approving this spec and the plan, and decides on merging himself.
**Changes:** `2026-11-23-about-pond-design.md` §4 (drawing). The fish, their swimming, the lily pads and the click rings are unchanged.

## 1. Intent

Kerem: "the water mostly, sometimes they don't even look underwater". The fish are fine. Before this change the water was a still painting with the fish pasted on top: nothing from the water touched them. The pond should read as water that the fish swim *in*: calm and painterly, not photo-real.

## 2. Decided by Kerem (as seen in the spike)

- **Shimmer:** everything under the surface (the pond floor and the fish with their shadows and fins) wavers slowly, a few pond units, as if seen through moving water.
- **Light:** soft, drifting lines of sunlight (a wobbly net) over the floor and the fish, faint and warm-white.
- **Ripples bend:** a click ripple bends what is under its ring as it spreads, on top of the existing white rings.
- **Wakes:** a fish swimming fast leaves small, faint rings behind its head.
- **Strengths as in the spike:** shimmer 4.5 pond units, light 0.11, ripple bend 7 pond units; the light pattern scales and speeds as in the spike shader.
- **Unchanged:** the lily pads stay crisp and still, drawn above the water; the fish, swimming, click rings and pause button.

## 3. Decided by me (Claude), for Kerem to check

- **Night:** the painting stays a daytime picture at night, so the water looks the same at night.
- **Wake rule:** a fish faster than 95 pond units/s (cruising is 60–85, darting is faster), not away, leaves a ring every 0.14s. The ring's size is `min(0.4, 0.18 + (speed − 95) / 600)` of a click ripple's, and it lives 1/2.2 of a click ripple's life. It starts at the fish's head (centreline point 1). The rule is pure and tested, in `swim.ts`.
- **Edges:** the shimmer and light fade to nothing over the outer 40 pond units of the painted area, so the paper border never wavers or lights up.
- **Up to 24 ripples at once** (clicks and wakes together), the newest kept.
- **Precision:** the water shader uses high precision where the device has it. The time it is given wraps every hour, so long sessions don't lose precision on medium-precision devices; a tiny jump once an hour is accepted.
- **Cost:** one extra full-pond pass per frame. Shader setting locations are looked up once, not per draw.
- **Phones:** checked in a phone-sized headless run with the CPU slowed 4×. If it drops well below the current pond, wakes are thinned first.

## 4. Unchanged rules

- The pond runs only on screen, with the tab visible and not paused. Reduced motion, no WebGL or any failure leaves the still painting.
- Fish never draw over the paper border.
