import { MAX_DPR, type Rect, type Size } from './placement'
import { FRAGMENT_SHADER, VERTEX_SHADER } from './windShader'

export interface DrawLayer {
  image: HTMLImageElement
  bend: number
  /** On-screen rectangle of the texture, CSS px relative to the hero. */
  rect: Rect
  /** Fraction of the full art the texture covers (x1 − x0). */
  span: number
  /** Part of the texture to draw, 0–1. */
  texClip: [number, number]
}

export interface MeadowRenderer {
  setLayers(layers: DrawLayer[], size: Size): void
  start(): void
  stop(): void
  destroy(): void
  /** Animation clock in seconds (advances only while running). */
  time(): number
}

/**
 * Draws the hero layers back to front with the wind shader.
 * Returns null when WebGL1 is unavailable or the shaders fail to build.
 */
export function createMeadowRenderer(
  canvas: HTMLCanvasElement,
  onFirstFrame: () => void,
  onLost: () => void,
): MeadowRenderer | null {
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    premultipliedAlpha: true,
    powerPreference: 'low-power',
  })
  if (!gl || gl.isContextLost()) return null

  const program = buildProgram(gl)
  if (!program) return null
  gl.useProgram(program)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  )
  const position = gl.getAttribLocation(program, 'position')
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

  const u = {
    t: gl.getUniformLocation(program, 't'),
    bend: gl.getUniformLocation(program, 'bend'),
    span: gl.getUniformLocation(program, 'span'),
    rect: gl.getUniformLocation(program, 'rect'),
    texClip: gl.getUniformLocation(program, 'texClip'),
  }

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)

  const textures = new Map<
    HTMLImageElement,
    { src: string; tex: WebGLTexture }
  >()
  let layers: (DrawLayer & { tex: WebGLTexture })[] = []
  let size: Size = { width: 1, height: 1 }
  let running = false
  let frame = 0
  let clock = 0
  let last = 0
  let firstFrameSent = false
  let lost = false

  const textureFor = (image: HTMLImageElement): WebGLTexture => {
    const cached = textures.get(image)
    if (cached && cached.src === image.currentSrc) return cached.tex
    if (cached) gl.deleteTexture(cached.tex)
    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    textures.set(image, { src: image.currentSrc, tex })
    return tex
  }

  const draw = () => {
    if (lost) return
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.uniform1f(u.t, clock)
    for (const layer of layers) {
      gl.bindTexture(gl.TEXTURE_2D, layer.tex)
      gl.uniform4f(
        u.rect,
        layer.rect.x / size.width,
        layer.rect.y / size.height,
        layer.rect.width / size.width,
        layer.rect.height / size.height,
      )
      gl.uniform1f(u.bend, layer.bend)
      gl.uniform1f(u.span, layer.span)
      gl.uniform2f(u.texClip, layer.texClip[0], layer.texClip[1])
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    if (!firstFrameSent) {
      firstFrameSent = true
      onFirstFrame()
    }
  }

  const tick = (now: number) => {
    if (!running) return
    clock += Math.min((now - last) / 1000, 0.1)
    last = now
    draw()
    frame = requestAnimationFrame(tick)
  }

  const handleLost = () => {
    lost = true
    running = false
    cancelAnimationFrame(frame)
    onLost()
  }
  canvas.addEventListener('webglcontextlost', handleLost)

  return {
    setLayers(next, nextSize) {
      size = nextSize
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      canvas.width = Math.max(1, Math.round(size.width * dpr))
      canvas.height = Math.max(1, Math.round(size.height * dpr))
      layers = next.map((layer) => ({ ...layer, tex: textureFor(layer.image) }))
      draw()
    },
    start() {
      if (running || lost) return
      running = true
      last = performance.now()
      frame = requestAnimationFrame(tick)
    },
    stop() {
      running = false
      cancelAnimationFrame(frame)
    },
    destroy() {
      running = false
      cancelAnimationFrame(frame)
      canvas.removeEventListener('webglcontextlost', handleLost)
      if (!lost) {
        for (const { tex } of textures.values()) gl.deleteTexture(tex)
        gl.deleteBuffer(buffer)
        gl.deleteProgram(program)
      }
      textures.clear()
    },
    time: () => clock,
  }
}

function buildProgram(gl: WebGLRenderingContext): WebGLProgram | null {
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)
    if (!shader) return null
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader
    if (import.meta.env.DEV) console.error(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  const vertex = compile(gl.VERTEX_SHADER, VERTEX_SHADER)
  const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
  if (!vertex || !fragment) return null
  const program = gl.createProgram()
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program
  if (import.meta.env.DEV) console.error(gl.getProgramInfoLog(program))
  gl.deleteProgram(program)
  return null
}
