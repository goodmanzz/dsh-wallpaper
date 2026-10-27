/*
 * Host half of the desktop-wallpaper bundle.
 *
 * The browser cannot read the Windows desktop wallpaper, so this half exposes
 * two local HTTP routes: one metadata endpoint and one image endpoint. The
 * Client half polls the metadata endpoint; when the wallpaper file changes,
 * only the cache-busting URL changes and the browser fetches the new image.
 */

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { basename, join } from 'node:path';

export const inject = ['webServer'];

const INFO_PATH = '/dsh-wallpaper/info';
const IMAGE_PATH = '/dsh-wallpaper/image';
const CUSTOM_PATH = '/dsh-wallpaper/custom';
const VIDEO_INFO_PATH = '/dsh-wallpaper/video/info';
const VIDEO_PATH = '/dsh-wallpaper/video';
const VIDEO_UPLOAD_PATH = '/dsh-wallpaper/video/upload';
const MAX_BYTES = 48 * 1024 * 1024;
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
const DATA_DIR = join(
  process.env.DSH_PROFILE_DIR ?? join(process.env.USERPROFILE ?? '', '.dsh'),
  'storage',
  'dsh-wallpaper',
);
const CUSTOM_FILE = join(DATA_DIR, 'custom.img');
const CUSTOM_META = join(DATA_DIR, 'custom.json');
const VIDEO_FILE = join(DATA_DIR, 'custom-video.bin');
const VIDEO_META = join(DATA_DIR, 'custom-video.json');
const TRANSCODED_WALLPAPER = join(
  process.env.APPDATA ?? join(process.env.USERPROFILE ?? '', 'AppData', 'Roaming'),
  'Microsoft',
  'Windows',
  'Themes',
  'TranscodedWallpaper',
);

let imageCache = { key: '', bytes: null, mime: '' };

/**
 * Decode `reg.exe` console output. Windows command-line tools inherit the
 * console code page, which is GBK on a Simplified-Chinese system and not UTF-8.
 * @param buffer - raw stdout bytes.
 * @returns decoded text.
 */
function decodeRegistryOutput(buffer) {
  try {
    return new TextDecoder('gbk').decode(buffer);
  } catch {
    return buffer.toString('utf8');
  }
}

/**
 * Read one registry string value through reg.exe.
 * @param key - full HKEY_CURRENT_USER key path.
 * @param name - value name.
 * @returns the unquoted value, or undefined when absent/unreadable.
 */
