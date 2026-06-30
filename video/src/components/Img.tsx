import { Img, staticFile } from "remotion";

// Thin wrapper so scenes reference app art by name, e.g. <Art name="mascot" />.
export const Art: React.FC<{
  name: string;
  style?: React.CSSProperties;
}> = ({ name, style }) => (
  <Img src={staticFile(`art/${name}.webp`)} style={style} />
);
