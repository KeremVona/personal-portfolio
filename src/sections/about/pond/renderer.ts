/**
 * Draws the About pond with WebGL1. Into a scene texture: the painted-out pond, each
 * koi's shadow, its side fins and its body bent along its centreline as one triangle
 * strip (so nothing overlaps and no seams show). Then that scene through moving
 * water (shimmer, light, ripples bending it), then the lily pads on top, then the
 * ripple rings.
 * See docs/superpowers/specs/2026-11-23-about-pond-design.md §4 and
 * 2026-11-27-pond-water-design.md.
 */
import { POND_BOX, POND_VIEW, type Fish, type Point } from './swim'

export interface PondArt {
  pond: HTMLImageElement
  pads: HTMLImageElement
  bodies: HTMLImageElement[]
  shadows: HTMLImageElement[]
}
export interface Ripple {
  at: Point
  age: number
  /** The ring's size as a share of a click ripple's (a click is 1). */
  size?: number
  /** How much faster than a click ripple it spreads and fades (a click is 1). */
  pace?: number
}
export interface PondRenderer {
  resize(cssWidth: number, cssHeight: number, dpr: number): void
  draw(fishes: readonly Fish[], ripples: readonly Ripple[], time: number): void
  destroy(): void
}

const SHADOW_ALPHA = 0.55
/** Clicks and wakes together; the newest are kept. */
export const MAX_RIPPLES = 24
export const RIPPLE_LIFE = 1.8
export const rippleDone = (r: Ripple) => r.age * (r.pace ?? 1) > RIPPLE_LIFE
const isWake = (r: Ripple) => (r.size ?? 1) < 1

/**
 * Adds a ripple, oldest first, keeping at most MAX_RIPPLES. A full pond skips a new
 * wake; a click makes room by dropping the oldest wake (or the oldest ripple).
 */
export function addRipple(ripples: Ripple[], ripple: Ripple) {
  if (ripples.length >= MAX_RIPPLES) {
    if (isWake(ripple)) return
    const oldest = ripples.findIndex(isWake)
    ripples.splice(Math.max(0, oldest), 1)
  }
  ripples.push(ripple)
}

// The water's look, agreed with Kerem; distances in pond units (the painting is 1200 wide).
const WATER = {
  swell: 4.5, // how far the shimmer shifts what's under the water
  light: 0.11, // how bright the drifting light patterns are
  ripple: 7, // how far a click ripple bends what's under it
}

// The pond and fish, drawn into a texture first, shown through moving water.
const WATER_SHADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D u_scene;
uniform vec2 u_res;
uniform vec4 u_view;
uniform vec4 u_box;
uniform float u_time;
uniform vec3 u_water;
uniform vec4 u_ripples[${MAX_RIPPLES}];
varying vec2 v_pos;

vec2 swell(vec2 p, float t) {
  return vec2(
    sin(p.y * 0.021 + t * 0.9) + 0.6 * sin((p.x + p.y) * 0.013 - t * 0.7),
    cos(p.x * 0.019 + t * 0.8) + 0.6 * sin((p.x - p.y) * 0.011 + t * 0.6)) / 1.6;
}
// A wobbly net of soft light lines: the contours of a warped grid, two layers.
float net(vec2 q, float t) {
  q += 0.8 * vec2(sin(q.y * 0.9 + t * 0.4), cos(q.x * 0.8 - t * 0.35));
  return 1.0 - smoothstep(0.0, 0.55, abs(sin(q.x) + sin(q.y)));
}
float light(vec2 p, float t) {
  float a = net(p * 0.016, t);
  float b = net(mat2(0.8, -0.6, 0.6, 0.8) * p * 0.023 + 3.0, t * 1.3);
  return max(a, b) * (0.6 + 0.4 * sin(p.x * 0.004 + p.y * 0.003 + t * 0.2));
}

