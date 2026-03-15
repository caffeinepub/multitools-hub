export interface SubtitleEntry {
  id: number;
  startMs: number;
  endMs: number;
  text: string;
}

export type SubtitleFormat =
  | "srt"
  | "vtt"
  | "ass"
  | "ssa"
  | "sub"
  | "sbv"
  | "lrc"
  | "dfxp"
  | "ttml"
  | "stl";

export const FORMAT_LABELS: Record<SubtitleFormat, string> = {
  srt: "SRT (SubRip)",
  vtt: "VTT (WebVTT)",
  ass: "ASS (Advanced SubStation)",
  ssa: "SSA (SubStation Alpha)",
  sub: "SUB (MicroDVD / SubViewer)",
  sbv: "SBV (YouTube)",
  lrc: "LRC (Lyrics)",
  dfxp: "DFXP / TTML",
  ttml: "TTML",
  stl: "STL (EBU)",
};

export const FORMAT_EXTENSIONS: Record<SubtitleFormat, string> = {
  srt: "srt",
  vtt: "vtt",
  ass: "ass",
  ssa: "ssa",
  sub: "sub",
  sbv: "sbv",
  lrc: "lrc",
  dfxp: "dfxp",
  ttml: "ttml",
  stl: "stl",
};

// ---- Time helpers ----
export function msToSrtTime(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const mil = ms % 1000;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)},${pad3(mil)}`;
}

export function msToVttTime(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const mil = ms % 1000;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}.${pad3(mil)}`;
}

export function msToSbvTime(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const mil = ms % 1000;
  return `${h}:${pad2(m)}:${pad2(s)}.${pad3(mil)}`;
}

export function msToLrcTime(ms: number): string {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  return `${pad2(m)}:${pad2(s)}.${pad2(cs)}`;
}

export function msToAssTime(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  return `${h}:${pad2(m)}:${pad2(s)}.${pad2(cs)}`;
}

