# Marketing assets

Shipped with `material-next-web-components/marketing.js` and served by each hub from its public folder. Copy them with:

```bash
npx mnw-marketing-assets public/material-next
```

| Folder                           | Source                                                                                                                    | Used by                                                      |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `device-frames/pixel_9_pro_xl`   | Android Studio device art (`back.webp`, `mask.webp`)                                                                      | `<mnw-device-frame>`, phone windows                          |
| `device-frames/pixel_9_pro_fold` | Android Studio device art, open (`default`)                                                                               | `<mnw-device-frame device="pixel_9_pro_fold">`, fold windows |
| `device-frames/pixelbook_go`     | Android Developers Device Art Generator (`land_back.png`, `land_shadow.png`; `land_fore.png` left out)                    | `<mnw-device-frame device="pixelbook_go">`, desktop windows  |
| `launcher`                       | Product and console icons: Android Insider, Material Next, GitHub, Google Play, Play Console, Firebase, AdMob, Cloudflare | `<mnw-product-launcher>`, `asset:launcher/…` images          |
| `badges/google-play`             | The Google Play badge as SVG (`en.svg`, used by `<mnw-play-badge>`) and Google's official PNG; usage rules in its README  | `<mnw-play-badge>`, store media                              |

`launcher/google-play.svg` is the multicolor Play icon supplied for the launcher.
The full store badge remains in `badges/google-play/` for download links.

These files are the single copy for Mihai-Cristian Condrea's projects. The marketing skills in [android-skills](https://github.com/MihaiCristianCondrea/android-skills) refer here instead of keeping their own.
