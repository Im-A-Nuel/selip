"use client";

// Custom gift-card art: draw on a 3:4 canvas and/or drop in a photo. Outputs a
// compressed JPEG data URL via onChange. Only images are accepted for upload.

import { useEffect, useRef, useState } from "react";

const W = 600; // internal 3:4 resolution
const H = 800;
const COLORS = [
  "#1c1410",
  "#f9603d",
  "#ff9a76",
  "#f59e0b",
  "#2bb673",
  "#3b82f6",
  "#ffffff",
];

export function CardDrawer({
  value,
  onChange,
}: {
  value?: string;
  onChange: (dataUrl: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState("#f9603d");
  const [size, setSize] = useState(10);

  function ctx() {
    return canvasRef.current?.getContext("2d") ?? null;
  }

  // Paint the initial surface (existing value or blank white). Runs once.
  useEffect(() => {
    const c = ctx();
    if (!c) return;
    if (value) {
      const img = new Image();
      img.onload = () => c.drawImage(img, 0, 0, W, H);
      img.src = value;
    } else {
      c.fillStyle = "#ffffff";
      c.fillRect(0, 0, W, H);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pos(e: React.PointerEvent) {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * W,
      y: ((e.clientY - r.top) / r.height) * H,
    };
  }

  function start(e: React.PointerEvent) {
    drawing.current = true;
    last.current = pos(e);
    (e.target as Element).setPointerCapture(e.pointerId);
  }

  function move(e: React.PointerEvent) {
    if (!drawing.current) return;
    const c = ctx();
    if (!c || !last.current) return;
    const p = pos(e);
    c.beginPath();
    c.moveTo(last.current.x, last.current.y);
    c.lineTo(p.x, p.y);
    c.strokeStyle = color;
    c.lineWidth = size;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.stroke();
    last.current = p;
  }

  function end() {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    emit();
  }

  function emit() {
    const c = canvasRef.current;
    if (c) onChange(c.toDataURL("image/jpeg", 0.8));
  }

  function clear() {
    const c = ctx();
    if (!c) return;
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, W, H);
    onChange(null);
  }

  function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const c = ctx();
      if (c) {
        // cover-fit into the 3:4 frame
        const s = Math.max(W / img.width, H / img.height);
        const w = img.width * s;
        const h = img.height * s;
        c.fillStyle = "#ffffff";
        c.fillRect(0, 0, W, H);
        c.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
        emit();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  return (
    <div className="flex flex-col gap-3">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        className="aspect-[3/4] w-full cursor-crosshair touch-none rounded-2xl bg-white shadow-sm ring-1 ring-ink/10"
      />
      <div className="flex flex-wrap items-center gap-2">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            aria-label={`Color ${c}`}
            className={`h-6 w-6 rounded-full ring-2 transition-transform active:scale-90 ${
              color === c ? "ring-ink" : "ring-black/10"
            }`}
            style={{ background: c }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={3}
          max={32}
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          aria-label="Brush size"
          className="flex-1 accent-coral-500"
        />
        <label className="cursor-pointer rounded-full bg-ink/5 px-3 py-1.5 text-xs font-semibold text-ink/70 hover:bg-ink/10">
          Upload photo
          <input
            type="file"
            accept="image/*"
            onChange={upload}
            className="hidden"
          />
        </label>
        <button
          type="button"
          onClick={clear}
          className="rounded-full bg-ink/5 px-3 py-1.5 text-xs font-semibold text-ink/70 hover:bg-ink/10"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
