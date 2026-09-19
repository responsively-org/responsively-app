/**
 * Regenerates the real device-frame artwork bundled with the renderer:
 * src/renderer/components/Previewer/Device/frames/{assets/*.webp,manifest.ts,NOTICE.md}
 * from the pinned sources in ./sources.ts.
 *
 *   yarn tsx .erb/scripts/device-frames/generate.ts [--only id,id…]
 *
 * Each frame is composited in a headless Chromium: the artwork is drawn at
 * the target resolution, the screen area is made transparent (so the page
 * shows through, with notches and camera islands drawn over it), Android
 * skins get their corner/camera mask applied, the result is verified and
 * encoded as WebP. Geometry goes into manifest.ts; credits into NOTICE.md.
 *
 * Needs network access and a Playwright Chromium (`npx playwright install
 * chromium`, or point PLAYWRIGHT_CHROMIUM at a chromium/headless-shell
 * binary). Downloads are cached in ~/.cache/responsively-device-frames.
 * Runs under plain Node via tsx — no Electron.
 */
import {execFileSync} from 'child_process';
import {createHash} from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {chromium, type Page} from 'playwright';
import {format, resolveConfig} from 'prettier';
import {
  AOSP_COMMIT,
  DEVTOOLS_COMMIT,
  FRAMES,
  SOURCES,
  type AospSpec,
  type CommonsSpec,
  type DevtoolsSpec,
  type FrameRect,
  type FrameSpec,
} from './sources';

const APP_ROOT = path.resolve(__dirname, '../../..');
const FRAMES_DIR = path.join(APP_ROOT, 'src/renderer/components/Previewer/Device/frames');
const ASSETS_DIR = path.join(FRAMES_DIR, 'assets');
const INDEX_FILE = path.join(ASSETS_DIR, 'frames.json');
const CACHE_DIR = path.join(os.homedir(), '.cache', 'responsively-device-frames');
const USER_AGENT =
  'responsively-app device-frames generator (https://github.com/responsively-org/responsively-app)';
/** Output resolution: the screen cut-out's longer edge, in pixels. */
const SCREEN_EDGE = 1800;
const WEBP_QUALITY = 0.85;

// ---------------------------------------------------------------------------
// Downloads

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const download = async (url: string, dest: string): Promise<string> => {
  if (fs.existsSync(dest)) {
    return dest;
  }
  fs.mkdirSync(path.dirname(dest), {recursive: true});
  let lastError: unknown;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const response = await fetch(url, {headers: {'User-Agent': USER_AGENT}});
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
      }
      fs.writeFileSync(dest, Buffer.from(await response.arrayBuffer()));
      return dest;
    } catch (error) {
      lastError = error;
      await sleep(1500 * 2 ** attempt);
    }
  }
  throw lastError;
};

const sha1 = (file: string): string =>
  createHash('sha1').update(fs.readFileSync(file)).digest('hex');

/** The AOSP device-art tree at the pinned commit, fetched once as a tarball. */
const aospRoot = async (): Promise<string> => {
  const dir = path.join(CACHE_DIR, 'aosp', AOSP_COMMIT);
  if (!fs.existsSync(path.join(dir, 'device-art.xml'))) {
    const tarball = await download(
      `https://android.googlesource.com/platform/tools/adt/idea/+archive/${AOSP_COMMIT}/artwork/resources/device-art-resources.tar.gz`,
      path.join(CACHE_DIR, 'aosp', `${AOSP_COMMIT}.tar.gz`)
    );
    fs.mkdirSync(dir, {recursive: true});
    execFileSync('tar', ['-xzf', tarball, '-C', dir]);
  }
  return dir;
};

const devtoolsFile = (file: string): Promise<string> =>
  download(
    `https://raw.githubusercontent.com/ChromeDevTools/devtools-frontend/${DEVTOOLS_COMMIT}/front_end/emulated_devices/${file}`,
    path.join(CACHE_DIR, 'devtools', DEVTOOLS_COMMIT, file)
  );

const commonsFile = async (spec: CommonsSpec): Promise<string> => {
  const file = await download(spec.url, path.join(CACHE_DIR, 'commons', spec.sha1, spec.title));
  const actual = sha1(file);
  if (actual !== spec.sha1) {
    throw new Error(
      `${spec.title}: SHA-1 ${actual} does not match the pinned ${spec.sha1} — the file changed on Commons; re-check its licence and geometry before updating sources.ts`
    );
  }
  return file;
};

