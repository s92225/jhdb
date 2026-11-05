import { HERO_ART, HERO_MOTION_LIMITS, heroCoverCrop, heroRenderSize } from './hero-motion-settings'

export type HeroMotionController = { setPlaying: (playing: boolean) => void; destroy: () => void }

const VERTEX = `
attribute vec2 a_position;
varying vec2 v_screen;
void main() {
  v_screen = a_position * vec2(0.5, -0.5) + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`

// One bounded WebGL pass: local cloth deformation, masked water/foliage and
// restrained mist. No React updates per frame and no full-image zoom or pan.
const FRAGMENT = `
precision highp float;
varying vec2 v_screen;
uniform sampler2D u_original;
uniform sampler2D u_clean;
uniform sampler2D u_masks;
uniform vec4 u_crop;
uniform float u_time;
const vec2 SIZE = vec2(1774.0, 887.0);

vec4 original(vec2 p) { return texture2D(u_original, p / SIZE); }
vec3 masks(vec2 p) {
  vec4 m = texture2D(u_masks, p / SIZE);
  return m.rgb * m.a;
}
float softBox(vec2 p, vec2 lo, vec2 hi, float feather) {
  vec2 a = smoothstep(lo - feather, lo + feather, p);
  vec2 b = 1.0 - smoothstep(hi - feather, hi + feather, p);
  return a.x * a.y * b.x * b.y;
}
vec2 clothOffset(vec2 p, float t) {
  float reach = smoothstep(1442.0, 1638.0, p.x);
  vec2 offset = vec2(
    2.2 * reach * sin(t * 0.83 - p.x * 0.021 + p.y * 0.014),
    4.7 * reach * sin(t * 0.77 - (p.x - 1442.0) * 0.031)
  );
  if (p.y < 442.0 && p.x > 1482.0) {
    reach = smoothstep(1482.0, 1594.0, p.x);
    offset = vec2(1.2 * reach * sin(t * 1.1),
      3.2 * reach * sin(t * 1.15 - p.x * 0.039));
  }
  return offset;
}

// Reuse original painted bird silhouettes, not generic new vector birds.
vec4 bird(vec4 colour, vec2 p, vec2 centre, vec2 halfSize, float phase, float t) {
  float journey = fract(t / 54.0 + 0.38);
  vec2 flight = vec2(mix(-88.0, 130.0, journey),
    sin(t * 0.13 + phase) * 3.0 - sin(journey * 3.14159) * 7.0);
  vec2 q = p - centre - flight;
  if (abs(q.x) > halfSize.x + 1.0 || abs(q.y) > halfSize.y * 1.25 + 2.0) return colour;
  float wing = 0.76 + 0.22 * sin(t * 3.8 + phase);
  vec2 samplePoint = centre + vec2(q.x,
    q.y / wing + abs(q.x) * 0.12 * sin(t * 3.8 + phase));
  vec3 paint = original(samplePoint).rgb;
  float darkness = dot(paint, vec3(0.299, 0.587, 0.114));
  float alpha = 1.0 - smoothstep(0.42, 0.76, darkness);
  alpha *= softBox(samplePoint, centre - halfSize, centre + halfSize, 0.8);
  alpha *= smoothstep(0.0, 0.09, journey) * (1.0 - smoothstep(0.88, 1.0, journey));
  return vec4(mix(colour.rgb, paint, alpha), 1.0);
}

void main() {
  vec2 p = (u_crop.xy + v_screen * u_crop.zw) * SIZE;
  vec3 m = masks(p);
  float t = u_time;
  vec2 wind = vec2(sin(t * 0.62 + p.y * 0.011) * 1.45,
    sin(t * 0.56 + p.x * 0.009) * 0.65) * m.g;
  vec2 ripple = vec2(
    sin(p.y * 0.19 - t * 0.84) * 0.85 + sin(p.y * 0.061 + t * 0.5) * 0.3,
    sin(p.x * 0.027 - t * 0.67) * 0.36
  ) * m.b;
  vec4 colour = original(p + wind + ripple);

  // The generated plate is sampled ONLY under the moving cloth and old birds.
  // All other scenery, the stationary body, feet and bridge use the original.
  float oldBirds = softBox(p, vec2(782.0, 158.0), vec2(950.0, 249.0), 9.0);
  float erase = max(m.r, oldBirds);
  colour = mix(colour, texture2D(u_clean, p / SIZE), erase);
  if (p.x > 1428.0 && p.x < 1652.0 && p.y > 398.0 && p.y < 581.0) {
    vec2 clothPoint = p - clothOffset(p, t);
    colour = mix(colour, original(clothPoint), masks(clothPoint).r);
  }

  // Tiny rings/glints stay inside the lake mask; never distort stone or copy.
  vec2 ringPoint = (p - vec2(1120.0, 619.0)) * vec2(0.4, 1.7);
  float rings = sin(length(ringPoint) * 0.2 - t * 0.9) *
    exp(-length(ringPoint) * 0.035) * 0.008;
  colour.rgb += vec3(rings + sin(p.y * 0.3 + t * 0.7) * 0.003) * m.b;

  if (p.x > 670.0) {
    vec2 f1 = (p - vec2(1050.0 + sin(t * 0.065) * 105.0, 444.0 + sin(t * 0.12) * 6.0)) / vec2(275.0, 38.0);
    vec2 f2 = (p - vec2(1320.0 + sin(t * 0.052 + 2.0) * 92.0, 532.0 + sin(t * 0.09) * 4.0)) / vec2(230.0, 22.0);
    float wisps = 0.72 + 0.28 * sin(p.x * 0.011 + p.y * 0.021 - t * 0.11);
    float fog = (exp(-dot(f1, f1)) * 0.037 + exp(-dot(f2, f2)) * 0.029) * wisps;
    colour.rgb = mix(colour.rgb, vec3(0.965, 0.974, 0.965), fog);
  }

  colour = bird(colour, p, vec2(887.0, 173.0), vec2(17.0, 9.0), 0.2, t);
  colour = bird(colour, p, vec2(927.0, 181.0), vec2(18.0, 11.0), 1.4, t);
  colour = bird(colour, p, vec2(851.0, 205.0), vec2(15.0, 8.0), 2.6, t);
  colour = bird(colour, p, vec2(899.0, 204.0), vec2(13.0, 8.0), 3.8, t);
  colour = bird(colour, p, vec2(880.0, 218.0), vec2(7.0, 5.0), 4.7, t);
  colour = bird(colour, p, vec2(843.0, 228.0), vec2(11.0, 7.0), 1.9, t);
  colour = bird(colour, p, vec2(825.0, 240.0), vec2(12.0, 7.0), 3.2, t);
  colour = bird(colour, p, vec2(800.0, 232.0), vec2(13.0, 7.0), 5.1, t);
  gl_FragColor = vec4(colour.rgb, 1.0);
}`

