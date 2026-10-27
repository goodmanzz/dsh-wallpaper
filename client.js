window.__ModuleLoader__.load({
  id: '@local/dsh-desktop-wallpaper',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'dsh-wallpaper';
    const PANEL_ID = 'desktop-wallpaper';
    const STORAGE_KEY = 'dsh-wallpaper.settings.v2';
    const LEGACY_STORAGE_KEY = 'dsh-wallpaper.settings.v1';
    const INFO_PATH = '/dsh-wallpaper/info';
    const IMAGE_PATH = '/dsh-wallpaper/image';
    const CUSTOM_PATH = '/dsh-wallpaper/custom';
    const VIDEO_INFO_PATH = '/dsh-wallpaper/video/info';
    const VIDEO_PATH = '/dsh-wallpaper/video';
    const VIDEO_UPLOAD_PATH = '/dsh-wallpaper/video/upload';
    const MAX_UPLOAD_BYTES = 48 * 1024 * 1024;
    const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
    const POLL_MS = 30000;

    /*
     * Surface tints sampled from common open-source editor themes: GitHub
     * Primer, Solarized, Gruvbox, Nord, Dracula and Catppuccin. Five light and
     * five dark choices keep the palette useful in either DSH theme.
     */
    const MASK_COLORS = Object.freeze([
      { value: '#ffffff', en: 'Snow', zh: '纯白' },
      { value: '#f6f8fa', en: 'GitHub Light', zh: 'GitHub 浅' },
      { value: '#fdf6e3', en: 'Solarized Light', zh: 'Solarized 浅' },
      { value: '#fbf1c7', en: 'Gruvbox Light', zh: 'Gruvbox 浅' },
      { value: '#eff1f5', en: 'Catppuccin Latte', zh: 'Catppuccin 浅' },
      { value: '#0d1117', en: 'GitHub Dark', zh: 'GitHub 深' },
      { value: '#002b36', en: 'Solarized Dark', zh: 'Solarized 深' },
      { value: '#2e3440', en: 'Nord', zh: 'Nord' },
      { value: '#282a36', en: 'Dracula', zh: 'Dracula' },
      { value: '#1e1e2e', en: 'Catppuccin Mocha', zh: 'Catppuccin 深' },
    ]);
    const MASK_COLOR_VALUES = new Set(MASK_COLORS.map((entry) => entry.value));

    const DEFAULTS = Object.freeze({
      enabled: true,
      mode: 'image',
      opacity: 0.95,
      maskOpacity: 0.6,
      maskColor: '#ffffff',
      blur: 2,
      sidebarOpacity: 0.42,
    });

    const EN = {
      eyebrow: 'APPEARANCE',
      title: 'Desktop Wallpaper',
      subtitle: 'The current Windows wallpaper, a custom image or a looping video fills the whole window — sidebar, conversation and every column share one continuous background.',
      enabled: 'Wallpaper background',
      preview: 'Live preview',
      refresh: 'Refresh',
      refreshing: 'Refreshing…',
      reset: 'Reset to defaults',
      loading: 'Reading desktop wallpaper…',
      unavailable: 'No readable desktop wallpaper was found.',
      appearance: 'Picture',
      opacity: 'Wallpaper opacity',
      opacityHint: 'Lower values reveal more of the theme base color.',
      mask: 'Mask strength',
      maskHint: 'A full-window veil keeps labels readable over busy images.',
      blur: 'Wallpaper blur',
      blurHint: 'Softens only the image; the interface stays sharp.',
      maskColor: 'Mask color',
      maskColorHint: 'Common open-source theme tints; light tints suit light themes, dark tints suit dark themes.',
      maskGlass: 'Mask & interface',
      sidebar: 'Sidebar glass',
      sidebarHint: 'Tint behind the left sidebar; lower is clearer.',
      wallpaperType: 'Wallpaper type',
      imageMode: 'Image',
      videoMode: 'Video',
      customWallpaper: 'Custom wallpaper',
      customHint: 'Choose a local image to replace the current Windows desktop wallpaper (max 48 MB).',
      chooseImage: 'Choose image',
      videoWallpaper: 'Custom video',
      videoHint: 'Choose an MP4, WebM or Ogg clip (max 200 MB). Video and image wallpapers are mutually exclusive.',
      chooseVideo: 'Choose video',
      removeVideo: 'Remove video',
      applying: 'Applying…',
      useDesktop: 'Use desktop wallpaper',
      customUpdated: 'Custom wallpaper applied.',
      desktopRestored: 'Desktop wallpaper restored.',
      customFailed: 'The custom wallpaper could not be applied.',
      videoUpdated: 'Video wallpaper applied.',
      videoRemoved: 'Video wallpaper removed.',
      videoFailed: 'The video wallpaper could not be applied.',
      videoLoading: 'Reading video wallpaper…',
      videoUnavailable: 'No video selected.',
      coverage: 'One continuous layer behind the sidebar, conversation and right column.',
      saved: 'Settings are saved in this browser.',
      updated: 'Wallpaper refreshed.',
      refreshFailed: 'The wallpaper could not be refreshed.',
    };

    const ZH = {
      eyebrow: '外观',
      title: '桌面壁纸',
      subtitle: '当前 Windows 桌面壁纸、自定义图片或循环视频会铺满整个窗口——左侧栏、会话区和右侧栏共用同一张连续背景。',
      enabled: '壁纸背景',
      preview: '实时预览',
      refresh: '刷新',
      refreshing: '刷新中…',
      reset: '恢复默认',
      loading: '正在读取桌面壁纸…',
      unavailable: '没有找到可读取的桌面壁纸。',
      appearance: '画面',
      opacity: '壁纸不透明度',
      opacityHint: '数值越低，透出的主题底色越多。',
      mask: '遮罩浓度',
      maskHint: '全窗口蒙层，让复杂图片上的文字保持清晰。',
      blur: '壁纸模糊',
      blurHint: '只柔化壁纸本身，不影响界面清晰度。',
      maskColor: '遮罩配色',
      maskColorHint: '取自常见开源主题的表面色；浅色配浅色主题，深色配深色主题更协调。',
      maskGlass: '遮罩与界面',
      sidebar: '侧栏玻璃',
      sidebarHint: '左侧栏背后的着色浓度，越低越通透。',
      wallpaperType: '壁纸类型',
      imageMode: '图片',
      videoMode: '视频',
      customWallpaper: '自定义壁纸',
      customHint: '选择本地图片，替换当前 Windows 桌面壁纸（最大 48 MB）。',
      chooseImage: '选择图片',
      videoWallpaper: '自定义视频',
      videoHint: '选择 MP4、WebM 或 Ogg 视频（最大 200 MB）；视频和图片壁纸只能二选一。',
      chooseVideo: '选择视频',
      removeVideo: '移除视频',
      applying: '应用中…',
      useDesktop: '恢复桌面壁纸',
      customUpdated: '已应用自定义壁纸。',
      desktopRestored: '已恢复桌面壁纸。',
      customFailed: '自定义壁纸应用失败。',
      videoUpdated: '已应用视频壁纸。',
      videoRemoved: '已移除视频壁纸。',
      videoFailed: '视频壁纸应用失败。',
      videoLoading: '正在读取视频壁纸…',
      videoUnavailable: '还没有选择视频。',
      coverage: '同一层背景贯穿左侧栏、会话区和右侧栏。',
      saved: '设置自动保存在当前浏览器。',
      updated: '壁纸已刷新。',
      refreshFailed: '壁纸刷新失败。',
    };

    const LEXICONS = { en: EN, zh: ZH };

    let settings = { ...DEFAULTS };
    let imageState = {
      status: 'loading',
      available: false,
      etag: '',
      name: '',
      path: '',
      bytes: 0,
      modifiedAt: 0,
      source: '',
      error: '',
    };
    let videoState = {
      status: 'loading',
      available: false,
      etag: '',
      name: '',
      path: '',
      bytes: 0,
      modifiedAt: 0,
      mime: '',
      error: '',
    };
    let videoEl = null;
    let translate = (key) => key;
    let localeSubscribe = () => () => {};
    let refreshPromise = null;

    const settingListeners = new Set();
    const imageListeners = new Set();
    const videoListeners = new Set();

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    }

    function normalizeMaskColor(value) {
      const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
      return MASK_COLOR_VALUES.has(normalized) ? normalized : DEFAULTS.maskColor;
    }

    function normalizeSettings(input) {
      const next = { ...DEFAULTS };
      if (input === null || typeof input !== 'object') return next;
      if (typeof input.enabled === 'boolean') next.enabled = input.enabled;
      if (input.mode === 'image' || input.mode === 'video') next.mode = input.mode;
      const opacity = Number(input.opacity);
      if (Number.isFinite(opacity)) next.opacity = clamp(opacity, 0, 1);
      const maskOpacity = Number(input.maskOpacity);
      if (Number.isFinite(maskOpacity)) next.maskOpacity = clamp(maskOpacity, 0, 1);
      next.maskColor = normalizeMaskColor(input.maskColor);
      const blur = Number(input.blur);
      if (Number.isFinite(blur)) next.blur = clamp(blur, 0, 30);
      const sidebarOpacity = Number(input.sidebarOpacity);
      if (Number.isFinite(sidebarOpacity)) next.sidebarOpacity = clamp(sidebarOpacity, 0, 1);
      return next;
    }

    function loadSettings() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw !== null) return normalizeSettings(JSON.parse(raw));
        const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacyRaw !== null) {
          const legacy = JSON.parse(legacyRaw);
          const next = normalizeSettings(legacy);
          const legacyMask = Number(legacy?.maskOpacity);
          if (!Number.isFinite(legacyMask) || Math.abs(legacyMask - 0.28) < 0.001) {
            next.maskOpacity = DEFAULTS.maskOpacity;
          }
          try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch {
            // The migration is complete for this session even if storage is read-only.
          }
          return next;
        }
        return { ...DEFAULTS };
      } catch {
        return { ...DEFAULTS };
      }
    }

    function persistSettings() {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch {
        // Private mode or a full quota must not break the background.
      }
    }

    function emitSettings() {
      for (const listener of [...settingListeners]) {
        try {
          listener();
        } catch {
          // One broken subscriber must not stop the others.
        }
      }
    }

    function subscribeSettings(listener) {
      settingListeners.add(listener);
      return () => settingListeners.delete(listener);
    }

    function emitImage() {
      for (const listener of [...imageListeners]) {
        try {
          listener();
        } catch {
          // Keep notifying the remaining views.
        }
      }
    }

    function subscribeImage(listener) {
      imageListeners.add(listener);
      return () => imageListeners.delete(listener);
    }

    function emitVideo() {
      for (const listener of [...videoListeners]) {
        try {
          listener();
        } catch {
          // Keep notifying the remaining views.
        }
      }
    }

    function subscribeVideo(listener) {
      videoListeners.add(listener);
      return () => videoListeners.delete(listener);
    }

    let titlebarEnabledState = null;

    function applyRootSettings() {
      const root = document.documentElement;
      if (root === null) return;
      root.toggleAttribute('data-dshwp-enabled', settings.enabled);
      root.toggleAttribute('data-dshwp-paused', !settings.enabled);
      root.dataset.dshwpMode = settings.mode;
      root.style.setProperty('--dshwp-wallpaper-opacity', String(settings.opacity));
      root.style.setProperty('--dshwp-mask-opacity', String(settings.maskOpacity));
      root.style.setProperty('--dshwp-mask-color', settings.maskColor);
      root.style.setProperty('--dshwp-blur', `${settings.blur}px`);
      root.style.setProperty('--dshwp-sidebar-strength', `${Math.round(settings.sidebarOpacity * 100)}%`);

      /*
       * The desktop preload measures a hidden probe's computed background to
       * tint the native Windows caption buttons. Touch body.style so its
       * MutationObserver re-sends the transparent probe when this plugin is
       * switched on or off.
       */
      if (document.body !== null && root.hasAttribute('data-windows-titlebar') && titlebarEnabledState !== settings.enabled) {
        titlebarEnabledState = settings.enabled;
        document.body.style.setProperty('--dshwp-titlebar-sync', String(Date.now()));
      }
      applyVideoUrl();
    }

    function applyImageUrl() {
      const root = document.documentElement;
      if (root === null) return;
      if (imageState.status === 'ready' && imageState.available) {
        const version = encodeURIComponent(imageState.etag === '' ? String(Date.now()) : imageState.etag);
        root.style.setProperty('--dshwp-image', `url("${IMAGE_PATH}?v=${version}")`);
      } else {
        root.style.setProperty('--dshwp-image', 'none');
      }
    }

    function applyVideoUrl() {
      const root = document.documentElement;
      if (root === null) return;
      const active =
        settings.enabled &&
        settings.mode === 'video' &&
        videoState.status === 'ready' &&
        videoState.available;
      root.toggleAttribute('data-dshwp-video', active);
      if (videoEl === null) return;
      if (!active) {
        videoEl.pause();
        if (videoEl.dataset.dshwpVersion !== undefined) {
          videoEl.removeAttribute('src');
          delete videoEl.dataset.dshwpVersion;
          videoEl.load();
        }
        return;
      }
      const version = encodeURIComponent(videoState.etag === '' ? String(Date.now()) : videoState.etag);
      if (videoEl.dataset.dshwpVersion !== version) {
        videoEl.dataset.dshwpVersion = version;
        videoEl.src = `${VIDEO_PATH}?v=${version}`;
        videoEl.load();
      }
      void videoEl.play().catch(() => {
        // Autoplay can be blocked until the first user gesture; the poster-free
        // layer stays hidden until the browser allows playback.
      });
    }

    function setImageState(next) {
      imageState = next;
      applyImageUrl();
      emitImage();
    }

    function setVideoState(next) {
      videoState = next;
      applyVideoUrl();
      emitVideo();
    }

    function setSettings(patch) {
      settings = normalizeSettings({ ...settings, ...patch });
      persistSettings();
      applyRootSettings();
      emitSettings();
    }

    function resetSettings() {
      settings = { ...DEFAULTS };
      persistSettings();
      applyRootSettings();
      emitSettings();
    }

    async function refreshImageInfo() {
      try {
        const response = await window.fetch(INFO_PATH, {
          cache: 'no-store',
          credentials: 'same-origin',
        });
        if (!response.ok) throw new Error(`HTTP ${String(response.status)}`);
        const data = await response.json();
        if (data === null || typeof data !== 'object' || data.available !== true) {
          setImageState({
            status: 'unavailable',
            available: false,
            etag: '',
            name: '',
            path: '',
            bytes: 0,
            modifiedAt: 0,
            source: '',
            error: data !== null && typeof data === 'object' && typeof data.error === 'string' ? data.error : '',
          });
          return false;
        }
        const next = {
          status: 'ready',
          available: true,
          etag: String(data.etag ?? ''),
          name: String(data.name ?? ''),
          path: String(data.path ?? ''),
          bytes: Number(data.bytes) || 0,
          modifiedAt: Number(data.modifiedAt) || 0,
          source: String(data.source ?? 'desktop'),
          error: '',
        };
        if (
          imageState.status !== 'ready' ||
          imageState.etag !== next.etag ||
          imageState.path !== next.path ||
          imageState.source !== next.source
        ) {
          setImageState(next);
        }
        return true;
      } catch (error) {
        setImageState({
          status: 'error',
          available: false,
          etag: '',
          name: '',
          path: '',
          bytes: 0,
          modifiedAt: 0,
          source: '',
          error: String(error?.message ?? error),
        });
        return false;
      }
    }

    async function refreshVideoInfo() {
      try {
        const response = await window.fetch(VIDEO_INFO_PATH, {
          cache: 'no-store',
          credentials: 'same-origin',
        });
        if (!response.ok) throw new Error(`HTTP ${String(response.status)}`);
        const data = await response.json();
        if (data === null || typeof data !== 'object' || data.available !== true) {
          setVideoState({
            status: 'unavailable',
            available: false,
            etag: '',
            name: '',
            path: '',
            bytes: 0,
            modifiedAt: 0,
            mime: '',
            error: data !== null && typeof data === 'object' && typeof data.error === 'string' ? data.error : '',
          });
          return false;
        }
        const next = {
          status: 'ready',
          available: true,
          etag: String(data.etag ?? ''),
          name: String(data.name ?? ''),
          path: String(data.path ?? ''),
          bytes: Number(data.bytes) || 0,
          modifiedAt: Number(data.modifiedAt) || 0,
          mime: String(data.mime ?? ''),
          error: '',
        };
        if (
          videoState.status !== 'ready' ||
          videoState.etag !== next.etag ||
          videoState.path !== next.path ||
          videoState.mime !== next.mime
        ) {
          setVideoState(next);
        }
        return true;
      } catch (error) {
        setVideoState({
          status: 'error',
          available: false,
          etag: '',
          name: '',
          path: '',
          bytes: 0,
          modifiedAt: 0,
          mime: '',
          error: String(error?.message ?? error),
        });
        return false;
      }
    }

    async function refreshWallpaper() {
      if (refreshPromise !== null) return refreshPromise;
      refreshPromise = (async () => {
        const [imageOk, videoOk] = await Promise.all([refreshImageInfo(), refreshVideoInfo()]);
        return imageOk || videoOk;
      })();
      try {
        return await refreshPromise;
      } finally {
        refreshPromise = null;
      }
    }

    async function applyCustomWallpaper(file) {
      if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) return false;
      try {
        const response = await window.fetch(CUSTOM_PATH, {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': file.type === '' ? 'application/octet-stream' : file.type,
            'X-DSH-Wallpaper-Name': encodeURIComponent(file.name),
          },
          body: file,
        });
        if (!response.ok) throw new Error(`HTTP ${String(response.status)}`);
        await refreshWallpaper();
        return imageState.status === 'ready' && imageState.available;
      } catch {
        return false;
      }
    }

    async function restoreDesktopWallpaper() {
      try {
        const response = await window.fetch(CUSTOM_PATH, {
          method: 'DELETE',
          credentials: 'same-origin',
        });
        if (!response.ok) throw new Error(`HTTP ${String(response.status)}`);
        await refreshWallpaper();
        return imageState.status === 'ready' && imageState.available;
      } catch {
        return false;
      }
    }

    async function applyCustomVideo(file) {
      if (file.size <= 0 || file.size > MAX_VIDEO_BYTES) return false;
      try {
        const response = await window.fetch(VIDEO_UPLOAD_PATH, {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': file.type === '' ? 'application/octet-stream' : file.type,
            'X-DSH-Wallpaper-Name': encodeURIComponent(file.name),
          },
          body: file,
        });
        if (!response.ok) throw new Error(`HTTP ${String(response.status)}`);
        await refreshWallpaper();
        return videoState.status === 'ready' && videoState.available;
      } catch {
        return false;
      }
    }

    async function clearCustomVideo() {
      try {
        const response = await window.fetch(VIDEO_UPLOAD_PATH, {
          method: 'DELETE',
          credentials: 'same-origin',
        });
        if (!response.ok) throw new Error(`HTTP ${String(response.status)}`);
        await refreshWallpaper();
        return true;
      } catch {
        return false;
      }
    }

    function useSettings() {
      const [snapshot, setSnapshot] = React.useState(settings);
      React.useEffect(() => {
        setSnapshot(settings);
        return subscribeSettings(() => setSnapshot(settings));
      }, []);
      return snapshot;
    }

    function useImageState() {
      const [snapshot, setSnapshot] = React.useState(imageState);
      React.useEffect(() => {
        setSnapshot(imageState);
        return subscribeImage(() => setSnapshot(imageState));
      }, []);
      return snapshot;
    }

    function useVideoState() {
      const [snapshot, setSnapshot] = React.useState(videoState);
      React.useEffect(() => {
        setSnapshot(videoState);
        return subscribeVideo(() => setSnapshot(videoState));
      }, []);
      return snapshot;
    }

    function useLocale() {
      const [, force] = React.useState(0);
      React.useEffect(() => localeSubscribe(() => force((value) => value + 1)), []);
    }

    function WallpaperIcon({ size = 18, active = false }) {
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: size,
          height: size,
          'aria-hidden': 'true',
          focusable: 'false',
          style: { display: 'block', pointerEvents: 'none' },
        },
        h('rect', {
          x: 2.8,
          y: 3.8,
          width: 18.4,
          height: 16.4,
          rx: 3,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.6,
          opacity: active ? 1 : 0.88,
        }),
        h('circle', { cx: 8.6, cy: 9.2, r: 1.7, fill: 'currentColor' }),
        h('path', {
          d: 'M4.8 17.1l4.6-4.4 3.2 3 3.1-3.1 3.5 3.5',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.6,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
        active
          ? h('circle', {
              cx: 19.3,
              cy: 4.7,
              r: 2.2,
              fill: 'var(--dsw-alias-brand-primary)',
            })
          : null,
      );
    }

    function Slider({ label, hint, value, min, max, step, display, onChange }) {
      const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;
      return h(
        'div',
        { className: 'dshwp-field' },
        h(
          'div',
          { className: 'dshwp-field-head' },
          h('span', { className: 'dshwp-label' }, label),
          h('span', { className: 'dshwp-value' }, display),
        ),
        h('input', {
          className: 'dshwp-range',
          type: 'range',
          min,
          max,
          step,
          value,
          'aria-label': label,
          style: { '--dshwp-pct': `${percent}%` },
          onChange: (event) => onChange(Number(event.target.value)),
        }),
        hint === undefined ? null : h('div', { className: 'dshwp-hint' }, hint),
      );
    }

    function isChineseLocale() {
      return String(document.documentElement.lang ?? '').toLowerCase().startsWith('zh');
    }

    function MaskPalette({ value, onChange }) {
      const chinese = isChineseLocale();
      return h(
        'div',
        { className: 'dshwp-palette', role: 'group', 'aria-label': translate('maskColor') },
        ...MASK_COLORS.map((entry) => {
          const active = value === entry.value;
          const label = chinese ? entry.zh : entry.en;
          return h(
            'button',
            {
              key: entry.value,
              type: 'button',
              className: `dshwp-swatch${active ? ' is-active' : ''}`,
              'aria-pressed': active,
              title: `${label} · ${entry.value}`,
              onClick: () => onChange(entry.value),
            },
            h('span', {
              className: 'dshwp-swatch-dot',
              style: { backgroundColor: entry.value },
            }),
            h('span', { className: 'dshwp-swatch-label' }, label),
          );
        }),
      );
    }

    function WallpaperPanel() {
      useLocale();
      const current = useSettings();
      const info = useImageState();
      const video = useVideoState();
      const [busy, setBusy] = React.useState(false);
      const [uploading, setUploading] = React.useState(false);
      const [notice, setNotice] = React.useState('');
      const fileInput = React.useRef(null);

      React.useEffect(() => {
        if (imageState.status === 'loading' || videoState.status === 'loading') void refreshWallpaper();
      }, []);

      React.useEffect(() => {
        if (notice === '') return undefined;
        const timer = window.setTimeout(() => setNotice(''), 4000);
        return () => window.clearTimeout(timer);
      }, [notice]);

      const videoMode = current.mode === 'video';
      const imageReady = info.status === 'ready' && info.available;
      const videoReady = video.status === 'ready' && video.available;
      const ready = videoMode ? videoReady : imageReady;
      const refresh = async () => {
        setBusy(true);
        setNotice('');
        const ok = await refreshWallpaper();
        setBusy(false);
        setNotice(ok ? 'updated' : 'error');
      };

      const chooseFile = () => {
        fileInput.current?.click();
      };

      const applyFile = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (file === undefined) return;
        setUploading(true);
        setNotice('');
        const ok = videoMode ? await applyCustomVideo(file) : await applyCustomWallpaper(file);
        setUploading(false);
        setNotice(ok ? (videoMode ? 'videoUpdated' : 'customUpdated') : videoMode ? 'videoFailed' : 'customFailed');
      };

      const restoreDesktop = async () => {
        setUploading(true);
        setNotice('');
        const ok = await restoreDesktopWallpaper();
        setUploading(false);
        setNotice(ok ? 'desktopRestored' : 'customFailed');
      };

      const removeVideo = async () => {
        setUploading(true);
        setNotice('');
        const ok = await clearCustomVideo();
        setUploading(false);
        setNotice(ok ? 'videoRemoved' : 'videoFailed');
      };

      const noticeIsError =
        notice === 'error' || notice === 'customFailed' || notice === 'videoFailed';
      const noticeLabel =
        notice === 'updated'
          ? translate('updated')
          : notice === 'customUpdated'
            ? translate('customUpdated')
            : notice === 'desktopRestored'
              ? translate('desktopRestored')
              : notice === 'videoUpdated'
                ? translate('videoUpdated')
                : notice === 'videoRemoved'
                  ? translate('videoRemoved')
                  : notice === 'videoFailed'
                    ? translate('videoFailed')
                    : notice === 'customFailed'
                      ? translate('customFailed')
                      : translate('refreshFailed');

      const activeMedia = videoMode ? video : info;
      const activeStatus = videoMode ? video.status : info.status;
      const activeError = videoMode ? video.error : info.error;
      const videoVersion = encodeURIComponent(video.etag === '' ? '0' : video.etag);
      const previewState = ready
        ? h(
            'div',
            { className: 'dshwp-preview-meta' },
            h('span', { className: 'dshwp-preview-name' }, activeMedia.name),
            h('span', { className: 'dshwp-preview-path', title: activeMedia.path }, activeMedia.path),
          )
        : h(
            'div',
            { className: 'dshwp-preview-meta' },
            h(
              'span',
              { className: 'dshwp-preview-name' },
              activeStatus === 'loading'
                ? translate(videoMode ? 'videoLoading' : 'loading')
                : translate(videoMode ? 'videoUnavailable' : 'unavailable'),
            ),
            activeError === '' ? null : h('span', { className: 'dshwp-preview-path' }, activeError),
          );

      return h(
        'section',
        { className: 'dshwp-page' },
        h(
          'div',
          { className: 'dshwp-inner' },
          h(
            'header',
            { className: 'dshwp-header' },
            h(
              'div',
              { className: 'dshwp-titleblock' },
              h('div', { className: 'dshwp-eyebrow' }, translate('eyebrow')),
              h('h1', { className: 'dshwp-title' }, translate('title')),
              h('p', { className: 'dshwp-subtitle' }, translate('subtitle')),
            ),
            h(
              'div',
              { className: 'dshwp-enable' },
              h('span', { className: 'dshwp-enable-label' }, translate('enabled')),
              h(
                'button',
                {
                  type: 'button',
                  role: 'switch',
                  'aria-checked': current.enabled,
                  'aria-label': translate('enabled'),
                  className: `dshwp-switch${current.enabled ? ' is-on' : ''}`,
                  onClick: () => setSettings({ enabled: !current.enabled }),
                },
                h('span', { className: 'dshwp-switch-knob' }),
              ),
            ),
          ),
          h(
            'div',
            { className: 'dshwp-mode' },
            h('span', { className: 'dshwp-mode-label' }, translate('wallpaperType')),
            h(
              'div',
              { className: 'dshwp-mode-options', role: 'group', 'aria-label': translate('wallpaperType') },
              h(
                'button',
                {
                  type: 'button',
                  className: `dshwp-mode-button${videoMode ? '' : ' is-active'}`,
                  'aria-pressed': !videoMode,
                  onClick: () => setSettings({ mode: 'image' }),
                },
                translate('imageMode'),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: `dshwp-mode-button${videoMode ? ' is-active' : ''}`,
                  'aria-pressed': videoMode,
                  onClick: () => setSettings({ mode: 'video' }),
                },
                translate('videoMode'),
              ),
            ),
          ),
          h(
            'div',
            { className: `dshwp-preview${ready ? '' : ' is-empty'}${videoMode ? ' is-video' : ''}` },
            videoMode && videoReady
              ? h('video', {
                  className: 'dshwp-preview-video',
                  src: `${VIDEO_PATH}?v=${videoVersion}`,
                  autoPlay: true,
                  muted: true,
                  loop: true,
                  playsInline: true,
                  'aria-hidden': 'true',
                })
              : null,
            h('div', { className: 'dshwp-preview-veil', 'aria-hidden': 'true' }),
            h(
              'div',
              { className: 'dshwp-preview-top' },
              h('span', { className: 'dshwp-pill' }, translate('preview')),
              h(
                'button',
                {
                  type: 'button',
                  className: 'dshwp-btn dshwp-btn-on-image',
                  onClick: refresh,
                  disabled: busy,
                },
                busy ? translate('refreshing') : translate('refresh'),
              ),
            ),
            h('div', { className: 'dshwp-preview-bottom' }, previewState),
          ),
          h(
            'div',
            { className: 'dshwp-custom' },
            h(
              'div',
              { className: 'dshwp-custom-copy' },
              h(
                'div',
                { className: 'dshwp-custom-title' },
                translate(videoMode ? 'videoWallpaper' : 'customWallpaper'),
              ),
              h('div', { className: 'dshwp-hint' }, translate(videoMode ? 'videoHint' : 'customHint')),
            ),
            h(
              'div',
              { className: 'dshwp-custom-actions' },
              h('input', {
                ref: fileInput,
                type: 'file',
                accept: videoMode
                  ? 'video/mp4,video/webm,video/ogg'
                  : 'image/jpeg,image/png,image/webp,image/gif,image/bmp,image/avif',
                className: 'dshwp-file',
                onChange: applyFile,
              }),
              h(
                'button',
                {
                  type: 'button',
                  className: 'dshwp-btn',
                  onClick: chooseFile,
                  disabled: uploading,
                },
                uploading
                  ? translate('applying')
                  : translate(videoMode ? 'chooseVideo' : 'chooseImage'),
              ),
              videoMode
                ? videoReady
                  ? h(
                      'button',
                      {
                        type: 'button',
                        className: 'dshwp-btn dshwp-btn-quiet',
                        onClick: removeVideo,
                        disabled: uploading,
                      },
                      translate('removeVideo'),
                    )
                  : null
                : info.source === 'custom'
                  ? h(
                      'button',
                      {
                        type: 'button',
                        className: 'dshwp-btn dshwp-btn-quiet',
                        onClick: restoreDesktop,
                        disabled: uploading,
                      },
                      translate('useDesktop'),
                    )
                  : null,
            ),
          ),
          h(
            'div',
            { className: 'dshwp-grid' },
            h(
              'section',
              { className: 'dshwp-card' },
              h('h2', { className: 'dshwp-card-title' }, translate('appearance')),
              h(Slider, {
                label: translate('opacity'),
                hint: translate('opacityHint'),
                value: current.opacity,
                min: 0,
                max: 1,
                step: 0.01,
                display: `${String(Math.round(current.opacity * 100))}%`,
                onChange: (value) => setSettings({ opacity: value }),
              }),
              h(Slider, {
                label: translate('mask'),
                hint: translate('maskHint'),
                value: current.maskOpacity,
                min: 0,
                max: 1,
                step: 0.01,
                display: `${String(Math.round(current.maskOpacity * 100))}%`,
                onChange: (value) => setSettings({ maskOpacity: value }),
              }),
              h(Slider, {
                label: translate('blur'),
                hint: translate('blurHint'),
                value: current.blur,
                min: 0,
                max: 30,
                step: 1,
                display: `${String(Math.round(current.blur))} px`,
                onChange: (value) => setSettings({ blur: value }),
              }),
            ),
            h(
              'section',
              { className: 'dshwp-card' },
              h('h2', { className: 'dshwp-card-title' }, translate('maskGlass')),
              h(
                'div',
                { className: 'dshwp-field' },
                h(
                  'div',
                  { className: 'dshwp-field-head' },
                  h('span', { className: 'dshwp-label' }, translate('maskColor')),
                ),
                h(MaskPalette, {
                  value: current.maskColor,
                  onChange: (value) => setSettings({ maskColor: value }),
                }),
                h('div', { className: 'dshwp-hint' }, translate('maskColorHint')),
              ),
              h(Slider, {
                label: translate('sidebar'),
                hint: translate('sidebarHint'),
                value: current.sidebarOpacity,
                min: 0,
                max: 1,
                step: 0.01,
                display: `${String(Math.round(current.sidebarOpacity * 100))}%`,
                onChange: (value) => setSettings({ sidebarOpacity: value }),
              }),
              h(
                'div',
                { className: 'dshwp-actions' },
                h(
                  'button',
                  { type: 'button', className: 'dshwp-btn', onClick: resetSettings },
                  translate('reset'),
                ),
              ),
            ),
          ),
          h(
            'div',
            { className: 'dshwp-foot' },
            h(
              'span',
              { className: 'dshwp-foot-item' },
              h('span', { className: 'dshwp-dot', 'aria-hidden': 'true' }),
              translate('coverage'),
            ),
            h('span', { className: 'dshwp-foot-item' }, translate('saved')),
            notice === ''
              ? null
              : h(
                  'span',
                  {
                    className: `dshwp-foot-notice${noticeIsError ? ' is-error' : ''}`,
                    role: 'status',
                  },
                  noticeLabel,
                ),
          ),
        ),
      );
    }

    const CSS = `
:root {
  --dshwp-image: none;
  --dshwp-wallpaper-opacity: 0.95;
  --dshwp-mask-opacity: 0.6;
  --dshwp-mask-color: #ffffff;
  --dshwp-blur: 2px;
  --dshwp-sidebar-strength: 42%;
  --dshwp-system-text: color-mix(in srgb, var(--dsw-alias-label-primary) 52%, var(--dsw-alias-label-secondary));
  --dshwp-system-body-text: color-mix(in srgb, var(--dsw-alias-label-primary) 68%, var(--dsw-alias-label-secondary));
}

html[data-dshwp-enabled] {
  background-color: var(--dsw-alias-bg-base) !important;
}

html[data-dshwp-enabled]::before {
  content: "";
  position: fixed;
  inset: calc(-1 * var(--dshwp-blur) - 32px);
  z-index: -1;
  background-image: var(--dshwp-image);
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  filter: blur(var(--dshwp-blur));
  opacity: var(--dshwp-wallpaper-opacity);
  pointer-events: none;
  transition: opacity 0.25s ease;
}

html[data-dshwp-enabled][data-dshwp-mode="video"]::before {
  background-image: none !important;
}

.dshwp-video {
  position: fixed;
  inset: 0;
  z-index: -1;
  display: none;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: var(--dshwp-wallpaper-opacity);
  filter: blur(var(--dshwp-blur));
  pointer-events: none;
  transition: opacity 0.25s ease;
}

html[data-dshwp-enabled][data-dshwp-video] .dshwp-video {
  display: block;
}

html[data-dshwp-enabled]::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  background-color: var(--dshwp-mask-color);
  opacity: var(--dshwp-mask-opacity);
  pointer-events: none;
  transition: opacity 0.25s ease, background-color 0.25s ease;
}

html[data-dshwp-enabled] body,
html[data-dshwp-enabled] #root,
html[data-dshwp-enabled] .mP3x-q_frame,
html[data-dshwp-enabled] .mP3x-q_centerCol,
html[data-dshwp-enabled] .mP3x-q_rightbarCol,
html[data-dshwp-enabled] .mP3x-q_bottomRow,
html[data-dshwp-enabled] .an3WzG_root,
html[data-dshwp-enabled] .an3WzG_composerSeat,
html[data-dshwp-enabled] ._tabHost_6nhg2_162,
html[data-dshwp-enabled] ._emptyTabHost_6nhg2_143,
html[data-dshwp-enabled] .acoR2W_panel {
  background: transparent !important;
}

html[data-dshwp-enabled] .mP3x-q_sidebarCol {
  background: transparent !important;
  border-right-color: color-mix(in srgb, var(--dsw-alias-border-l1) 55%, transparent) !important;
}

html[data-dshwp-enabled] .wtg9ga_root {
  background: color-mix(in srgb, var(--dsw-specific-sidebar-fill) var(--dshwp-sidebar-strength), transparent) !important;
  -webkit-backdrop-filter: blur(18px) saturate(1.15);
  backdrop-filter: blur(18px) saturate(1.15);
}

html[data-dshwp-enabled][data-windows-titlebar] .mP3x-q_frame::before {
  background: color-mix(in srgb, var(--dsw-specific-sidebar-fill) var(--dshwp-sidebar-strength), transparent) !important;
  -webkit-backdrop-filter: blur(18px) saturate(1.15);
  backdrop-filter: blur(18px) saturate(1.15);
}

/*
 * The bottom of the workspace list ends in a solid sidebar-fill fade. Keep
 * the fade for legibility but let the wallpaper remain underneath it.
 */
html[data-dshwp-enabled] .GAkraW_fade {
  background: linear-gradient(to bottom, transparent, color-mix(in srgb, var(--dsw-specific-sidebar-fill) 16%, transparent)) !important;
}

html[data-dshwp-enabled] .wtg9ga_footArea,
html[data-dshwp-enabled] .wtg9ga_footerActions,
html[data-dshwp-enabled] .wtg9ga_settingsArea {
  background: transparent !important;
}

/*
 * The desktop preload mirrors a hidden probe's background into the native
 * Windows caption strip. Transparent lets the same glass/wallpaper show
 * behind minimize, maximize and close instead of an opaque caption fill.
 */
html[data-dshwp-enabled] body > span[style*="--dsw-specific-sidebar-fill"] {
  background-color: transparent !important;
}

/*
 * System prompt and context-injection rows use 11px tertiary text. Lift that
 * to a theme-aware mid tone: clearer than tertiary, softer than primary.
 */
html[data-dshwp-enabled] .iFrn8G_root,
html[data-dshwp-enabled] .iFrn8G_root * {
  color: var(--dshwp-system-text) !important;
}

html[data-dshwp-enabled] .iFrn8G_body[data-system-prompt-body],
html[data-dshwp-enabled] .iFrn8G_body[data-system-prompt-body] * {
  color: var(--dshwp-system-body-text) !important;
  font-size: 12px !important;
  line-height: 18px !important;
}

/*
 * DSH settings is a full-window modal with its own opaque panel and a
 * full-screen dimming mask. Let the wallpaper through while keeping the
 * panel legible as frosted glass.
 */
html[data-dshwp-enabled] .AnXs9G_mask {
  background: color-mix(in srgb, var(--dshwp-mask-color) 18%, transparent) !important;
  -webkit-backdrop-filter: blur(2px) saturate(1.05);
  backdrop-filter: blur(2px) saturate(1.05);
}

html[data-dshwp-enabled] .AnXs9G_panel {
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 70%, transparent) !important;
  -webkit-backdrop-filter: blur(28px) saturate(1.15);
  backdrop-filter: blur(28px) saturate(1.15);
}

/*
 * The trajectory view paints its root, split pane, table, toolbar and
 * timeline plot with opaque layer-1/layer-2 fills. Open those up so the
 * same wallpaper remains visible behind the ledger.
 */
html[data-dshwp-enabled] .eciBTa_root {
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 64%, transparent) !important;
  -webkit-backdrop-filter: blur(14px) saturate(1.1);
  backdrop-filter: blur(14px) saturate(1.1);
}

html[data-dshwp-enabled] .xeixwq_split,
html[data-dshwp-enabled] .xeixwq_table {
  background: transparent !important;
}

html[data-dshwp-enabled] .Wd4N7W_root,
html[data-dshwp-enabled] .xeixwq_historyLoadingBar,
html[data-dshwp-enabled] .xeixwq_historyLoadButton {
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 72%, transparent) !important;
}

html[data-dshwp-enabled] .xeixwq_table th {
  background: color-mix(in srgb, var(--dsw-specific-sidebar-fill) 72%, transparent) !important;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

html[data-dshwp-enabled] .tzG23a_plot {
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 62%, transparent) !important;
}

html[data-dshwp-enabled] .xeixwq_details {
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 84%, transparent) !important;
}

/*
 * Disabled state. The explicit restoration rules also neutralize a stale
 * wallpaper stylesheet left in the document by an earlier experiment, so
 * switching this plugin off restores the normal DSH surfaces immediately.
 */
html[data-dshwp-paused]::before,
html[data-dshwp-paused]::after {
  content: none !important;
  display: none !important;
}

html[data-dshwp-paused] body,
html[data-dshwp-paused] #root,
html[data-dshwp-paused] .an3WzG_composerSeat,
html[data-dshwp-paused] ._tabHost_6nhg2_162,
html[data-dshwp-paused] ._emptyTabHost_6nhg2_143,
html[data-dshwp-paused] .acoR2W_panel {
  background: transparent !important;
}

html[data-dshwp-paused] .mP3x-q_frame,
html[data-dshwp-paused] .mP3x-q_centerCol,
html[data-dshwp-paused] .mP3x-q_rightbarCol,
html[data-dshwp-paused] .mP3x-q_bottomRow,
html[data-dshwp-paused] .an3WzG_root {
  background: var(--dsw-alias-bg-base) !important;
}

html[data-dshwp-paused][data-windows-titlebar] .mP3x-q_frame {
  background: var(--dsw-specific-sidebar-fill) !important;
}

html[data-dshwp-paused] .mP3x-q_sidebarCol,
html[data-dshwp-paused] .wtg9ga_root {
  background: var(--dsw-specific-sidebar-fill) !important;
  -webkit-backdrop-filter: none !important;
  backdrop-filter: none !important;
}

html[data-dshwp-paused] .mP3x-q_sidebarCol {
  border-right-color: var(--dsw-alias-border-l1) !important;
}

html[data-dshwp-paused][data-windows-titlebar] .mP3x-q_frame::before {
  background: var(--dsw-specific-sidebar-fill) !important;
  -webkit-backdrop-filter: none !important;
  backdrop-filter: none !important;
}

.dshwp-page {
  box-sizing: border-box;
  height: 100%;
  min-height: 100%;
  overflow: auto;
  background: color-mix(in srgb, var(--dsw-alias-bg-base) 62%, transparent);
  color: var(--dsw-alias-label-primary);
  font-family: var(--dsw-font-family, inherit);
}

.dshwp-inner {
  box-sizing: border-box;
  width: min(100%, 980px);
  margin: 0 auto;
  padding: 40px 32px 56px;
}

.dshwp-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.dshwp-titleblock {
  min-width: 0;
}

.dshwp-eyebrow {
  margin-bottom: 8px;
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  line-height: 16px;
}

.dshwp-title {
  margin: 0;
  color: var(--dsw-alias-label-primary);
  font-size: 26px;
  font-weight: 600;
  line-height: 34px;
}

.dshwp-subtitle {
  max-width: 700px;
  margin: 8px 0 0;
  color: var(--dsw-alias-label-secondary);
  font-size: 13px;
  line-height: 21px;
}

.dshwp-enable {
  display: flex;
  flex: none;
  align-items: center;
  gap: 10px;
  padding-top: 22px;
}

.dshwp-enable-label {
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  white-space: nowrap;
}

.dshwp-switch {
  position: relative;
  box-sizing: border-box;
  width: 42px;
  height: 24px;
  padding: 0;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 999px;
  background: var(--dsw-alias-bg-layer-2);
  cursor: pointer;
  transition: background-color 0.18s ease, border-color 0.18s ease;
}

.dshwp-switch.is-on {
  border-color: transparent;
  background: var(--dsw-alias-brand-primary);
}

.dshwp-switch:focus-visible,
.dshwp-btn:focus-visible,
.dshwp-range:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary);
  outline-offset: 2px;
}

.dshwp-switch-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--dsw-alias-bg-overlay);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: transform 0.18s ease;
}

.dshwp-switch.is-on .dshwp-switch-knob {
  transform: translateX(18px);
}

.dshwp-mode {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
}

.dshwp-mode-label {
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 18px;
}

.dshwp-mode-options {
  display: flex;
  gap: 3px;
  padding: 3px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-2);
}

.dshwp-mode-button {
  height: 28px;
  padding: 0 12px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.dshwp-mode-button:hover {
  color: var(--dsw-alias-label-primary);
}

.dshwp-mode-button.is-active {
  background: var(--dsw-alias-bg-overlay);
  color: var(--dsw-alias-label-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.14);
}

.dshwp-mode-button:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary);
  outline-offset: 2px;
}

.dshwp-preview {
  position: relative;
  box-sizing: border-box;
  height: 260px;
  margin-bottom: 20px;
  overflow: hidden;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 18px;
  background-color: var(--dsw-alias-bg-layer-2);
  background-image: var(--dshwp-image);
  background-position: center;
  background-size: cover;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
}

.dshwp-preview.is-empty {
  background-image: linear-gradient(135deg, color-mix(in srgb, var(--dsw-alias-bg-layer-2) 80%, transparent), var(--dsw-alias-bg-layer-1));
}

.dshwp-preview.is-video:not(.is-empty) {
  background-image: none;
}

.dshwp-preview-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dshwp-preview-veil {
  position: absolute;
  inset: 0;
  background: var(--dshwp-mask-color);
  opacity: var(--dshwp-mask-opacity);
  pointer-events: none;
}

.dshwp-preview-top,
.dshwp-preview-bottom {
  position: absolute;
  right: 16px;
  left: 16px;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.dshwp-preview-top {
  top: 16px;
}

.dshwp-preview-bottom {
  bottom: 16px;
  align-items: flex-end;
}

.dshwp-pill {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 10px;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-border-l1) 70%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-bg-overlay) 76%, transparent);
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

.dshwp-preview-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  padding: 8px 10px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--dsw-alias-bg-overlay) 68%, transparent);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

.dshwp-preview-name {
  color: var(--dsw-alias-label-primary);
  font-size: 12px;
  font-weight: 600;
  line-height: 17px;
}

.dshwp-preview-path {
  max-width: min(620px, 68vw);
  overflow: hidden;
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  line-height: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dshwp-btn {
  box-sizing: border-box;
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 9px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.dshwp-btn:hover:not(:disabled) {
  background: var(--dsw-alias-bg-layer-2);
}

.dshwp-btn:disabled {
  cursor: default;
  opacity: 0.6;
}

.dshwp-btn-on-image {
  background: color-mix(in srgb, var(--dsw-alias-bg-overlay) 76%, transparent);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

.dshwp-btn-quiet {
  background: transparent;
}

.dshwp-btn-quiet:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover);
}

.dshwp-file {
  display: none;
}

.dshwp-custom {
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
  padding: 14px 16px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 14px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 88%, transparent);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
}

.dshwp-custom-copy {
  flex: 1;
  min-width: 220px;
}

.dshwp-custom-title {
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
}

.dshwp-custom .dshwp-hint {
  margin-top: 4px;
}

.dshwp-custom-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.dshwp-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.dshwp-card {
  box-sizing: border-box;
  min-width: 0;
  padding: 20px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 14px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 88%, transparent);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
}

.dshwp-card-title {
  margin: 0 0 16px;
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
}

.dshwp-field {
  margin-top: 18px;
}

.dshwp-card-title + .dshwp-field {
  margin-top: 0;
}

.dshwp-field-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 9px;
}

.dshwp-label {
  color: var(--dsw-alias-label-primary);
  font-size: 12px;
  line-height: 17px;
}

.dshwp-value {
  flex: none;
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  line-height: 17px;
}

.dshwp-hint {
  margin-top: 7px;
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  line-height: 16px;
}

.dshwp-range {
  display: block;
  width: 100%;
  height: 4px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 999px;
  outline: none;
  background: linear-gradient(to right, var(--dsw-alias-brand-primary) 0 var(--dshwp-pct), var(--dsw-alias-bg-layer-2) var(--dshwp-pct) 100%);
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.dshwp-range::-webkit-slider-thumb {
  width: 14px;
  height: 14px;
  border: 2px solid var(--dsw-alias-brand-primary);
  border-radius: 50%;
  background: var(--dsw-alias-bg-overlay);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.dshwp-range::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border: 2px solid var(--dsw-alias-brand-primary);
  border-radius: 50%;
  background: var(--dsw-alias-bg-overlay);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  cursor: pointer;
}

.dshwp-palette {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(68px, 1fr));
  gap: 6px;
  margin-top: 2px;
}

.dshwp-swatch {
  box-sizing: border-box;
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 6px 3px 5px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  cursor: pointer;
}

.dshwp-swatch:hover {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}

.dshwp-swatch.is-active {
  border-color: var(--dsw-alias-brand-primary);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 7%, transparent);
  color: var(--dsw-alias-label-primary);
}

.dshwp-swatch:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary);
  outline-offset: 2px;
}

.dshwp-swatch-dot {
  width: 28px;
  height: 28px;
  flex: none;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-border-l1) 80%, transparent);
  border-radius: 50%;
  box-shadow: inset 0 0 0 2px color-mix(in srgb, #ffffff 10%, transparent);
}

.dshwp-swatch.is-active .dshwp-swatch-dot {
  border-color: var(--dsw-alias-brand-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--dsw-alias-brand-primary) 24%, transparent);
}

.dshwp-swatch-label {
  max-width: 100%;
  overflow: hidden;
  color: inherit;
  font-size: 10px;
  line-height: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dshwp-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 22px;
}

.dshwp-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 18px;
  padding: 18px 4px 0;
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  line-height: 17px;
}

.dshwp-foot-item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.dshwp-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--dsw-alias-state-success-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-success-primary) 22%, transparent);
}

.dshwp-foot-notice {
  color: var(--dsw-alias-state-success-primary);
}

.dshwp-foot-notice.is-error {
  color: var(--dsw-alias-state-error-primary);
}

@media (max-width: 760px) {
  .dshwp-inner {
    padding: 28px 20px 40px;
  }

  .dshwp-header {
    flex-direction: column;
    gap: 12px;
  }

  .dshwp-enable {
    padding-top: 0;
  }

  .dshwp-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .dshwp-preview {
    height: 210px;
  }
}

@media (prefers-reduced-motion: reduce) {
  html[data-dshwp-enabled]::before,
  html[data-dshwp-enabled]::after,
  .dshwp-switch,
  .dshwp-switch-knob {
    transition: none;
  }
}
`;

    function apply(ctx) {
      settings = loadSettings();

      ctx.effect(
        () => ctx.locale.register(NS, { en: LEXICONS.en, zh: LEXICONS.zh }),
        'desktop-wallpaper: dictionaries',
      );
      translate = ctx.locale.bind(NS);
      localeSubscribe = (listener) => ctx.locale.subscribe(listener);

      ctx.effect(() => {
        const style = document.createElement('style');
        style.dataset.dshWallpaper = 'styles';
        style.textContent = CSS;
        document.head.appendChild(style);
        return () => style.remove();
      }, 'desktop-wallpaper: styles');

      ctx.effect(() => {
        if (document.body === null) return undefined;
        const element = document.createElement('video');
        element.className = 'dshwp-video';
        element.autoplay = true;
        element.muted = true;
        element.loop = true;
        element.playsInline = true;
        element.preload = 'auto';
        element.tabIndex = -1;
        element.setAttribute('aria-hidden', 'true');
        element.setAttribute('disablepictureinpicture', '');
        document.body.appendChild(element);
        videoEl = element;
        applyVideoUrl();
        return () => {
          videoEl = null;
          element.pause();
          element.removeAttribute('src');
          element.load();
          element.remove();
          document.documentElement?.removeAttribute('data-dshwp-video');
        };
      }, 'desktop-wallpaper: video layer');

      applyRootSettings();
      applyImageUrl();

      ctx.effect(() => {
        const body = document.body;
        if (body === null) return undefined;
        const observer = new MutationObserver(() => applyRootSettings());
        observer.observe(body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] });
        return () => observer.disconnect();
      }, 'desktop-wallpaper: theme observer');

      ctx.effect(() => {
        let stopped = false;
        const tick = () => {
          if (!stopped && !document.hidden) void refreshWallpaper();
        };
        void refreshWallpaper();
        const timer = window.setInterval(tick, POLL_MS);
        const onVisibility = () => {
          if (!document.hidden) tick();
        };
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
          stopped = true;
          window.clearInterval(timer);
          document.removeEventListener('visibilitychange', onVisibility);
        };
      }, 'desktop-wallpaper: wallpaper poll');

      ctx.slots.inject('main', () =>
        ctx.slots.register(
          {
            name: 'main',
            key: PANEL_ID,
          },
          WallpaperPanel,
        ),
      );

      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          {
            name: 'sidebar.panellist',
            id: PANEL_ID,
            order: 20,
            label: () => translate('title'),
          },
          WallpaperIcon,
        ),
      );
    }

    return {
      inject: ['slots', 'locale'],
      apply,
    };
  },
});