// ---------------------------------------------------------------------------
// Source geometry

interface AospLayout {
  orientation: 'portrait' | 'landscape';
  width: number;
  height: number;
  x: number;
  y: number;
  display: {width: number; height: number; cornerRadius: number};
  background: string;
  mask: string | null;
}

/** Parses an Android emulator skin `layout` descriptor (aconfig text). */
const parseAospLayout = (text: string, skin: string): AospLayout => {
  const num = (block: string, key: string): number | undefined => {
    const match = block.match(new RegExp(`(?:^|\\s)${key}\\s+(\\d+)`));
    return match ? Number(match[1]) : undefined;
  };
  const required = (value: number | undefined, what: string): number => {
    if (value === undefined) {
      throw new Error(`${skin}/layout: missing ${what}`);
    }
    return value;
  };
  const display = text.match(/display\s*\{([^}]*)\}/)?.[1] ?? '';
  const layoutsText = text.slice(text.indexOf('layouts'));
  const orientation = layoutsText.match(/(portrait|landscape)\s*\{/);
  if (orientation === null || orientation.index === undefined) {
    throw new Error(`${skin}/layout: no layouts block`);
  }
  const body = layoutsText.slice(orientation.index + orientation[0].length);
  const part2 = body.match(/part2\s*\{([^}]*)\}/)?.[1] ?? '';
  return {
    orientation: orientation[1] as 'portrait' | 'landscape',
    width: required(num(body, 'width'), 'layout width'),
    height: required(num(body, 'height'), 'layout height'),
    x: required(num(part2, 'x'), 'device x'),
    y: required(num(part2, 'y'), 'device y'),
    display: {
      width: required(num(display, 'width'), 'display width'),
      height: required(num(display, 'height'), 'display height'),
      cornerRadius: num(display, 'corner_radius') ?? 0,
    },
    background: text.match(/background\s*\{\s*image\s+(\S+)/)?.[1] ?? '',
    mask: text.match(/mask\s+(\S+)/)?.[1] ?? null,
  };
};

const svgSize = (svgText: string): {width: number; height: number} => {
  const viewBox = svgText.match(/viewBox\s*=\s*"([^"]+)"/)?.[1];
  if (viewBox !== undefined) {
    const [, , width, height] = viewBox
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    return {width, height};
  }
  const attr = (name: string) =>
    Number(svgText.match(new RegExp(`<svg[^>]*\\s${name}="([\\d.]+)`))?.[1]);
  return {width: attr('width'), height: attr('height')};
};

// ---------------------------------------------------------------------------
// Rendering

interface RenderJob {
  /** SVG markup (rendered through the DOM so screen elements can be edited). */
  svgText: string | null;
  /** Raster source as a data URL. */
  imageDataUrl: string | null;
  /** Source size (viewBox units or pixels). */
  width: number;
  height: number;
  /** Output pixels per source unit. */
  scale: number;
  screen: FrameRect;
  /** Screen corner radius, source units (the punch-out for 'rect' cut-outs). */
  radius: number;
  /** Corner radius the verification probes stay clear of, source units. */
  probeRadius: number;
  /**
   * How the screen becomes transparent:
   * - 'overlay': punch out the exact shape of the SVG element that draws the
   *   screen, then redraw whatever is painted after it inside the screen
   *   (notches, camera islands) on top;
   * - 'rect': punch out the rounded screen rectangle;
   * - 'none': the artwork is already transparent there.
   */
  cutout: 'overlay' | 'rect' | 'none';
  /** Overlay drawn on top of the screen (Android corner/camera mask), source units. */
  mask: {dataUrl: string; x: number; y: number; width: number; height: number} | null;
  quality: number;
}

type RenderResult =
  | {ok: true; webp: string; width: number; height: number; overlays: number; warnings: string[]}
  | {ok: false; error: string};