void main() {
  vec2 p = v_pos;
  float edge = min(min(p.x - u_box.x, u_box.x + u_box.z - p.x),
                   min(p.y - u_box.y, u_box.y + u_box.w - p.y));
  float inside = smoothstep(0.0, 40.0, edge);
  vec2 d = swell(p, u_time) * u_water.x;
  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    vec4 r = u_ripples[i];
    if (r.z < 0.0) continue;
    vec2 off = p - r.xy;
    float dist = length(vec2(off.x, off.y / 0.8)) + 0.001;
    float radius = (12.0 + r.z * 150.0) * r.w;
    float band = (dist - radius) / (10.0 * r.w + 4.0);
    float wave = sin(band * 2.5) * exp(-band * band);
    d += off / dist * wave * u_water.z * r.w * max(0.0, 1.0 - r.z / 1.4);
  }
  vec2 uv = gl_FragCoord.xy / u_res + vec2(d.x / u_view.z, -d.y / u_view.w) * inside;
  vec3 colour = texture2D(u_scene, uv).rgb;
  colour += vec3(1.0, 0.98, 0.9) * light(p + d * 3.0, u_time) * u_water.y * inside;
  gl_FragColor = vec4(colour, 1.0);
}`

// Pond units → clip space; y points down in the pond and up in clip space.
const VERTEX = `
attribute vec2 a_pos;
attribute vec2 a_uv;
uniform vec4 u_view;
varying vec2 v_uv;
varying vec2 v_pos;
void main() {
  vec2 p = (a_pos - u_view.xy) / u_view.zw * 2.0 - 1.0;
  gl_Position = vec4(p.x, -p.y, 0.0, 1.0);
  v_uv = a_uv;
  v_pos = a_pos;
}`

const TEXTURED = `
precision mediump float;
uniform sampler2D u_tex;
uniform float u_alpha;
varying vec2 v_uv;
void main() { gl_FragColor = texture2D(u_tex, v_uv) * u_alpha; }`

// A side fin in its own 0–1 box: x runs from the body outwards along the fin,
// y from the fin's root edge to its tip edge. Pale peach, fading towards the tip.
const FIN = `
precision mediump float;
varying vec2 v_uv;
void main() {
  float x = v_uv.x;
  float edge = 0.92 * pow(sin(3.14159 * clamp(x, 0.0, 1.0)), 0.75);
  float inside = smoothstep(edge, edge - 0.14, v_uv.y) * smoothstep(0.0, 0.06, x);
  float a = mix(0.9, 0.1, x) * inside;
  vec3 colour = mix(vec3(1.0, 0.77, 0.59), vec3(0.99, 0.84, 0.73), x);
  gl_FragColor = vec4(colour * a, a);
}`

// Up to MAX_RIPPLES rings, each three soft circles spreading out, slightly squashed.
const RIPPLES = `
precision mediump float;
uniform vec4 u_ripples[${MAX_RIPPLES}];
uniform float u_px;
varying vec2 v_pos;
void main() {
  float a = 0.0;
  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    vec4 r = u_ripples[i];
    if (r.z < 0.0) continue;
    vec2 d = v_pos - r.xy;
    float dist = length(vec2(d.x, d.y / 0.8));
    for (int k = 0; k < 3; k++) {
      float age = r.z - float(k) * 0.16;
      if (age < 0.0 || age > 1.4) continue;
      float radius = (12.0 + age * 150.0) * r.w;
      float width = (5.0 - float(k)) * 0.5 * r.w + u_px;
      float ring = 1.0 - smoothstep(width - u_px, width + u_px, abs(dist - radius));
      a = max(a, ring * 0.5 * r.w * (1.0 - age / 1.4));
    }
  }
  gl_FragColor = vec4(vec3(0.94, 0.99, 0.96) * a, a);
}`

const STRIP_FLOATS = 4 // x, y, u, v

function compile(
  gl: WebGLRenderingContext,
  fragment: string,
): WebGLProgram | null {
  const program = gl.createProgram()
  for (const [type, source] of [
    [gl.VERTEX_SHADER, VERTEX],
    [gl.FRAGMENT_SHADER, fragment],
  ] as const) {
    const shader = gl.createShader(type)
    if (!shader || !program) return null
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null
    gl.attachShader(program, shader)
  }
  if (!program) return null
  gl.bindAttribLocation(program, 0, 'a_pos')
  gl.bindAttribLocation(program, 1, 'a_uv')
  gl.linkProgram(program)
  return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null
}

function texture(
  gl: WebGLRenderingContext,
  image: HTMLImageElement,
): WebGLTexture | null {
  const t = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, t)
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  return t
}

/**
 * The body as a triangle strip: two vertices per centreline point, across the body.
 * Sprites run tail (u = 0) to head (u = 1); the centreline runs head to tail.
 */
export function stripVertices(
  line: readonly Point[],
  halfHeight: number,
  offset: Point = { x: 0, y: 0 },
  out = new Float32Array(line.length * 2 * STRIP_FLOATS),
): Float32Array {
  const last = line.length - 1
  line.forEach((p, i) => {
    const a = line[Math.max(0, i - 1)]
    const b = line[Math.min(last, i + 1)]
    const l = Math.hypot(a.x - b.x, a.y - b.y) || 1
    // The normal of the tail → head direction; row 0 of the sprite is on its negative side.
    const nx = -(a.y - b.y) / l
    const ny = (a.x - b.x) / l
    const u = 1 - i / last
    const k = i * 2 * STRIP_FLOATS
    out.set(
      [
        p.x + offset.x - nx * halfHeight,
        p.y + offset.y - ny * halfHeight,
        u,
        0,
      ],
      k,
    )
    out.set(
      [
        p.x + offset.x + nx * halfHeight,
        p.y + offset.y + ny * halfHeight,
        u,
        1,
      ],
      k + STRIP_FLOATS,
    )
  })
  return out
}

const smooth = (a: number, b: number, v: number) => {
  const t = Math.max(0, Math.min(1, (v - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** The two side fins as quads (x, y, u, v ×4 each): spread when slow, folded back when fast. */
function finQuads(fish: Fish, out: Float32Array) {
  const L = fish.length
  const n = fish.line.length - 1
  const at = fish.line[Math.round(n * 0.27)]
  const next = fish.line[Math.round(n * 0.27) + 1]
  const angle = Math.atan2(at.y - next.y, at.x - next.x)
  const fast = smooth(70, 260, fish.speed)
  ;[-1, 1].forEach((side, f) => {
    const spread =
      (1.15 -
        0.85 * fast +
        Math.sin(fish.phase * 0.5 + side) * 0.18 * (1 - fast)) *
      side
    const ox = at.x + Math.cos(angle + (side * Math.PI) / 2) * L * 0.075
    const oy = at.y + Math.sin(angle + (side * Math.PI) / 2) * L * 0.075
    const turn = angle + Math.PI - spread * 0.95
    const along = { x: Math.cos(turn), y: Math.sin(turn) }
    const across = { x: -along.y * side, y: along.x * side }
    const corner = (x: number, y: number, u: number, v: number, k: number) =>
      out.set(
        [
          ox + along.x * x + across.x * y,
          oy + along.y * x + across.y * y,
          u,
          v,
        ],
        (f * 4 + k) * STRIP_FLOATS,
      )
    const length = L * 0.19
    const width = L * 0.11
    corner(0, -L * 0.01, 0, 0, 0)
    corner(0, width, 0, 1, 1)
    corner(length, -L * 0.01, 1, 0, 2)
    corner(length, width, 1, 1, 3)
  })
}

export function createPondRenderer(
  canvas: HTMLCanvasElement,
  art: PondArt,
  onLost: () => void,
): PondRenderer | null {
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: true,
    premultipliedAlpha: true,
  })
  if (!gl) return null
  const textured = compile(gl, TEXTURED)
  const fins = compile(gl, FIN)
  const rings = compile(gl, RIPPLES)
  const water = compile(gl, WATER_SHADER)
  if (!textured || !fins || !rings || !water) return null
  const sceneTexture = gl.createTexture()
  const sceneBuffer = gl.createFramebuffer()
  // Uniform locations, looked up once per program and name.
  const locations = new Map<string, WebGLUniformLocation | null>()
  const ids = new Map<WebGLProgram, number>()
  const uniform = (program: WebGLProgram, name: string) => {
    if (!ids.has(program)) ids.set(program, ids.size)
    const key = `${ids.get(program)}:${name}`
    if (!locations.has(key))
      locations.set(key, gl.getUniformLocation(program, name))
    return locations.get(key) ?? null
  }

  const lost = (event: Event) => {
    event.preventDefault()
    onLost()
  }
  canvas.addEventListener('webglcontextlost', lost)

  const pondTexture = texture(gl, art.pond)
  const padsTexture = texture(gl, art.pads)
  const bodies = art.bodies.map((image) => texture(gl, image))
  const shadows = art.shadows.map((image) => texture(gl, image))
  const aspect = art.bodies.map((image) => image.height / image.width)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.enableVertexAttribArray(0)
  gl.enableVertexAttribArray(1)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

  const { x: vx, y: vy, w: vw, h: vh } = POND_VIEW
  const fullQuad = new Float32Array([
    vx,
    vy,
    0,
    0,
    vx,
    vy + vh,
    0,
    1,
    vx + vw,
    vy,
    1,
    0,
    vx + vw,
    vy + vh,
    1,
    1,
  ])
  let strip = new Float32Array(0)
  const finData = new Float32Array(8 * STRIP_FLOATS)
  const rippleData = new Float32Array(MAX_RIPPLES * 4)
  let width = canvas.width
  let height = canvas.height

  const select = (program: WebGLProgram) => {
    gl.useProgram(program)
    gl.uniform4f(uniform(program, 'u_view'), vx, vy, vw, vh)
  }
  const upload = (data: Float32Array) => {
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, STRIP_FLOATS * 4, 0)
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, STRIP_FLOATS * 4, 8)
  }
  const drawTexture = (
    t: WebGLTexture | null,
    data: Float32Array,
    alpha: number,
    count: number,
  ) => {
    gl.bindTexture(gl.TEXTURE_2D, t)
    gl.uniform1f(uniform(textured, 'u_alpha'), alpha)
    upload(data)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, count)
  }
  // Fish, fins and ripples stay inside the painted area; the paper border stays clean.
  const scissorToPond = () => {
    const sx = width / vw
    const sy = height / vh
    gl.enable(gl.SCISSOR_TEST)
    gl.scissor(
      Math.round((POND_BOX.x - vx) * sx),
      Math.round(height - (POND_BOX.y + POND_BOX.h - vy) * sy),
      Math.round(POND_BOX.w * sx),
      Math.round(POND_BOX.h * sy),
    )
  }

  return {
    resize(cssWidth, cssHeight, dpr) {
      width = Math.max(1, Math.round(cssWidth * dpr))
      height = Math.max(1, Math.round(cssHeight * dpr))
      canvas.width = width
      canvas.height = height
      gl.viewport(0, 0, width, height)
      gl.bindTexture(gl.TEXTURE_2D, sceneTexture)
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        width,
        height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null,
      )
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.bindFramebuffer(gl.FRAMEBUFFER, sceneBuffer)
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        sceneTexture,
        0,
      )
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    },
    draw(fishes, ripples, time) {
      if (gl.isContextLost()) return
      const live = ripples.filter((r) => !rippleDone(r)).slice(-MAX_RIPPLES)
      rippleData.fill(-1)
      live.forEach((r, i) =>
        rippleData.set(
          [r.at.x, r.at.y, r.age * (r.pace ?? 1), r.size ?? 1],
          i * 4,
        ),
      )

      // The pond floor and the fish go into the scene texture first.
      gl.bindFramebuffer(gl.FRAMEBUFFER, sceneBuffer)
      gl.disable(gl.SCISSOR_TEST)
      select(textured)
      drawTexture(pondTexture, fullQuad, 1, 4)

      scissorToPond()
      const shown = fishes.filter((fish) => fish.mode !== 'away')
      const count = shown[0]?.line.length ?? 0
      if (strip.length !== count * 2 * STRIP_FLOATS)
        strip = new Float32Array(count * 2 * STRIP_FLOATS)
      for (const fish of shown) {
        const half = (fish.length * aspect[fish.sprite]) / 2
        stripVertices(
          fish.line,
          half,
          { x: fish.length * 0.07, y: fish.length * 0.13 },
          strip,
        )
        drawTexture(shadows[fish.sprite], strip, SHADOW_ALPHA, count * 2)
      }
      for (const fish of shown) {
        select(fins)
        finQuads(fish, finData)
        upload(finData)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        gl.drawArrays(gl.TRIANGLE_STRIP, 4, 4)
        select(textured)
        stripVertices(
          fish.line,
          (fish.length * aspect[fish.sprite]) / 2,
          undefined,
          strip,
        )
        drawTexture(bodies[fish.sprite], strip, 1, count * 2)
      }

      // Then that scene, seen through the moving water.
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.disable(gl.SCISSOR_TEST)
      select(water)
      gl.bindTexture(gl.TEXTURE_2D, sceneTexture)
      gl.uniform2f(uniform(water, 'u_res'), width, height)
      gl.uniform4f(
        uniform(water, 'u_box'),
        POND_BOX.x,
        POND_BOX.y,
        POND_BOX.w,
        POND_BOX.h,
      )
      gl.uniform1f(uniform(water, 'u_time'), time)
      gl.uniform3f(
        uniform(water, 'u_water'),
        WATER.swell,
        WATER.light,
        WATER.ripple,
      )
      gl.uniform4fv(uniform(water, 'u_ripples'), rippleData)
      upload(fullQuad)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      select(textured)
      drawTexture(padsTexture, fullQuad, 1, 4)

      if (live.length) {
        scissorToPond()
        select(rings)
        gl.uniform4fv(uniform(rings, 'u_ripples'), rippleData)
        gl.uniform1f(uniform(rings, 'u_px'), vw / width)
        upload(fullQuad)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      }
    },
    destroy() {
      canvas.removeEventListener('webglcontextlost', lost)
      for (const t of [pondTexture, padsTexture, ...bodies, ...shadows])
        gl.deleteTexture(t)
      gl.deleteTexture(sceneTexture)
      gl.deleteFramebuffer(sceneBuffer)
      gl.deleteBuffer(buffer)
      for (const p of [textured, fins, rings, water]) gl.deleteProgram(p)
    },
  }
}
