import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function hexToRgb(hex: string) {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function rgbToHsl(rIn: number, gIn: number, bIn: number) {
  const r = rIn / 255;
  const g = gIn / 255;
  const b = bIn / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function rgbToCmyk(rIn: number, gIn: number, bIn: number) {
  const r = rIn / 255;
  const g = gIn / 255;
  const b = bIn / 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - r - k) / (1 - k)) * 100),
    m: Math.round(((1 - g - k) / (1 - k)) * 100),
    y: Math.round(((1 - b - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

export default function ColorConverter() {
  const [hex, setHex] = useState("#3b82f6");
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 });

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

  const fromHex = (v: string) => {
    setHex(v);
    if (/^#[0-9a-fA-F]{6}$/.test(v)) setRgb(hexToRgb(v));
  };

  const fromRgb = (r: number, g: number, b: number) => {
    setRgb({ r, g, b });
    setHex(rgbToHex(r, g, b));
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  const formats = [
    { label: "HEX", value: hex },
    { label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    {
      label: "CMYK",
      value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4" data-ocid="color.panel">
        <div
          className="w-24 h-24 rounded-xl border shadow-md flex-shrink-0"
          style={{ backgroundColor: hex }}
        />
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm w-12">HEX</span>
            <Input
              data-ocid="color.input"
              value={hex}
              onChange={(e) => fromHex(e.target.value)}
              className="font-mono w-36"
              maxLength={7}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">R</span>
            <Input
              type="number"
              min={0}
              max={255}
              value={rgb.r}
              onChange={(e) => fromRgb(+e.target.value, rgb.g, rgb.b)}
              className="w-20"
            />
            <span className="text-sm">G</span>
            <Input
              type="number"
              min={0}
              max={255}
              value={rgb.g}
              onChange={(e) => fromRgb(rgb.r, +e.target.value, rgb.b)}
              className="w-20"
            />
            <span className="text-sm">B</span>
            <Input
              type="number"
              min={0}
              max={255}
              value={rgb.b}
              onChange={(e) => fromRgb(rgb.r, rgb.g, +e.target.value)}
              className="w-20"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {formats.map((f) => (
          <div
            key={f.label}
            className="bg-card border rounded-lg p-3 flex items-center justify-between"
          >
            <div>
              <div className="text-xs text-muted-foreground">{f.label}</div>
              <div className="font-mono text-sm">{f.value}</div>
            </div>
            <Button size="icon" variant="ghost" onClick={() => copy(f.value)}>
              <Copy size={14} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