/** Runs in the page. Everything it needs travels in `job`. */
const renderInPage = async (job: RenderJob): Promise<RenderResult> => {
  const load = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('image failed to decode'));
      img.src = src;
    });
  const outWidth = Math.round(job.width * job.scale);
  const outHeight = Math.round(job.height * job.scale);
  let src = job.imageDataUrl;
  /** Exact screen shape (black on transparent) to punch out. */
  let screenMaskSrc: string | null = null;
  /** Everything painted over the screen area (notch, camera island). */
  let overlaySrc: string | null = null;
  let overlays = 0;
  if (job.svgText !== null) {
    const host = document.createElement('div');
    host.style.position = 'absolute';
    host.style.left = '0';
    host.style.top = '0';
    host.innerHTML = job.svgText;
    document.body.appendChild(host);
    const svg = host.querySelector('svg');
    if (svg === null) {
      return {ok: false, error: 'no <svg> element'};
    }
    if (!svg.getAttribute('viewBox')) {
      svg.setAttribute('viewBox', `0 0 ${job.width} ${job.height}`);
    }
    const serialize = () =>
      `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
    if (job.cutout === 'overlay') {
      // Lay the drawing out at 1 unit = 1px so element boxes are in source units.
      svg.setAttribute('width', String(job.width));
      svg.setAttribute('height', String(job.height));
      const base = svg.getBoundingClientRect();
      const leaves = Array.from(
        svg.querySelectorAll<SVGElement>(
          'rect, path, circle, ellipse, polygon, polyline, line, image, text, use'
        )
      ).filter((el) => el.closest('defs, clipPath, mask, pattern, symbol') === null);
      const boxOf = (el: Element) => {
        const b = el.getBoundingClientRect();
        return {x: b.left - base.left, y: b.top - base.top, width: b.width, height: b.height};
      };
      const boxes = new Map(leaves.map((el) => [el, boxOf(el)]));
      const tolerance = 0.015 * Math.max(job.screen.width, job.screen.height);
      // Nested body/bezel/screen rects sit within a unit or two of each
      // other: take the closest box, not the first one within tolerance.
      const deviation = (el: SVGElement) => {
        const b = boxes.get(el)!;
        return Math.max(
          Math.abs(b.x - job.screen.x),
          Math.abs(b.y - job.screen.y),
          Math.abs(b.width - job.screen.width),
          Math.abs(b.height - job.screen.height)
        );
      };
      const screenEl = leaves
        .filter((el) => deviation(el) <= tolerance)
        .sort((a, b) => deviation(a) - deviation(b))[0];
      if (screenEl === undefined) {
        host.remove();
        return {ok: false, error: 'no element matches the screen rectangle'};
      }
      const inside = (b: {x: number; y: number; width: number; height: number}) =>
        b.x >= job.screen.x - tolerance &&
        b.y >= job.screen.y - tolerance &&
        b.x + b.width <= job.screen.x + job.screen.width + tolerance &&
        b.y + b.height <= job.screen.y + job.screen.height + tolerance;
      // Overlays are small things painted after the screen inside its box.
      // Anything covering most of the screen (a wallpaper, glare or a second
      // screen-sized rect) belongs to the screen and is cut away with it.
      const screenArea = job.screen.width * job.screen.height;
      const isOverlay = (el: SVGElement) => {
        const box = boxes.get(el)!;
        return (
          el !== screenEl &&
          (screenEl.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0 &&
          inside(box) &&
          box.width * box.height < 0.5 * screenArea
        );
      };
      const withOnly = (keep: (el: SVGElement) => boolean) => {
        const hidden: Array<[SVGElement, string]> = [];
        leaves.forEach((el) => {
          if (!keep(el)) {
            hidden.push([el, el.style.display]);
            el.style.display = 'none';
          }
        });
        const out = serialize();
        hidden.forEach(([el, display]) => {
          el.style.display = display;
        });
        return out;
      };
      svg.setAttribute('width', String(outWidth));
      svg.setAttribute('height', String(outHeight));
      src = serialize();
      // The screen element's own stroke often draws the black bezel ring:
      // only its fill is the screen.
      const {fill, stroke, opacity} = screenEl.style;
      screenEl.style.fill = '#000';
      screenEl.style.stroke = 'none';
      screenEl.style.opacity = '1';
      screenMaskSrc = withOnly((el) => el === screenEl);
      screenEl.style.fill = fill;
      screenEl.style.stroke = stroke;
      screenEl.style.opacity = opacity;
      overlays = leaves.filter(isOverlay).length;
      overlaySrc = overlays > 0 ? withOnly(isOverlay) : null;
    } else {
      svg.setAttribute('width', String(outWidth));
      svg.setAttribute('height', String(outHeight));
      src = serialize();
    }
    host.remove();
  }
  if (src === null) {
    return {ok: false, error: 'nothing to render'};
  }
  const image = await load(src);
  const canvas = document.createElement('canvas');
  canvas.width = outWidth;
  canvas.height = outHeight;
  const ctx = canvas.getContext('2d');
  if (ctx === null) {
    return {ok: false, error: 'no 2d context'};
  }
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, 0, 0, outWidth, outHeight);

  const s = job.scale;
  const sx = job.screen.x * s;
  const sy = job.screen.y * s;
  const sw = job.screen.width * s;
  const sh = job.screen.height * s;
  if (job.cutout === 'rect') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.roundRect(sx, sy, sw, sh, job.radius * s);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
  if (screenMaskSrc !== null) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.drawImage(await load(screenMaskSrc), 0, 0, outWidth, outHeight);
    ctx.globalCompositeOperation = 'source-over';
  }
  if (overlaySrc !== null) {
    ctx.drawImage(await load(overlaySrc), 0, 0, outWidth, outHeight);
  }
  if (job.mask !== null) {
    const mask = await load(job.mask.dataUrl);
    ctx.drawImage(mask, job.mask.x * s, job.mask.y * s, job.mask.width * s, job.mask.height * s);
  }

  const alphaAt = (x: number, y: number) =>
    ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data[3];
  // The page must show through the whole screen: probe the centre and the
  // corners (inside the rounded corner / camera mask).
  const inset = job.probeRadius * s + 0.03 * Math.min(sw, sh);
  const probes: Array<[number, number]> = [
    [sx + sw / 2, sy + sh / 2],
    [sx + inset, sy + inset],
    [sx + sw - inset, sy + inset],
    [sx + inset, sy + sh - inset],
    [sx + sw - inset, sy + sh - inset],
  ];
  const opaque = probes.filter(([x, y]) => alphaAt(x, y) !== 0);
  if (opaque.length > 0) {
    return {
      ok: false,
      error: `screen still opaque at ${opaque.map((p) => p.map(Math.round).join(',')).join(' | ')} (${overlays} overlay element(s))`,
    };
  }
  const warnings: string[] = [];
  const bezel: Array<[number, number]> = [
    [sx - 3, sy + sh / 2],
    [sx + sw + 3, sy + sh / 2],
    [sx + sw / 2, sy - 3],
    [sx + sw / 2, sy + sh + 3],
  ];
  const missing = bezel.filter(
    ([x, y]) => x >= 0 && y >= 0 && x < outWidth && y < outHeight && alphaAt(x, y) === 0
  );
  if (missing.length > 0) {
    warnings.push(
      `no bezel right outside the screen at ${missing.map((p) => p.map(Math.round).join(',')).join(' | ')}`
    );
  }
  return {
    ok: true,
    webp: canvas.toDataURL('image/webp', job.quality),
    width: outWidth,
    height: outHeight,
    overlays,
    warnings,
  };
};

const dataUrl = (file: string): string => {
  const ext = path.extname(file).slice(1).toLowerCase();
  const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`;
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
};

