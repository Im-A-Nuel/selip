# Selip demo video (Remotion)

A ~2 minute (120s @ 30fps, 1920x1080) animated product demo for Selip. Fully
code-driven — no screen recording needed. Isolated from the Next app: its own
`package.json` and `node_modules`, so it never touches the app build.

## Install

This project is intentionally kept out of the pnpm workspace. Install with **npm**
so it doesn't collide with the root lockfile:

```bash
cd video
npm install
```

## Preview (Remotion Studio)

```bash
npm run dev
```

Opens the studio at http://localhost:3000 — scrub the timeline, tweak scenes live.

## Render to MP4

```bash
npm run render        # -> out/selip-demo.mp4 (H.264)
npm run still         # -> out/poster.png (a poster frame)
```

## Music

Optional. Drop a track at `video/public/music.mp3`, then set `MUSIC_SRC = "music.mp3"`
in `src/Root.tsx`. Keep it royalty-free.

## Structure

```
src/
  Root.tsx            # composition + scene timeline (durations here)
  theme.ts            # brand colors, font, fps
  components/         # PhoneFrame, GiftCardMock, Caption, Confetti, ui atoms, anim helpers
  scenes/
    S1_Intro  S2_Problem  S3_Meet  S4_Create  S5_Card
    S6_Share  S7_Claim    S8_Tech  S9_Outro
```

Scene timing lives in `Root.tsx` (`SCENES` array). 30fps, so frames = seconds * 30.