function readRegistryValue(key, name) {
  try {
    const stdout = execFileSync('reg.exe', ['query', key, '/v', name], {
      windowsHide: true,
      timeout: 4000,
      maxBuffer: 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const text = decodeRegistryOutput(stdout);
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = new RegExp(`\\s${escaped}\\s+REG_[A-Z0-9_]+\\s+(.+?)\\s*$`, 'mi').exec(text);
    if (!match) return undefined;
    const value = match[1].trim();
    return value.startsWith('"') && value.endsWith('"') ? value.slice(1, -1) : value;
  } catch {
    return undefined;
  }
}

/**
 * Candidate wallpaper files, best first. The registry WallPaper value usually
 * points at the original file; TranscodedWallpaper is the current desktop's
 * rendered copy and is used when the original has moved or a slideshow advanced.
 * @returns unique absolute candidate paths.
 */
function candidateWallpapers() {
  if (process.platform !== 'win32') return [];
  const candidates = [];
  const configured = readRegistryValue('HKCU\\Control Panel\\Desktop', 'WallPaper');
  if (configured) candidates.push(configured);
  candidates.push(TRANSCODED_WALLPAPER);
  const history = readRegistryValue(
    'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Wallpapers',
    'BackgroundHistoryPath0',
  );
  if (history) candidates.push(history);
  return [...new Set(candidates.map((value) => value.trim()).filter(Boolean))];
}

/**
 * Build the public metadata shape shared by desktop and custom wallpapers.
 * @param chosen - selected path, stat and source-specific fields.
 * @returns serializable wallpaper metadata with a cache-busting ETag.
 */
function wallpaperInfo(chosen) {
  const pathHash = createHash('sha1').update(chosen.file).digest('hex').slice(0, 8);
  const etag = `${chosen.stat.size.toString(16)}-${Math.floor(chosen.stat.mtimeMs).toString(16)}-${pathHash}`;
  return {
    available: true,
    name: chosen.name,
    path: chosen.file,
    etag,
    bytes: chosen.stat.size,
    modifiedAt: Math.floor(chosen.stat.mtimeMs),
    source: chosen.source,
  };
}

/**
 * Resolve a user-uploaded wallpaper. The sidecar metadata is written by this
 * plugin, so its MIME type is trusted only after checking it is displayable.
 * @returns custom wallpaper metadata, or undefined when absent/invalid.
 */
function resolveCustomWallpaper() {
  try {
    const meta = JSON.parse(readFileSync(CUSTOM_META, 'utf8'));
    if (meta === null || typeof meta !== 'object') return undefined;
    if (typeof meta.mime !== 'string' || !meta.mime.startsWith('image/')) return undefined;
    const stat = statSync(CUSTOM_FILE);
    if (!stat.isFile() || stat.size <= 0 || stat.size > MAX_BYTES) return undefined;
    const name = typeof meta.name === 'string' && meta.name.trim() !== '' ? meta.name : 'custom-wallpaper';
    return { file: CUSTOM_FILE, stat, name, source: 'custom' };
  } catch {
    return undefined;
  }
}

/**
 * Resolve the active wallpaper, preferring a user-uploaded image over the
 * current Windows desktop wallpaper.
 * @returns metadata for the selected file.
 * @throws when no candidate is a readable, bounded regular file.
 */
function resolveWallpaper() {
  const custom = resolveCustomWallpaper();
  if (custom !== undefined) return wallpaperInfo(custom);

  let chosen;
  for (const file of candidateWallpapers()) {
    try {
      const stat = statSync(file);
      if (!stat.isFile() || stat.size <= 0 || stat.size > MAX_BYTES) continue;
      if (chosen === undefined) {
        chosen = { file, stat };
        continue;
      }
      // TranscodedWallpaper is newer than the original when a slideshow or
      // Windows theme has advanced; prefer it only in that case.
      if (file === TRANSCODED_WALLPAPER && stat.mtimeMs > chosen.stat.mtimeMs + 2000) {
        chosen = { file, stat };
      }
    } catch {
      // A stale registry entry is normal; try the next candidate.
    }
  }
  if (chosen === undefined) throw new Error('No readable desktop wallpaper was found.');
  return wallpaperInfo({ ...chosen, name: basename(chosen.file), source: 'desktop' });
}

/**
 * Resolve the uploaded video and its sidecar metadata.
 * @returns video metadata, or undefined when absent/invalid.
 */
function resolveVideo() {
  try {
    const meta = JSON.parse(readFileSync(VIDEO_META, 'utf8'));
    if (meta === null || typeof meta !== 'object') return undefined;
    if (typeof meta.mime !== 'string' || !meta.mime.startsWith('video/')) return undefined;
    const stat = statSync(VIDEO_FILE);
    if (!stat.isFile() || stat.size <= 0 || stat.size > MAX_VIDEO_BYTES) return undefined;
    const name = typeof meta.name === 'string' && meta.name.trim() !== '' ? meta.name : 'custom-video';
    return { file: VIDEO_FILE, stat, name, mime: meta.mime, source: 'video' };
  } catch {
    return undefined;
  }
}

/**
 * Public metadata for the video route. Missing video is a normal empty state.
 * @returns serializable video metadata.
 */
function videoInfo() {
  const video = resolveVideo();
  if (video === undefined) return { available: false, source: 'video' };
  const pathHash = createHash('sha1').update(video.file).digest('hex').slice(0, 8);
  const etag = `${video.stat.size.toString(16)}-${Math.floor(video.stat.mtimeMs).toString(16)}-${pathHash}`;
  return {
    available: true,
    name: video.name,
    path: video.file,
    etag,
    bytes: video.stat.size,
    modifiedAt: Math.floor(video.stat.mtimeMs),
    mime: video.mime,
    source: 'video',
  };
}

/**
 * Identify an image MIME type from its signature.
 * @param bytes - file bytes.
 * @returns a browser-displayable MIME type when known.
 */
function detectMime(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (bytes.length >= 12 && bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  if (bytes.length >= 6 && bytes.subarray(0, 3).toString('ascii') === 'GIF') return 'image/gif';
  if (bytes.length >= 2 && bytes[0] === 0x42 && bytes[1] === 0x4d) return 'image/bmp';
  if (bytes.length >= 12 && bytes.subarray(4, 8).toString('ascii') === 'ftyp') {
    const brand = bytes.subarray(8, 12).toString('ascii');
    if (brand === 'avif' || brand === 'avis') return 'image/avif';
  }
  return 'application/octet-stream';
}

/**
 * Identify a browser-playable video MIME type from its container signature.
 * MP4-family brands that are actually still images are rejected.
 * @param bytes - first bytes of the upload.
 * @returns a video MIME type, or empty when unsupported.
 */
function detectVideoMime(bytes) {
  if (
    bytes.length >= 12 &&
    bytes.subarray(4, 8).toString('ascii') === 'ftyp'
  ) {
    const brand = bytes.subarray(8, 12).toString('ascii');
    if (brand === 'avif' || brand === 'avis' || brand === 'heic' || brand === 'heix' || brand === 'mif1' || brand === 'msf1') {
      return '';
    }
    return 'video/mp4';
  }
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x1a &&
    bytes[1] === 0x45 &&
    bytes[2] === 0xdf &&
    bytes[3] === 0xa3
  ) {
    return 'video/webm';
  }
  if (bytes.length >= 4 && bytes.subarray(0, 4).toString('ascii') === 'OggS') return 'video/ogg';
  return '';
}

/**
 * Read the selected wallpaper once per path+mtime+size.
 * @param info - resolved wallpaper metadata.
 * @returns cached bytes and MIME type.
 */
function readWallpaperBuffer(info) {
  const key = `${info.path}|${info.etag}`;
  if (imageCache.key !== key) {
    const bytes = readFileSync(info.path);
    imageCache = { key, bytes, mime: detectMime(bytes) };
  }
  return imageCache;
}

/**
 * Write a small JSON response.
 * @param res - Node response.
 * @param status - HTTP status.
 * @param value - JSON-serializable value.
 */
function sendJson(res, status, value) {
  const body = Buffer.from(JSON.stringify(value));
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': body.length,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(body);
}

/**
 * Metadata route. Always answers 200 with `available: false` when Windows has
 * no readable wallpaper, so the Client can render a useful empty state.
 * @param req - Node request.
 * @param res - Node response.
 */
function handleInfo(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendJson(res, 405, { available: false, error: 'Method not allowed.' });
    return;
  }
  try {
    const info = resolveWallpaper();
    sendJson(res, 200, info);
  } catch (error) {
    sendJson(res, 200, { available: false, error: String(error?.message ?? error) });
  }
}

/**
 * Image route. Serves the current wallpaper with no caching, using the ETag in
 * the Client's URL as the cache key.
 * @param req - Node request.
 * @param res - Node response.
 */
function handleImage(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendJson(res, 405, { available: false, error: 'Method not allowed.' });
    return;
  }
  try {
    const info = resolveWallpaper();
    const cached = readWallpaperBuffer(info);
    res.writeHead(200, {
      'Content-Type': cached.mime,
      'Content-Length': cached.bytes.length,
      'Cache-Control': 'no-store',
      ETag: `"${info.etag}"`,
      'X-Content-Type-Options': 'nosniff',
    });
    if (req.method === 'HEAD') res.end();
    else res.end(cached.bytes);
  } catch (error) {
    sendJson(res, 404, { available: false, error: String(error?.message ?? error) });
  }
}

