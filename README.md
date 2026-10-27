<p align="center">
  <img src="icon.svg" width="88" height="88" alt="DSH Desktop Wallpaper icon">
</p>

<h1 align="center">DSH Desktop Wallpaper</h1>

<p align="center">把 Windows 桌面壁纸、图片或循环视频铺满整个 DSH 窗口。</p>

> A DSH bundle that turns the Windows desktop wallpaper, a local image, or a looping video into one continuous full-window background for DeepSeek Harness.
<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/1f16345e-1712-4644-bef7-bc960084c291" />
<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/4d9c8f83-5790-4b17-8728-d424371ac360" />


## 功能

- 自动读取当前 Windows 桌面壁纸（注册表 `Control Panel\Desktop\WallPaper`，回退到 `TranscodedWallpaper`）。
- 图片壁纸 / 视频壁纸严格二选一：
  - 图片模式：使用桌面壁纸，或上传本地图片。
  - 视频模式：上传 MP4、WebM 或 Ogg 视频，静音循环播放。
- 可随时恢复桌面壁纸或移除视频。
- 壁纸固定铺满整个窗口，左侧栏、会话区、右侧栏和 Windows 标题栏共用同一张连续背景。
- 设置弹窗、轨迹视图、侧栏工作区底部也会做半透明/毛玻璃处理。
- 系统提示词使用主题自适应的中间色，并适当放大提示正文，避免在壁纸上发灰看不清。
- 左侧栏「桌面壁纸」入口打开设置页，可实时调节：
  - 壁纸不透明度
  - 遮罩浓度（默认 60%）
  - 遮罩配色（纯白 + GitHub / Solarized / Gruvbox / Nord / Dracula / Catppuccin 等常用主题色，共 10 种）
  - 壁纸模糊
  - 左侧栏玻璃浓度
- 设置保存在浏览器 `localStorage`，每 30 秒自动检查壁纸是否变化。
- 「刷新」按钮可立即重新读取。

## 安装

要求：

- DSH `0.2.1-rc.3` 或更高版本。
- 读取 Windows 桌面壁纸需要 Windows；自定义图片和视频在其他平台的 DSH Host 上也可使用。

步骤：

1. 克隆仓库并进入目录：

   ```bash
   git clone <this-repository-url> dsh-desktop-wallpaper
   cd dsh-desktop-wallpaper
   ```

2. 在 DSH 的插件管理中选择「从本地目录安装 bundle」，指向仓库根目录（包含 `package.json` 和 `cordis.patch.yml` 的目录）。
3. 刷新 DSH 页面，或重启 DSH。左侧栏会出现「桌面壁纸」入口。

> 这是 DSH bundle，不是独立应用。安装应通过 DSH 的 bundle 安装器完成，不要把仓库手工复制进 `node_modules`。
>
> 包名 `@local/dsh-desktop-wallpaper` 是为本地 bundle 保留的；如果 fork 后要发布到 npm，请改成自己的包名和 scope。

## 使用

- 点击左侧栏「桌面壁纸」。
- 在「壁纸类型」中选择「图片」或「视频」。
- 图片模式：
  - 使用当前桌面壁纸。
  - 或点击「选择图片」上传本地图片；点击「恢复桌面壁纸」恢复自动读取。
- 视频模式：
  - 点击「选择视频」上传视频。
  - 点击「移除视频」删除视频；切回图片模式即可恢复图片壁纸。
- 图片和视频文件会分别保留，切换模式时无需重新上传；同一时间只显示当前模式对应的背景。

## 支持的媒体

| 类型 | 格式 | 大小限制 |
| --- | --- | --- |
| 图片 | JPEG、PNG、WebP、GIF、BMP、AVIF | 48 MB |
| 视频 | MP4、WebM、Ogg | 200 MB |

视频建议使用浏览器支持良好的 **MP4（H.264/AAC）** 或 **WebM（VP8/VP9）**。视频以静音、循环、`playsInline` 方式播放，并通过 HTTP Range 分段请求支持循环和拖动。

## 宿主路由

| 路由 | 作用 |
| --- | --- |
| `/dsh-wallpaper/info` | 当前图片壁纸元数据 |
| `/dsh-wallpaper/image` | 当前图片壁纸 |
| `/dsh-wallpaper/custom` | 上传 / 删除自定义图片 |
| `/dsh-wallpaper/video/info` | 自定义视频元数据 |
| `/dsh-wallpaper/video` | 自定义视频，支持 Range |
| `/dsh-wallpaper/video/upload` | 上传 / 删除自定义视频 |

数据保存在 DSH 数据目录的 `storage/dsh-wallpaper` 下：

- `custom.img` + `custom.json`
- `custom-video.bin` + `custom-video.json`

设置数据保存在浏览器 `localStorage` 的 `dsh-wallpaper.settings.v2`。

## 项目结构

| 文件 | 作用 |
| --- | --- |
| `index.js` | 宿主半侧：桌面壁纸读取、自定义媒体存储和 HTTP 路由。 |
| `client.js` | 浏览器半侧：整窗背景、视频层、左侧栏入口和设置页。 |
| `cordis.patch.yml` | 安装到 profile 的 bundle patch。 |
| `locale/*.json` | 插件管理器和设置页的显示名称/描述。 |
| `icon.svg` | 插件图标。 |
| `.github/workflows/check.yml` | GitHub Actions 语法和 JSON 校验。 |

## 开发

没有构建步骤。修改后检查语法：

```bash
npm run check
```

CI 还会校验 `package.json`、`locale/en.json` 和 `locale/zh.json`。已验证的 DSH 版本是 `0.2.1-rc.3`。

## 兼容性说明

DSH 的布局类名使用哈希。如果 DSH 升级后个别容器重新变成不透明，更新 `client.js` 中 `html[data-dshwp-enabled]` 下的布局选择器即可；壁纸层和路由本身不依赖这些类名。

## License

MIT，见 [LICENSE](LICENSE)。
