// One-off: import the raw illustration assets, remove the flat background from
// cut-out subjects (flood fill from the borders so interior highlights survive),
// resize, and emit optimized webp/png into public/. Run: node scripts/process-assets.cjs
/* eslint-disable */
const path = require("path");
const sharp = require("../node_modules/.pnpm/sharp@0.34.5/node_modules/sharp");

const SRC = path.join("..", "selip referensi", "selip asset");
const ART = path.join("public", "art");
const fs = require("fs");
fs.mkdirSync(ART, { recursive: true });

// Flood-fill the border-connected background to transparent.
async function cutout(srcFile, outFile, maxDim) {
  const { data, info } = await sharp(path.join(SRC, srcFile))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const bgR = data[0],
    bgG = data[1],
    bgB = data[2];
  const TOL = 120; // sum of per-channel abs diff
  const visited = new Uint8Array(width * height);
  const stack = [];
  const near = (p) => {
    const i = p * 4;
    return (
      Math.abs(data[i] - bgR) +
        Math.abs(data[i + 1] - bgG) +
        Math.abs(data[i + 2] - bgB) <
      TOL
    );
  };
  const push = (p) => {
    if (!visited[p] && near(p)) {
      visited[p] = 1;
      stack.push(p);
    }
  };
  for (let x = 0; x < width; x++) {
    push(x);
    push((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    push(y * width);
    push(y * width + width - 1);
  }
  while (stack.length) {
    const p = stack.pop();
    data[p * 4 + 3] = 0;
    const x = p % width;
    const y = (p / width) | 0;
    if (x > 0) push(p - 1);
    if (x < width - 1) push(p + 1);
    if (y > 0) push(p - width);
    if (y < height - 1) push(p + width);
  }
  await sharp(data, { raw: { width, height, channels: 4 } })
    .trim()
    .resize(maxDim, maxDim, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 86 })
    .toFile(path.join(ART, outFile));
  console.log("cutout", outFile);
}

// Keep the colored background; just resize + compress.
async function keep(srcFile, outFile, w, h) {
  let p = sharp(path.join(SRC, srcFile));
  p = h
    ? p.resize(w, h, { fit: "cover" })
    : p.resize(w, null, { withoutEnlargement: true });
  await p.webp({ quality: 86 }).toFile(path.join(ART, outFile));
  console.log("keep", outFile);
}

(async () => {
  // Cut-outs -> transparent
  await cutout("01_master_mascot.png", "mascot.webp", 520);
  await cutout("02_hero_gift_passing.png", "hero.webp", 1200);
  await cutout("03A_gift_not_found.png", "state-notfound.webp", 560);
  await cutout("03B_already_opened.png", "state-opened.webp", 560);
  await cutout("03C_expired_returned.png", "state-expired.webp", 560);
  await cutout("03D_error_tangled_ribbon.png", "state-error.webp", 560);
  await cutout("06A_create_gift.png", "how-create.webp", 520);
  await cutout("06B_share_link.png", "how-share.webp", 520);
  await cutout("06C_open_easily.png", "how-open.webp", 520);
  await cutout("07A_loading_carrying_gifts.png", "loading.webp", 460);
  await cutout("07B_success_heart_gift.png", "success.webp", 560);
  await cutout("08_reveal_unwrap.png", "reveal.webp", 600);
  await cutout("09_trust_badge.png", "trust.webp", 360);

  // Full-bleed card art
  await keep("04A_birthday_card.png", "card-birthday.webp", 800);
  await keep("04B_wedding_card.png", "card-wedding.webp", 800);
  await keep("04C_graduation_card.png", "card-graduation.webp", 800);
  await keep("04D_festive_card.png", "card-festive.webp", 800);

  // OG link preview (keep colored bg), to public/og.png
  await sharp(path.join(SRC, "05_og_link_preview.png"))
    .resize(1200, 630, { fit: "cover" })
    .png()
    .toFile(path.join("public", "og.png"));
  console.log("og.png");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