/**
 * Metadata route for the uploaded video.
 * @param req - Node request.
 * @param res - Node response.
 */
function handleVideoInfo(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendJson(res, 405, { available: false, error: 'Method not allowed.' });
    return;
  }
  sendJson(res, 200, videoInfo());
}

/**
 * Serve the uploaded video with byte-range support so the browser can loop
 * and seek without downloading the whole file again.
 * @param req - Node request.
 * @param res - Node response.
 */
function handleVideo(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendJson(res, 405, { available: false, error: 'Method not allowed.' });
    return;
  }
  try {
    const info = videoInfo();
    if (info.available !== true) throw new Error('No custom video was found.');
    const total = info.bytes;
    let start = 0;
    let end = total - 1;
    let status = 200;
    let contentRange;
    const range = req.headers.range;
    if (typeof range === 'string' && range !== '') {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
      if (match === null) {
        res.writeHead(416, { 'Content-Range': `bytes */${total}` });
        res.end();
        return;
      }
      const rawStart = match[1];
      const rawEnd = match[2];
      if (rawStart === '') {
        const suffix = Number(rawEnd);
        if (!Number.isFinite(suffix) || suffix <= 0) {
          res.writeHead(416, { 'Content-Range': `bytes */${total}` });
          res.end();
          return;
        }
        start = Math.max(0, total - suffix);
      } else {
        start = Number(rawStart);
        end = rawEnd === '' ? total - 1 : Math.min(Number(rawEnd), total - 1);
      }
      if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || start >= total || end < start) {
        res.writeHead(416, { 'Content-Range': `bytes */${total}` });
        res.end();
        return;
      }
      status = 206;
      contentRange = `bytes ${String(start)}-${String(end)}/${String(total)}`;
    }

    const headers = {
      'Content-Type': info.mime,
      'Content-Length': end - start + 1,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-store',
      ETag: `"${info.etag}"`,
      'X-Content-Type-Options': 'nosniff',
    };
    if (contentRange !== undefined) headers['Content-Range'] = contentRange;
    res.writeHead(status, headers);
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    const stream = createReadStream(info.path, { start, end });
    stream.on('error', () => res.destroy());
    stream.pipe(res);
  } catch (error) {
    sendJson(res, 404, { available: false, error: String(error?.message ?? error) });
  }
}

