# Marketing assets

Shipped with `material-next-web-components/marketing.js` and served by each hub from its public folder. Copy them with:

```bash
npx mnw-marketing-assets public/material-next
```

| Folder | Source | Used by |
| --- | --- | --- |
| `device-frames/pixel_9_pro_xl` | Android Studio device art (`back.webp`, `mask.webp`) | `<mnw-device-frame>`, phone windows |
| `device-frames/pixel_9_pro_fold` | Android Studio device art, open (`default`) | `<mnw-device-frame device="pixel_9_pro_fold">`, fold windows |
| `device-frames/pixelbook_go` | Android Developers Device Art Generator (`land_back.png`, `land_shadow.png`; `land_fore.png` left out) | `<mnw-device-frame device="pixelbook_go">`, desktop windows |
| `badges/google-play` | Google's official badge, unaltered; usage rules in its README | `<mnw-play-badge>` |