interface Credit {
  work: string;
  author: string;
  license: string;
  licenseUrl: string;
  url: string;
  changes: string;
}

/** What manifest.ts and NOTICE.md need per frame; persisted in frames.json. */
interface FrameRecord {
  name: string;
  source: FrameSpec['source'];
  width: number;
  height: number;
  screen: FrameRect;
  screenRadius: number;
  orientation: 'portrait' | 'landscape';
  credit: Credit;
}

const round = (value: number) => Math.round(value * 100) / 100;

const buildJob = async (
  spec: FrameSpec
): Promise<{
  job: RenderJob;
  orientation: 'portrait' | 'landscape';
  screenRadius: number;
  credit: Credit;
}> => {
  if (spec.source === 'aosp') {
    return buildAospJob(spec);
  }
  if (spec.source === 'chrome-devtools') {
    return buildDevtoolsJob(spec);
  }
  return buildCommonsJob(spec);
};

const buildAospJob = async (spec: AospSpec) => {
  const dir = path.join(await aospRoot(), spec.skin);
  const layout = parseAospLayout(fs.readFileSync(path.join(dir, 'layout'), 'utf8'), spec.skin);
  const screen = {
    x: layout.x,
    y: layout.y,
    width: layout.display.width,
    height: layout.display.height,
  };
  const scale = SCREEN_EDGE / Math.max(screen.width, screen.height);
  const mask =
    layout.mask === null ? null : {dataUrl: dataUrl(path.join(dir, layout.mask)), ...screen};
  return {
    job: {
      svgText: null,
      imageDataUrl: dataUrl(path.join(dir, layout.background)),
      width: layout.width,
      height: layout.height,
      scale,
      screen,
      // Nexus/early Pixel skins paint the display opaque black; punch it.
      // A mask draws the rounded corners itself, so the hole stays square.
      radius: mask === null ? layout.display.cornerRadius : 0,
      // Corner masks without a declared radius still round the corners
      // (and cut the camera hole): keep the probes well inside.
      probeRadius:
        layout.display.cornerRadius ||
        (mask === null ? 0 : 0.1 * Math.min(screen.width, screen.height)),
      cutout: 'rect' as const,
      mask,
      quality: WEBP_QUALITY,
    },
    orientation: layout.orientation,
    screenRadius: layout.display.cornerRadius,
    credit: {
      work: `device-art-resources/${spec.skin} (${layout.background}${layout.mask ? ` + ${layout.mask}` : ''})`,
      author: 'The Android Open Source Project',
      license: SOURCES.aosp.license,
      licenseUrl: SOURCES.aosp.licenseUrl,
      url: `https://android.googlesource.com/platform/tools/adt/idea/+/${AOSP_COMMIT}/artwork/resources/device-art-resources/${spec.skin}/`,
      changes:
        'display area made transparent, corner/camera mask composited, resized, encoded as WebP',
    },
  };
};