export function msToXmlTime(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const mil = ms % 1000;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}.${pad3(mil)}`;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function pad3(n: number) {
  return String(n).padStart(3, "0");
}

function parseSrtTime(t: string): number {
  const [hms, ms] = t.trim().split(/[,.]/);
  const [h, m, s] = hms.split(":").map(Number);
  return h * 3600000 + m * 60000 + s * 1000 + Number.parseInt(ms || "0");
}

function parseVttTime(t: string): number {
  const [hms, ms] = t.trim().split(".");
  const parts = hms.split(":").map(Number);
  let h = 0;
  let m = 0;
  let s = 0;
  if (parts.length === 3) [h, m, s] = parts;
  else if (parts.length === 2) [m, s] = parts;
  else s = parts[0];
  return (
    h * 3600000 +
    m * 60000 +
    s * 1000 +
    Number.parseInt((ms || "0").padEnd(3, "0").slice(0, 3))
  );
}

function parseLrcTime(t: string): number {
  const [ms] = t.split(".");
  const [m, s] = ms.split(":").map(Number);
  const cs = Number.parseInt(
    (t.split(".")[1] || "0").padEnd(2, "0").slice(0, 2),
  );
  return m * 60000 + s * 1000 + cs * 10;
}

function parseAssTime(t: string): number {
  const [hms, cs] = t.trim().split(".");
  const [h, m, s] = hms.split(":").map(Number);
  return h * 3600000 + m * 60000 + s * 1000 + Number.parseInt(cs || "0") * 10;
}

// ---- Parsers ----
export function parseSrt(text: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  const blocks = text.trim().split(/\n\s*\n/);
  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 2) continue;
    const timeLine = lines.find((l) => l.includes("-->"));
    if (!timeLine) continue;
    const [start, end] = timeLine.split("-->").map(parseSrtTime);
    const textLines = lines.filter(
      (l) => !l.includes("-->") && !/^\d+$/.test(l.trim()),
    );
    entries.push({
      id: entries.length + 1,
      startMs: start,
      endMs: end,
      text: textLines.join("\n").trim(),
    });
  }
  return entries;
}

export function parseVtt(text: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  const lines = text.split("\n");
  let i = 0;
  // skip WEBVTT header
  while (i < lines.length && !lines[i].includes("-->")) i++;
  while (i < lines.length) {
    if (lines[i].includes("-->")) {
      const [start, end] = lines[i]
        .split("-->")
        .map((p) => parseVttTime(p.split(" ")[0]));
      const textLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== "") {
        textLines.push(lines[i]);
        i++;
      }
      entries.push({
        id: entries.length + 1,
        startMs: start,
        endMs: end,
        text: textLines.join("\n"),
      });
    }
    i++;
  }
  return entries;
}

export function parseAss(text: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  const lines = text.split("\n");
  let formatLine = "";
  for (const line of lines) {
    if (line.startsWith("Format:") && line.includes("Start")) {
      formatLine = line;
    }
    if (line.startsWith("Dialogue:")) {
      const parts = line.slice("Dialogue:".length).split(",");
      const fmt = formatLine
        ? formatLine
            .slice("Format:".length)
            .split(",")
            .map((s) => s.trim())
        : [];
      const startIdx = fmt.indexOf("Start");
      const endIdx = fmt.indexOf("End");
      const textIdx = fmt.indexOf("Text");
      const si = startIdx >= 0 ? startIdx : 1;
      const ei = endIdx >= 0 ? endIdx : 2;
      const ti = textIdx >= 0 ? textIdx : 9;
      const start = parseAssTime(parts[si]);
      const end = parseAssTime(parts[ei]);
      const txt = parts
        .slice(ti)
        .join(",")
        .replace(/\{[^}]*\}/g, "")
        .trim();
      entries.push({
        id: entries.length + 1,
        startMs: start,
        endMs: end,
        text: txt,
      });
    }
  }
  return entries;
}

export function parseSub(text: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  const lines = text.trim().split("\n");
  // detect MicroDVD or SubViewer
  const isMicroDvd = /^\{\d+\}\{\d+\}/.test(lines[0]?.trim() || "");
  if (isMicroDvd) {
    // MicroDVD: {start_frame}{end_frame}text -- assume 25fps
    const fps = 25;
    for (const line of lines) {
      const m = line.match(/^\{(\d+)\}\{(\d+)\}(.*)/);
      if (m)
        entries.push({
          id: entries.length + 1,
          startMs: Math.round((Number.parseInt(m[1]) * 1000) / fps),
          endMs: Math.round((Number.parseInt(m[2]) * 1000) / fps),
          text: m[3].replace(/\|/g, "\n"),
        });
    }
  } else {
    // SubViewer: HH:MM:SS.mm,HH:MM:SS.mm\ntext
    let i = 0;
    while (i < lines.length) {
      const m = lines[i].match(
        /^(\d{2}:\d{2}:\d{2}\.\d{2}),(\d{2}:\d{2}:\d{2}\.\d{2})/,
      );
      if (m) {
        const start = parseSrtTime(m[1].replace(".", ","));
        const end = parseSrtTime(m[2].replace(".", ","));
        const txt = lines[i + 1]?.trim() || "";
        entries.push({
          id: entries.length + 1,
          startMs: start,
          endMs: end,
          text: txt,
        });
        i += 2;
      } else i++;
    }
  }
  return entries;
}

export function parseSbv(text: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  const blocks = text.trim().split(/\n\s*\n/);
  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (!lines[0]) continue;
    const m = lines[0].match(/([\d:]+\.\d+),([\d:]+\.\d+)/);
    if (m) {
      entries.push({
        id: entries.length + 1,
        startMs: parseVttTime(m[1]),
        endMs: parseVttTime(m[2]),
        text: lines.slice(1).join("\n"),
      });
    }
  }
  return entries;
}

export function parseLrc(text: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  const lines = text.split("\n");
  const timed: { ms: number; text: string }[] = [];
  for (const line of lines) {
    const m = line.match(/^\[(\d{2}:\d{2}\.\d{2})\](.*)/);
    if (m) timed.push({ ms: parseLrcTime(m[1]), text: m[2] });
  }
  timed.sort((a, b) => a.ms - b.ms);
  for (let i = 0; i < timed.length; i++) {
    entries.push({
      id: i + 1,
      startMs: timed[i].ms,
      endMs: timed[i + 1]?.ms ?? timed[i].ms + 3000,
      text: timed[i].text,
    });
  }
  return entries;
}

export function parseDfxp(text: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "application/xml");
  const ps = doc.querySelectorAll("p");
  ps.forEach((p, i) => {
    const begin = p.getAttribute("begin") || "";
    const end = p.getAttribute("end") || "";
    entries.push({
      id: i + 1,
      startMs: parseVttTime(begin),
      endMs: parseVttTime(end),
      text: p.textContent?.trim() || "",
    });
  });
  return entries;
}

export function parseStl(text: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  for (const line of text.split("\n")) {
    const parts = line.split("\t");
    if (parts.length >= 3) {
      entries.push({
        id: entries.length + 1,
        startMs: parseSrtTime(parts[0].replace(",", ",")),
        endMs: parseSrtTime(parts[1].replace(",", ",")),
        text: parts[2],
      });
    }
  }
  return entries;
}

// ---- Auto-detect ----
export function detectFormat(text: string): SubtitleFormat {
  const t = text.trim();
  if (t.startsWith("WEBVTT")) return "vtt";
  if (t.includes("[Script Info]") || t.includes("ScriptType: v4"))
    return t.includes("v4+") ? "ass" : "ssa";
  if (t.startsWith("{\\rtf") || /^\{\d+\}/.test(t)) return "sub";
  if (/<tt |<TT |<dfxp|<DFXP|<ttml|<TTML/.test(t) || t.includes("xmlns:tt"))
    return "dfxp";
  if (/^\[\d{2}:\d{2}\.\d{2}\]/.test(t)) return "lrc";
  if (/^[\d:]+\.\d+,[\d:]+\.\d+/.test(t)) return "sbv";
  if (/^\d{2}:\d{2}:\d{2}[,.]\d{3}\s+\d{2}:\d{2}:\d{2}[,.]\d{3}/.test(t))
    return "stl";
  if (/^\d+\n[\d:,]+ --> [\d:,]+/.test(t) || /^[\d:,]+ --> [\d:,]+/.test(t))
    return "srt";
  return "srt";
}

export function parseSubtitle(
  text: string,
  format: SubtitleFormat,
): SubtitleEntry[] {
  switch (format) {
    case "srt":
      return parseSrt(text);
    case "vtt":
      return parseVtt(text);
    case "ass":
    case "ssa":
      return parseAss(text);
    case "sub":
      return parseSub(text);
    case "sbv":
      return parseSbv(text);
    case "lrc":
      return parseLrc(text);
    case "dfxp":
    case "ttml":
      return parseDfxp(text);
    case "stl":
      return parseStl(text);
    default:
      return parseSrt(text);
  }
}

// ---- Serializers ----
export function toSrt(entries: SubtitleEntry[]): string {
  return `${entries
    .map(
      (e, i) =>
        `${i + 1}\n${msToSrtTime(e.startMs)} --> ${msToSrtTime(e.endMs)}\n${e.text}`,
    )
    .join("\n\n")}\n`;
}

export function toVtt(entries: SubtitleEntry[]): string {
  return `WEBVTT\n\n${entries
    .map(
      (e, i) =>
        `${i + 1}\n${msToVttTime(e.startMs)} --> ${msToVttTime(e.endMs)}\n${e.text}`,
    )
    .join("\n\n")}\n`;
}

export function toAss(entries: SubtitleEntry[]): string {
  const header =
    "[Script Info]\nScriptType: v4.00+\nCollisions: Normal\nPlayResX: 1280\nPlayResY: 720\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,Arial,48,&H00FFFFFF,&H000000FF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,2,1,2,0010,0010,0018,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n";
  const dialogues = entries
    .map(
      (e) =>
        `Dialogue: 0,${msToAssTime(e.startMs)},${msToAssTime(e.endMs)},Default,,0000,0000,0000,,${e.text.replace(/\n/g, "\\N")}`,
    )
    .join("\n");
  return `${header + dialogues}\n`;
}

export function toSub(entries: SubtitleEntry[]): string {
  // SubViewer format
  const header =
    "[INFORMATION]\n[TITLE]\n[AUTHOR]\n[SOURCE]\n[FILEPATH]\n[DELAY]0\n[COMMENT]\n[END INFORMATION]\n[SUBTITLE]\n[COLF]&HFFFFFF,[STYLE]no,[SIZE]18,[FONT]Arial\n";
  return (
    header +
    entries
      .map(
        (e) =>
          `${msToSrtTime(e.startMs).replace(",", ".")}→${msToSrtTime(e.endMs).replace(",", ".")}\n${e.text}\n`,
      )
      .join("\n")
  );
}

export function toSbv(entries: SubtitleEntry[]): string {
  return `${entries
    .map((e) => `${msToSbvTime(e.startMs)},${msToSbvTime(e.endMs)}\n${e.text}`)
    .join("\n\n")}\n`;
}

export function toLrc(entries: SubtitleEntry[]): string {
  return `${entries.map((e) => `[${msToLrcTime(e.startMs)}]${e.text}`).join("\n")}\n`;
}

export function toDfxp(entries: SubtitleEntry[]): string {
  const items = entries
    .map(
      (e) =>
        `    <p begin="${msToXmlTime(e.startMs)}" end="${msToXmlTime(e.endMs)}">${e.text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<tt xml:lang="en" xmlns="http://www.w3.org/ns/ttml">\n  <body>\n    <div>\n${items}\n    </div>\n  </body>\n</tt>\n`;
}

export function toStl(entries: SubtitleEntry[]): string {
  return `${entries
    .map((e) => `${msToSrtTime(e.startMs)}\t${msToSrtTime(e.endMs)}\t${e.text}`)
    .join("\n")}\n`;
}

export function serializeSubtitle(
  entries: SubtitleEntry[],
  format: SubtitleFormat,
): string {
  switch (format) {
    case "srt":
      return toSrt(entries);
    case "vtt":
      return toVtt(entries);
    case "ass":
    case "ssa":
      return toAss(entries);
    case "sub":
      return toSub(entries);
    case "sbv":
      return toSbv(entries);
    case "lrc":
      return toLrc(entries);
    case "dfxp":
    case "ttml":
      return toDfxp(entries);
    case "stl":
      return toStl(entries);
    default:
      return toSrt(entries);
  }
}

export function shiftTimings(
  entries: SubtitleEntry[],
  offsetMs: number,
): SubtitleEntry[] {
  return entries.map((e) => ({
    ...e,
    startMs: Math.max(0, e.startMs + offsetMs),
    endMs: Math.max(0, e.endMs + offsetMs),
  }));
}

export function formatTime(ms: number): string {
  return msToSrtTime(ms);
}
