import { useEffect, useRef, useState } from "react";

type Props = {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
};

export function SignaturePad({ value, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(!value);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0B1B59";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        setEmpty(false);
      };
      img.src = value;
    }
  }, []);

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const emit = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL("image/png"));
    setEmpty(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    onChange(null);
    setEmpty(true);
  };

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        className="w-full h-44 rounded-xl border border-[#0B1B59]/15 bg-white touch-none cursor-crosshair"
        onPointerDown={(e) => {
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext("2d");
          if (!ctx) return;
          drawing.current = true;
          canvas?.setPointerCapture(e.pointerId);
          const p = point(e);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const ctx = canvasRef.current?.getContext("2d");
          if (!ctx) return;
          const p = point(e);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }}
        onPointerUp={() => {
          if (!drawing.current) return;
          drawing.current = false;
          emit();
        }}
        onPointerLeave={() => {
          if (!drawing.current) return;
          drawing.current = false;
          emit();
        }}
      />
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] text-[#0B1B59]/50">
          {empty ? "Signez dans le cadre avec la souris ou le doigt." : "Spécimen capturé."}
        </p>
        <button type="button" onClick={clear} className="text-[12px] font-semibold text-[#0B1B59] underline">
          Effacer
        </button>
      </div>
    </div>
  );
}