const buildDevtoolsJob = async (spec: DevtoolsSpec) => {
  const file = await devtoolsFile(spec.file);
  const isSvg = spec.file.endsWith('.svg');
  const svgText = isSvg ? fs.readFileSync(file, 'utf8') : null;
  const size = isSvg ? svgSize(svgText ?? '') : await rasterSize(file);
  // DevTools stretched the image to (insets + screen) CSS px; map that box
  // onto the artwork's own pixel grid.
  const cssWidth = spec.insets.left + spec.screen.width + spec.insets.right;
  const cssHeight = spec.insets.top + spec.screen.height + spec.insets.bottom;
  const screen = {
    x: (spec.insets.left / cssWidth) * size.width,
    y: (spec.insets.top / cssHeight) * size.height,
    width: (spec.screen.width / cssWidth) * size.width,
    height: (spec.screen.height / cssHeight) * size.height,
  };
  return {
    job: {
      svgText,
      imageDataUrl: isSvg ? null : dataUrl(file),
      width: size.width,
      height: size.height,
      scale: SCREEN_EDGE / Math.max(screen.width, screen.height),
      screen,
      radius: 0,
      probeRadius: 0,
      cutout: spec.cutout,
      mask: null,
      quality: WEBP_QUALITY,
    },
    orientation: spec.orientation,
    screenRadius: 0,
    credit: {
      work: `front_end/emulated_devices/${spec.file}`,
      author: 'The Chromium Authors',
      license: SOURCES['chrome-devtools'].license,
      licenseUrl: SOURCES['chrome-devtools'].licenseUrl,
      url: `https://github.com/ChromeDevTools/devtools-frontend/blob/${DEVTOOLS_COMMIT}/front_end/emulated_devices/${spec.file}`,
      changes:
        spec.cutout === 'none'
          ? 'resized, encoded as WebP'
          : 'screen area made transparent, rasterized, encoded as WebP',
    },
  };
};

