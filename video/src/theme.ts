// Selip brand tokens, mirrored from the Next app (globals.css / tailwind).
import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";

const { fontFamily } = loadFont();

export const FONT = fontFamily;

export const FPS = 30;

export const COLORS = {
  page: "#fdf7f3",
  panel: "#fdeee9",
  ink: "#1c1410",
  coral: "#f9603d",
  coralSoft: "#ff9a76",
  amber: "#f59e0b",
  green: "#2bb673",
  white: "#ffffff",
};

// Warm aurora gradient, same recipe as .aurora in globals.css.
export const AURORA = [
  "radial-gradient(40% 35% at 12% 8%, rgba(255, 154, 118, 0.55), transparent 70%)",
  "radial-gradient(45% 40% at 88% 6%, rgba(255, 200, 120, 0.5), transparent 70%)",
  "radial-gradient(50% 45% at 82% 88%, rgba(255, 145, 170, 0.42), transparent 70%)",
  "radial-gradient(45% 45% at 10% 90%, rgba(196, 165, 255, 0.34), transparent 72%)",
  "linear-gradient(160deg, #fff6f1 0%, #fdeee9 100%)",
].join(",");
