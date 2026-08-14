# Passage performance budget

Measured from the production build on 14 August 2026.

| Resource | Actual | Budget | Status |
| --- | ---: | ---: | --- |
| Initial application JavaScript | 117.9 KB gzip | 350 KB gzip | Pass |
| Lazy 3D JavaScript | 257.3 KB gzip | 500 KB gzip | Pass |
| Runtime Passage GLB | 196.7 KB | 3 MB | Pass |
| Desktop fallback poster | 41.3 KB | 250 KB | Pass |
| Mobile fallback poster | 37.8 KB | 180 KB | Pass |
| Initial stylesheet | 8.5 KB gzip | 75 KB gzip | Pass |

## Runtime controls

- The 3D bundle and model are loaded after the semantic page shell.
- Device memory, CPU count, viewport size and runtime performance select high, balanced or low quality.
- DPR ranges from 0.7 to 1.5.
- Shadow resolution falls from 1024 to 512 and is disabled on the low tier.
- Ambient occlusion is expressed through authored materials instead of a full-screen runtime pass.
- Rendering pauses with the browser lifecycle and resources are released when the scene unmounts.
- WebGL loss immediately exposes the static poster while the booking and catalogue remain usable.

## Verification boundary

Desktop and Pixel 5-sized Chromium tests cover rendering, input, overflow and accessibility. Emulation does not reproduce the GPU characteristics of every physical Android phone, so the private live URL should receive one final review on the owner's target phone before a public-domain launch.