const buildCommonsJob = async (spec: CommonsSpec) => {
  const file = await commonsFile(spec);
  const svgText = fs.readFileSync(file, 'utf8');
  const size = svgSize(svgText);
  return {
    job: {
      svgText,
      imageDataUrl: null,
      width: size.width,
      height: size.height,
      scale: SCREEN_EDGE / Math.max(spec.screen.width, spec.screen.height),
      screen: spec.screen,
      radius: spec.screenRadius,
      probeRadius: spec.screenRadius,
      cutout: spec.cutout,
      mask: null,
      quality: WEBP_QUALITY,
    },
    orientation: spec.orientation,
    screenRadius: spec.screenRadius,
    credit: {
      work: spec.title,
      author: spec.author,
      license: spec.license,
      licenseUrl: spec.licenseUrl,
      url: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(spec.title.replace(/ /g, '_'))}`,
      changes: 'screen area made transparent, rasterized, encoded as WebP',
    },
  };
};

let sizingPage: Page | null = null;
const rasterSize = async (file: string): Promise<{width: number; height: number}> => {
  if (sizingPage === null) {
    throw new Error('rasterSize called before the browser was ready');
  }
  return sizingPage.evaluate(
    (src) =>
      new Promise<{width: number; height: number}>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({width: img.naturalWidth, height: img.naturalHeight});
        img.onerror = () => reject(new Error('image failed to decode'));
        img.src = src;
      }),
    dataUrl(file)
  );
};

// ---------------------------------------------------------------------------
// Output files

const identifier = (id: string) =>
  id.replace(/-([a-z0-9])/g, (_match, char: string) => char.toUpperCase());

const writeManifest = async (records: Record<string, FrameRecord>) => {
  const ids = FRAMES.map((spec) => spec.id).filter((id) => records[id] !== undefined);
  const lines: string[] = [
    '/* GENERATED by .erb/scripts/device-frames/generate.ts — edit sources.ts and regenerate. */',
    "import type {FrameArtwork} from './geometry';",
    ...ids.map((id) => `import ${identifier(id)} from './assets/${id}.webp';`),
    '',
    '/** Where a set of frame artwork comes from, for the attribution notice. */',
    'export interface FrameSource {',
    '  name: string;',
    '  url: string;',
    '  license: string;',
    '  licenseUrl: string;',
    '  copyright: string;',
    '}',
    '',
    `export const FRAME_SOURCES: Record<string, FrameSource> = ${JSON.stringify(SOURCES, null, 2)};`,
    '',
    '/** Every bundled frame, keyed by frame id. Credits: ./NOTICE.md. */',
    'export const FRAME_ARTWORK = {',
    ...ids.map((id) => {
      const r = records[id];
      const screen = `{x: ${r.screen.x}, y: ${r.screen.y}, width: ${r.screen.width}, height: ${r.screen.height}}`;
      return `  '${id}': {src: ${identifier(id)}, width: ${r.width}, height: ${r.height}, screen: ${screen}, screenRadius: ${r.screenRadius}, orientation: '${r.orientation}', source: '${r.source}'},`;
    }),
    '} satisfies Record<string, FrameArtwork>;',
    '',
    'export type FrameId = keyof typeof FRAME_ARTWORK;',
    '',
  ];
  const manifestPath = path.join(FRAMES_DIR, 'manifest.ts');
  const formatted = await format(lines.join('\n'), {
    ...(await resolveConfig(manifestPath)),
    filepath: manifestPath,
  });
  fs.writeFileSync(manifestPath, formatted);
};

const writeNotice = async (records: Record<string, FrameRecord>) => {
  const apache = fs.readFileSync(
    await download(
      'https://www.apache.org/licenses/LICENSE-2.0.txt',
      path.join(CACHE_DIR, 'LICENSE-2.0.txt')
    ),
    'utf8'
  );
  const bsd = fs.readFileSync(
    await download(
      `https://raw.githubusercontent.com/ChromeDevTools/devtools-frontend/${DEVTOOLS_COMMIT}/LICENSE`,
      path.join(CACHE_DIR, 'devtools', DEVTOOLS_COMMIT, 'LICENSE')
    ),
    'utf8'
  );
  const ids = FRAMES.map((spec) => spec.id).filter((id) => records[id] !== undefined);
  const bySource = (source: FrameSpec['source']) =>
    ids
      .filter((id) => records[id].source === source)
      .map((id) => {
        const {credit, name} = records[id];
        return `- \`${id}.webp\` (${name}) — ${credit.work} by ${credit.author}, [${credit.license}](${credit.licenseUrl}) — <${credit.url}>. Changes: ${credit.changes}.`;
      })
      .join('\n');
  const text = `# Device frame artwork — third-party notices

GENERATED by \`.erb/scripts/device-frames/generate.ts\`; do not edit.

The device frames in this directory are derived from third-party artwork and
are redistributed under the licences below (they are not covered by the app's
MIT licence). Each entry names the original work, its author and licence, and
what was changed. See \`.erb/scripts/device-frames/sources.ts\` for the exact
pinned commits and file hashes.

## ${SOURCES.aosp.name}

${SOURCES.aosp.copyright}. Licensed under the Apache License, Version 2.0.
Source tree: <${SOURCES.aosp.url}> (commit \`${AOSP_COMMIT}\`).

${bySource('aosp')}

## ${SOURCES['chrome-devtools'].name}

${SOURCES['chrome-devtools'].copyright}. Licensed under the BSD 3-Clause License.
Source tree: <${SOURCES['chrome-devtools'].url}>.

${bySource('chrome-devtools')}

## ${SOURCES['wikimedia-commons'].name}

Individual files under the Creative Commons licence stated for each. CC BY-SA
frames are adaptations of the listed works and are themselves available under
the same CC BY-SA licence.

${bySource('wikimedia-commons')}

---

## Apache License, Version 2.0

\`\`\`
${apache.trim()}
\`\`\`

## BSD 3-Clause License (Chromium)

\`\`\`
${bsd.trim()}
\`\`\`
`;
  fs.writeFileSync(path.join(FRAMES_DIR, 'NOTICE.md'), text);
};

