/**
 * Wind sway shaders for the hero layers. The wind function and numbers are the
 * agreed "subtle" look (docs/superpowers/specs/2026-11-21-hero-design.md §5):
 * do not retune without Kerem's say-so.
 */

export const VERTEX_SHADER = /* glsl */ `
attribute vec2 position;
varying vec2 vScreen; // 0–1 across the hero, y pointing down

void main() {
  vScreen = vec2(position.x * 0.5 + 0.5, 0.5 - position.y * 0.5);
  gl_Position = vec4(position, 0.0, 1.0);
}
`

export const FRAGMENT_SHADER = /* glsl */ `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 vScreen;
uniform sampler2D tex;
uniform vec3 phase;     // wrapped wind phases from windPhases(t)
uniform float bend;     // layer bend strength, in fractions of the full art width
uniform float span;     // fraction of the full art this texture covers (1 = full layer)
uniform vec4 rect;      // texture rectangle in hero space: x, y, width, height (0–1)
uniform vec2 texClip;   // part of the texture to draw, 0–1

float wind(float x) {
  float g = 0.5 + 0.5 * sin(x * 2.4 - phase.x);    // broad gust rolling left to right
  g = g * g * g;
  float idle = sin(x * 9.0 + phase.y) * 0.22 + sin(x * 23.0 - phase.z) * 0.10;
  return g * 0.9 + idle * 0.4;
}

void main() {
  vec2 uv = (vScreen - rect.xy) / rect.zw;
  if (uv.x < texClip.x || uv.x > texClip.y || uv.y < 0.0 || uv.y > 1.0) {
    gl_FragColor = vec4(0.0);
    return;
  }
  float h = 1.0 - uv.y;                            // height above the layer's ground
  float dx = wind(vScreen.x + uv.y * 0.15) * h * h * bend / span;
  gl_FragColor = texture2D(tex, vec2(uv.x - dx, uv.y));
}
`

const TAU = Math.PI * 2

/**
 * The wind's three phases (t·0.55, t·1.25, t·2.05 rad), wrapped to one turn on the
 * CPU. A raw clock in the shader loses precision on mobile GPUs (fp16) and the sway
 * starts to judder after a minute or two.
 */
export function windPhases(t: number): [number, number, number] {
  return [(t * 0.55) % TAU, (t * 1.25) % TAU, (t * 2.05) % TAU]
}