function createMasks() {
  const canvas = document.createElement('canvas')
  canvas.width = HERO_ART.width; canvas.height = HERO_ART.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No mask canvas')
  function paint(colour: string, path: string, blur = 0) {
    if (!ctx) return
    ctx.fillStyle = colour; ctx.shadowColor = colour; ctx.shadowBlur = blur
    ctx.fill(new Path2D(path), 'evenodd')
  }
  // RGB channels are local motion weights, not a replacement of the artwork.
  paint('#0000ff', 'M780 605 Q912 566 1068 548 Q1250 520 1414 537 L1410 565 L1315 589 L1258 625 L1140 650 L1020 685 L883 723 L805 699 Z M858 578 Q897 520 964 523 Q1028 526 1046 597 L994 620 L874 613 Z', 12)
  paint('#00ff00', 'M1340 0 L1774 0 L1774 250 L1725 205 L1695 130 L1584 124 L1510 86 L1390 114 Z', 13)
  paint('#00ff00', 'M1774 255 L1740 275 L1688 293 L1632 342 L1670 344 L1603 389 L1649 402 L1613 450 L1670 455 L1658 510 L1709 543 L1774 572 Z', 12)
  paint('#00ff00', 'M1030 365 Q1098 326 1170 343 Q1245 334 1267 384 L1202 398 L1130 393 L1087 414 L1022 397 Z', 10)
  paint('#ff0000', 'M1439 414 L1455 413 L1477 425 L1503 447 L1527 460 L1551 471 L1584 472 L1614 479 L1641 497 L1626 501 L1610 502 L1608 510 L1619 517 L1611 524 L1601 527 L1591 522 L1583 536 L1598 542 L1586 547 L1578 542 L1568 549 L1567 558 L1556 562 L1544 552 L1534 553 L1537 566 L1520 567 L1508 556 L1495 546 L1486 535 L1471 524 L1458 508 L1449 489 L1441 467 L1437 442 Z', 0.6)
  paint('#ff0000', 'M1482 412 C1515 423 1524 421 1546 410 Q1571 399 1595 412 L1584 415 Q1562 407 1544 417 C1513 434 1499 422 1483 417 Z M1481 418 Q1517 439 1550 426 Q1568 421 1571 436 L1562 435 Q1557 428 1548 432 Q1517 445 1482 422 Z', 0.5)
  return canvas
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not load local art'))
    image.src = url
  })
}

