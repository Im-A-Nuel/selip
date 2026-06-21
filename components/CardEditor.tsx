"use client";

// Full-screen editor for custom gift-card art: draw on a 3:4 canvas, upload a
// photo, undo/redo. Opens as a modal so the create step stays compact. Outputs a
// compressed JPEG data URL on Save. Only images are accepted for upload.

import { useEffect, useRef, useState } from "react";
import { PillButton } from "@/components/ui";

const W = 600; // internal 3:4 resolution
const H = 800;
const MAX_HISTORY = 30;
const COLORS = [
  "#1c1410",
  "#f9603d",
  "#ff9a76",
  "#f59e0b",
  "#2bb673",
  "#3b82f6",
  "#ffffff",
];

export function CardEditor({
  value,
  onSave,
  onClose,
}: {
  value?: string;
  onSave: (dataUrl: string | null) => void;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const history = useRef<string[]>([]);
  const idx = useRef(-1);
  const [color, setColor] = useState("#f9603d");
  const [size, setSize] = useState(10);
  const [, bump] = useState(0); // re-render for undo/redo button state
  const [touched, setTouched] = useState(false);

  function ctx() {
    return canvasRef.current?.getContext("2d") ?? null;
  }

  function paintWhite(c: CanvasRenderingContext2D) {
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, W, H);
  }

  function pushHistory() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const data = canvas.toDataURL("image/jpeg", 0.8);
    const h = history.current.slice(0, idx.current + 1);
    h.push(data);
    if (h.length > MAX_HISTORY) h.shift();
    history.current = h;
    idx.current = h.length - 1;
    bump((v) => v + 1);
  }

  function restore(i: number) {
    const c = ctx();
    const data = history.current[i];
    if (!c || !data) return;
    const img = new Image();
    img.onload = () => c.drawImage(img, 0, 0, W, H);
    img.src = data;
  }

  // Initial surface (existing value or blank), seed history. Runs once.
  useEffect(() => {
    const c = ctx();
    if (!c) return;
    if (value) {
      const img = new Image();
      img.onload = () => {
        c.drawImage(img, 0, 0, W, H);
        pushHistory();
      };
      img.src = value;
    } else {
      paintWhite(c);
      pushHistory();
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
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
    setTouched(true);
    pushHistory();
  }

  function undo() {
    if (idx.current <= 0) return;
    idx.current -= 1;
    restore(idx.current);
    bump((v) => v + 1);
  }

  function redo() {
    if (idx.current >= history.current.length - 1) return;
    idx.current += 1;
    restore(idx.current);
    bump((v) => v + 1);
  }

  function clear() {
    const c = ctx();
    if (!c) return;
    paintWhite(c);
    setTouched(true);
    pushHistory();
  }

  function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const c = ctx();
      if (c) {
        const s = Math.max(W / img.width, H / img.height);
        const w = img.width * s;
        const h = img.height * s;
        paintWhite(c);
        c.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
        setTouched(true);
        pushHistory();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  function save() {
    const canvas = canvasRef.current;
    // If nothing was drawn/uploaded, treat as "no custom image".
    if (!canvas || !touched) {
      onSave(value ?? null);
    } else {
      onSave(canvas.toDataURL("image/jpeg", 0.8));
    }
  }

  const canUndo = idx.current > 0;
  const canRedo = idx.current < history.current.length - 1;

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-md"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="reveal-pop flex max-h-[92vh] w-full max-w-sm flex-col gap-3 overflow-y-auto rounded-4xl bg-white/95 p-5 shadow-2xl ring-1 ring-black/5"
      >
        <div className="flex items-center justify-between">
          <p className="text-base font-extrabold text-ink">Make the card</p>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/5 text-ink/60 hover:bg-ink/10"
          >
            ✕
          </button>
        </div>

        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          className="mx-auto aspect-[3/4] w-full max-w-[240px] cursor-crosshair touch-none rounded-2xl bg-white shadow-sm ring-1 ring-ink/10"
        />

        <div className="flex flex-wrap items-center justify-center gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`Color ${c}`}
              className={`h-7 w-7 rounded-full ring-2 transition-transform active:scale-90 ${
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
            max={36}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            aria-label="Brush size"
            className="flex-1 accent-coral-500"
          />
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="rounded-full bg-ink/5 px-3 py-1.5 text-xs font-semibold text-ink/70 hover:bg-ink/10 disabled:opacity-30"
          >
            ↶ Undo
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className="rounded-full bg-ink/5 px-3 py-1.5 text-xs font-semibold text-ink/70 hover:bg-ink/10 disabled:opacity-30"
          >
            ↷ Redo
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex-1 cursor-pointer rounded-full bg-ink/5 px-3 py-2 text-center text-xs font-semibold text-ink/70 hover:bg-ink/10">
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
            className="flex-1 rounded-full bg-ink/5 px-3 py-2 text-xs font-semibold text-ink/70 hover:bg-ink/10"
          >
            Clear
          </button>
        </div>

        <PillButton onClick={save} className="w-full py-3 text-sm">
          Done
        </PillButton>
      </div>
    </div>
  );
}