/**
 * Read a bounded request body. Oversized bodies are drained rather than
 * buffered so the caller can answer 413 without leaving the socket stuck.
 * @param req - Node request.
 * @param limit - maximum byte count.
 * @returns request bytes.
 */
function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    let tooLarge = false;
    req.on('data', (chunk) => {
      if (tooLarge) return;
      total += chunk.length;
      if (total > limit) {
        tooLarge = true;
        chunks.length = 0;
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (tooLarge) reject(new Error('The image is larger than the 48 MB limit.'));
      else resolve(Buffer.concat(chunks));
    });
    req.on('error', reject);
  });
}

/**
 * Keep the original filename only as display metadata; the stored path is
 * fixed and never derived from user input.
 * @param value - raw filename.
 * @returns a short, path-safe display name.
 */
function safeDisplayName(value) {
  const raw = typeof value === 'string' ? value : '';
  const name = basename(raw)
    .replace(/[\u0000-\u001f<>:"/\\|?*]/g, '_')
    .trim()
    .slice(0, 160);
  return name === '' ? 'custom-wallpaper' : name;
}

/**
 * Persist the uploaded image and its sidecar metadata atomically enough for
 * the next metadata/image request to see a complete file.
 * @param bytes - validated image bytes.
 * @param mime - detected image MIME type.
 * @param name - display filename.
 * @returns resolved custom wallpaper metadata.
 */
function saveCustomWallpaper(bytes, mime, name) {
  mkdirSync(DATA_DIR, { recursive: true });
  const temp = `${CUSTOM_FILE}.${process.pid}.${Date.now()}.tmp`;
  try {
    writeFileSync(temp, bytes, { mode: 0o600 });
    if (existsSync(CUSTOM_FILE)) unlinkSync(CUSTOM_FILE);
    renameSync(temp, CUSTOM_FILE);
    writeFileSync(
      CUSTOM_META,
      JSON.stringify({ name, mime, bytes: bytes.length, updatedAt: Date.now() }),
      { mode: 0o600 },
    );
  } catch (error) {
    try {
      if (existsSync(temp)) unlinkSync(temp);
    } catch {
      // The original error is more useful than cleanup failure.
    }
    throw error;
  }
  const info = resolveCustomWallpaper();
  if (info === undefined) throw new Error('The uploaded wallpaper could not be read back.');
  return info;
}

/** Remove the custom wallpaper and its metadata, restoring desktop mode. */
function clearCustomWallpaper() {
  for (const file of [CUSTOM_FILE, CUSTOM_META]) {
    try {
      if (existsSync(file)) unlinkSync(file);
    } catch {
      // An absent or locked file is harmless for the next resolve.
    }
  }
  imageCache = { key: '', bytes: null, mime: '' };
}

/**
 * Receive a video directly to a temporary file. Streaming avoids holding a
 * potentially large clip in memory while still enforcing the 200 MB cap.
 * @param req - Node request.
 * @param temp - destination temporary path.
 * @returns total bytes and the leading container signature.
 */
function receiveVideo(req, temp) {
  return new Promise((resolve, reject) => {
    const out = createWriteStream(temp, { mode: 0o600 });
    let total = 0;
    let header = Buffer.alloc(0);
    let tooLarge = false;
    let settled = false;
    const fail = (error) => {
      if (settled) return;
      settled = true;
      out.destroy();
      reject(error);
    };
    req.on('data', (chunk) => {
      if (tooLarge) return;
      total += chunk.length;
      if (total > MAX_VIDEO_BYTES) {
        tooLarge = true;
        req.resume();
        return;
      }
      if (header.length < 32) header = Buffer.concat([header, chunk.subarray(0, 32 - header.length)]);
      if (!out.write(chunk)) req.pause();
    });
    out.on('drain', () => req.resume());
    req.on('end', () => {
      if (tooLarge) {
        fail(new Error('The video is larger than the 200 MB limit.'));
        return;
      }
      if (total === 0) {
        fail(new Error('The video is empty.'));
        return;
      }
      out.end();
    });
    out.on('finish', () => {
      if (settled) return;
      settled = true;
      resolve({ total, header });
    });
    req.on('error', fail);
    out.on('error', fail);
  });
}

/**
 * Move a fully received video into place and write its sidecar metadata.
 * @param temp - temporary upload path.
 * @param total - byte count.
 * @param mime - detected video MIME type.
 * @param name - display filename.
 * @returns public video metadata.
 */
function saveCustomVideo(temp, total, mime, name) {
  if (existsSync(VIDEO_FILE)) unlinkSync(VIDEO_FILE);
  renameSync(temp, VIDEO_FILE);
  writeFileSync(
    VIDEO_META,
    JSON.stringify({ name, mime, bytes: total, updatedAt: Date.now() }),
    { mode: 0o600 },
  );
  const info = videoInfo();
  if (info.available !== true) throw new Error('The uploaded video could not be read back.');
  return info;
}

/** Remove the uploaded video and its metadata. */
function clearCustomVideo() {
  for (const file of [VIDEO_FILE, VIDEO_META]) {
    try {
      if (existsSync(file)) unlinkSync(file);
    } catch {
      // An absent or locked file is harmless for the next resolve.
    }
  }
}

/**
 * Upload or clear the custom video. POST accepts raw video bytes and verifies
 * the container signature; DELETE removes the video while keeping image mode.
 * @param req - Node request.
 * @param res - Node response.
 */
async function handleVideoUpload(req, res) {
  if (req.method === 'DELETE') {
    clearCustomVideo();
    sendJson(res, 200, { cleared: true });
    return;
  }
  if (req.method !== 'POST') {
    sendJson(res, 405, { available: false, error: 'Method not allowed.' });
    return;
  }

  const declared = Number(req.headers['content-length']);
  if (Number.isFinite(declared) && declared > MAX_VIDEO_BYTES) {
    req.resume();
    sendJson(res, 413, { available: false, error: 'The video is larger than the 200 MB limit.' });
    return;
  }

  mkdirSync(DATA_DIR, { recursive: true });
  const temp = `${VIDEO_FILE}.${process.pid}.${Date.now()}.tmp`;
  try {
    const received = await receiveVideo(req, temp);
    const mime = detectVideoMime(received.header);
    if (mime === '') {
      unlinkSync(temp);
      sendJson(res, 415, { available: false, error: 'Choose an MP4, WebM or Ogg video.' });
      return;
    }

    let header = req.headers['x-dsh-wallpaper-name'];
    if (Array.isArray(header)) header = header[0];
    let decoded = typeof header === 'string' ? header : '';
    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      // Keep the raw header when it is not URI-encoded.
    }

    const info = saveCustomVideo(temp, received.total, mime, safeDisplayName(decoded));
    sendJson(res, 200, info);
  } catch (error) {
    try {
      if (existsSync(temp)) unlinkSync(temp);
    } catch {
      // The original error is more useful than cleanup failure.
    }
    const message = String(error?.message ?? error);
    sendJson(res, message.includes('larger') ? 413 : 500, { available: false, error: message });
  }
}

/**
 * Upload or clear the custom wallpaper. POST accepts raw image bytes and uses
 * magic-number detection; DELETE restores the desktop wallpaper.
 * @param req - Node request.
 * @param res - Node response.
 */
async function handleCustom(req, res) {
  if (req.method === 'DELETE') {
    clearCustomWallpaper();
    sendJson(res, 200, { cleared: true });
    return;
  }
  if (req.method !== 'POST') {
    sendJson(res, 405, { available: false, error: 'Method not allowed.' });
    return;
  }

  const declared = Number(req.headers['content-length']);
  if (Number.isFinite(declared) && declared > MAX_BYTES) {
    req.resume();
    sendJson(res, 413, { available: false, error: 'The image is larger than the 48 MB limit.' });
    return;
  }

  let bytes;
  try {
    bytes = await readBody(req, MAX_BYTES);
  } catch (error) {
    sendJson(res, 413, { available: false, error: String(error?.message ?? error) });
    return;
  }
  if (bytes.length === 0) {
    sendJson(res, 400, { available: false, error: 'The image is empty.' });
    return;
  }

  const mime = detectMime(bytes);
  if (!mime.startsWith('image/')) {
    sendJson(res, 415, { available: false, error: 'Choose a JPEG, PNG, WebP, GIF, BMP or AVIF image.' });
    return;
  }

  let header = req.headers['x-dsh-wallpaper-name'];
  if (Array.isArray(header)) header = header[0];
  let decoded = typeof header === 'string' ? header : '';
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // Keep the raw header when it is not URI-encoded.
  }

  try {
    saveCustomWallpaper(bytes, mime, safeDisplayName(decoded));
    sendJson(res, 200, resolveWallpaper());
  } catch (error) {
    sendJson(res, 500, { available: false, error: String(error?.message ?? error) });
  }
}

