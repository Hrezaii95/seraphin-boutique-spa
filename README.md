# Seraphin — The Passage

An immersive, multilingual 3D landing experience for Seraphin Boutique Spa in Yerevan. Visitors guide the camera through a sculpted Quiet Bloom, warm stone, botanical oil, linen and an abstract private sanctuary before reaching the complete treatment catalogue and booking flow.

## Experience

- Scroll- and touch-directed real-time 3D journey
- Original editable Blender 5.2 scene and Meshopt-compressed GLB
- Adaptive high, balanced and low rendering tiers
- Static poster fallback for unavailable or lost WebGL
- Optional, muted-by-default procedural ambient sound
- English, Armenian and Russian interface
- Current Seraphin services, durations and AMD prices
- Ritual finder, real venue imagery, contact and Emly booking
- Reduced-motion, keyboard and screen-reader support

## Development

```bash
npm install
npm run dev
npm run check
```

Regenerate the source scene with Blender 5.2:

```bash
blender --background --python assets/source/create_passage_scene.py
```

The web model was compressed from the generated source GLB with glTF-Transform 4.4.2 using Meshopt high compression. See `ASSET_MANIFEST.md` and `PERFORMANCE.md`.

## Content status

Prices were transcribed from Seraphin's public Emly menu on 14 August 2026. The address and hours use the strongest available public evidence but must be reconfirmed by the owner before replacing the official domain. Media is used for this consented, client-only demonstration; final public-launch clearance remains an owner gate.

See `DATA_SOURCES.md` and `NOTICE.md`.