// ---------------------------------------------------------------------------

const main = async () => {
  const onlyArg = process.argv.find((arg) => arg.startsWith('--only'));
  const only =
    onlyArg === undefined
      ? null
      : new Set(
          (onlyArg.split('=')[1] ?? process.argv[process.argv.indexOf(onlyArg) + 1]).split(',')
        );
  const specs = FRAMES.filter((spec) => only === null || only.has(spec.id));
  if (specs.length === 0) {
    throw new Error('no frames selected');
  }
  const duplicate = FRAMES.map((s) => s.id).find((id, i, all) => all.indexOf(id) !== i);
  if (duplicate !== undefined) {
    throw new Error(`duplicate frame id ${duplicate}`);
  }

  fs.mkdirSync(ASSETS_DIR, {recursive: true});
  const records: Record<string, FrameRecord> = fs.existsSync(INDEX_FILE)
    ? (JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8')) as Record<string, FrameRecord>)
    : {};

  const browser = await chromium.launch({executablePath: process.env.PLAYWRIGHT_CHROMIUM});
  const page = await browser.newPage();
  sizingPage = page;
  await page.setContent('<!doctype html><title>device frames</title>');
  // tsx/esbuild wraps named functions in a `__name` helper that Playwright's
  // serialized page functions would otherwise reference undefined.
  await page.evaluate('window.__name = (fn) => fn');

  const failures: string[] = [];
  for (const spec of specs) {
    try {
      const {job, orientation, screenRadius, credit} = await buildJob(spec);
      const result = await page.evaluate(renderInPage, job);
      if (!result.ok) {
        throw new Error(result.error);
      }
      const file = path.join(ASSETS_DIR, `${spec.id}.webp`);
      fs.writeFileSync(file, Buffer.from(result.webp.split(',')[1], 'base64'));
      const s = job.scale;
      records[spec.id] = {
        name: spec.name,
        source: spec.source,
        width: result.width,
        height: result.height,
        screen: {
          x: round(job.screen.x * s),
          y: round(job.screen.y * s),
          width: round(job.screen.width * s),
          height: round(job.screen.height * s),
        },
        screenRadius: round(screenRadius * s),
        orientation,
        credit,
      };
      const kb = Math.round(fs.statSync(file).size / 1024);
      console.log(
        `✓ ${spec.id.padEnd(20)} ${String(result.width).padStart(5)}×${String(result.height).padEnd(5)} ${String(kb).padStart(4)} KB${result.warnings.map((w) => `\n    ! ${w}`).join('')}`
      );
    } catch (error) {
      failures.push(spec.id);
      console.error(`✗ ${spec.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  await browser.close();

  // Drop frames that left sources.ts.
  const known = new Set(FRAMES.map((spec) => spec.id));
  Object.keys(records).forEach((id) => {
    if (!known.has(id)) {
      delete records[id];
      fs.rmSync(path.join(ASSETS_DIR, `${id}.webp`), {force: true});
    }
  });
  fs.writeFileSync(INDEX_FILE, `${JSON.stringify(records, null, 2)}\n`);
  await writeManifest(records);
  await writeNotice(records);

  const total = Object.keys(records).reduce(
    (sum, id) => sum + fs.statSync(path.join(ASSETS_DIR, `${id}.webp`)).size,
    0
  );
  console.log(`\n${Object.keys(records).length} frames, ${Math.round(total / 1024)} KB of WebP`);
  if (failures.length > 0) {
    console.error(`\n${failures.length} failed: ${failures.join(', ')}`);
    process.exitCode = 1;
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