export async function startHeroMotion(canvas: HTMLCanvasElement, signal: AbortSignal,
  onFailure: () => void): Promise<HeroMotionController | null> {
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false,
    depth: false, stencil: false, powerPreference: 'low-power', preserveDrawingBuffer: false })
  if (!gl) throw new Error('WebGL unavailable')
  const rendererInfo = gl.getExtension('WEBGL_debug_renderer_info')
  const rendererName = rendererInfo ? String(gl.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL)) : ''
  const softwareRendering = /swiftshader|software|llvmpipe|microsoft basic|warp/i.test(rendererName)
  const mobileQuery = window.matchMedia('(max-width: 900px)')
  const [art, clean] = await Promise.all([
    loadImage('/art/wuxia/hero.webp'), loadImage('/art/wuxia/hero-cleanplate-preview.webp'),
  ])
  if (signal.aborted) return null
  const shaders: WebGLShader[] = [], textures: WebGLTexture[] = []
  let program: WebGLProgram | null = null, buffer: WebGLBuffer | null = null
  let raf = 0, disposed = false, playing = true, inView = true, searchFocused = false
  let clock = 0, previous = 0, lastDraw = -Infinity
  let tickFrame: (now: number) => void = () => {}
  let resizeObserver: ResizeObserver | null = null, intersection: IntersectionObserver | null = null

  function release() {
    if (disposed) return
    disposed = true; cancelAnimationFrame(raf); raf = 0
    resizeObserver?.disconnect(); intersection?.disconnect()
    document.removeEventListener('visibilitychange', visibility)
    canvas.closest('section')?.removeEventListener('focusin', focus)
    canvas.closest('section')?.removeEventListener('focusout', blur)
    canvas.removeEventListener('webglcontextlost', lost)
    textures.forEach(t => gl!.deleteTexture(t)); shaders.forEach(s => gl!.deleteShader(s))
    if (buffer) gl!.deleteBuffer(buffer)
    if (program) gl!.deleteProgram(program)
  }
  function lost(event: Event) { event.preventDefault(); release(); onFailure() }
  function active() { return playing && inView && !document.hidden && !searchFocused && !disposed }
  function schedule() {
    if (!active()) { cancelAnimationFrame(raf); raf = 0; previous = 0; return }
    if (!raf) raf = requestAnimationFrame(tickFrame)
  }
  function visibility() { schedule() }
  function focus(event: Event) {
    searchFocused = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement
    schedule()
  }
  function blur() { searchFocused = false; schedule() }

  try {
    function shader(type: number, code: string) {
      const result = gl!.createShader(type)
      if (!result) throw new Error('Shader allocation failed')
      shaders.push(result); gl!.shaderSource(result, code); gl!.compileShader(result)
      if (!gl!.getShaderParameter(result, gl!.COMPILE_STATUS)) throw new Error(gl!.getShaderInfoLog(result) || 'Shader failed')
      return result
    }
    program = gl.createProgram()
    if (!program) throw new Error('Program allocation failed')
    gl.attachShader(program, shader(gl.VERTEX_SHADER, VERTEX))
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAGMENT))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'Link failed')
    gl.useProgram(program)
    buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    const cropLocation = gl.getUniformLocation(program, 'u_crop')
    const timeLocation = gl.getUniformLocation(program, 'u_time')
    if (cropLocation === null || timeLocation === null) throw new Error('Missing uniforms')
    ;[art, clean, createMasks()].forEach((image, index) => {
      const texture = gl!.createTexture()
      if (!texture) throw new Error('Texture allocation failed')
      textures.push(texture); gl!.activeTexture(gl!.TEXTURE0 + index); gl!.bindTexture(gl!.TEXTURE_2D, texture)
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR)
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR)
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE)
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE)
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, image)
      gl!.uniform1i(gl!.getUniformLocation(program!, ['u_original','u_clean','u_masks'][index]), index)
    })

    function draw() { gl!.uniform1f(timeLocation, clock); gl!.drawArrays(gl!.TRIANGLES, 0, 6) }
    function resize() {
      if (disposed) return
      const box = canvas.getBoundingClientRect()
      if (!box.width || !box.height) return
      const mobile = mobileQuery.matches
      const dpr = softwareRendering ? Math.min(window.devicePixelRatio || 1, 0.6) : window.devicePixelRatio || 1
      const [width, height] = heroRenderSize(box.width, box.height, dpr)
      canvas.width = width; canvas.height = height; gl!.viewport(0, 0, width, height)
      gl!.uniform4fv(cropLocation, new Float32Array(heroCoverCrop(box.width, box.height, mobile)))
      draw()
    }
    function renderFrame(now: number) {
      raf = 0
      if (!active()) { previous = 0; return }
      if (previous) clock += Math.min((now - previous) / 1000, 0.1)
      previous = now
      const fps = softwareRendering ? 12 : mobileQuery.matches ? HERO_MOTION_LIMITS.mobileFps : HERO_MOTION_LIMITS.desktopFps
      if (now - lastDraw >= 1000 / fps) { draw(); lastDraw = now }
      schedule()
    }
    // Hoist the local draw-loop binding used by schedule without any React state.
    tickFrame = renderFrame
    resizeObserver = new ResizeObserver(resize); resizeObserver.observe(canvas)
    intersection = new IntersectionObserver(entries => { inView = entries[0]?.isIntersecting ?? false; schedule() }, { threshold: 0.02 })
    intersection.observe(canvas)
    document.addEventListener('visibilitychange', visibility)
    canvas.closest('section')?.addEventListener('focusin', focus)
    canvas.closest('section')?.addEventListener('focusout', blur)
    canvas.addEventListener('webglcontextlost', lost)
    resize(); canvas.dataset.motionRenderer = 'ready'; schedule()
    return { setPlaying(value) { playing = value; schedule() }, destroy: release }
  } catch (error) { release(); throw error }

}
