import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Selip",
    short_name: "Selip",
    description: "Slip someone a gift. No wallet needed.",
    start_url: "/",
    display: "standalone",
    background_color: "#fdf7f3",
    theme_color: "#f9603d",
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