/**
 * Register the wallpaper routes for the life of this plugin row.
 * @param ctx - Cordis host context.
 */
export function apply(ctx) {
  ctx.effect(
    () => ctx.webServer.register({ kind: 'exact', path: INFO_PATH, handler: handleInfo }),
    'desktop-wallpaper: info route',
  );
  ctx.effect(
    () => ctx.webServer.register({ kind: 'exact', path: IMAGE_PATH, handler: handleImage }),
    'desktop-wallpaper: image route',
  );
  ctx.effect(
    () => ctx.webServer.register({ kind: 'exact', path: CUSTOM_PATH, handler: handleCustom }),
    'desktop-wallpaper: custom route',
  );
  ctx.effect(
    () => ctx.webServer.register({ kind: 'exact', path: VIDEO_INFO_PATH, handler: handleVideoInfo }),
    'desktop-wallpaper: video info route',
  );
  ctx.effect(
    () => ctx.webServer.register({ kind: 'exact', path: VIDEO_PATH, handler: handleVideo }),
    'desktop-wallpaper: video route',
  );
  ctx.effect(
    () => ctx.webServer.register({ kind: 'exact', path: VIDEO_UPLOAD_PATH, handler: handleVideoUpload }),
    'desktop-wallpaper: video upload route',
  );
}
