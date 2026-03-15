import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  FORMAT_EXTENSIONS,
  FORMAT_LABELS,
  type SubtitleEntry,
  type SubtitleFormat,
  detectFormat,
  msToSrtTime,
  parseSubtitle,
  serializeSubtitle,
  shiftTimings,
} from "@/lib/subtitleUtils";
import { Clock, Download, FileText, Plus, Trash2, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

const FORMATS = Object.keys(FORMAT_LABELS) as SubtitleFormat[];

export default function SubtitleConverter() {
  const [rawText, setRawText] = useState("");
  const [entries, setEntries] = useState<SubtitleEntry[]>([]);
  const [inputFormat, setInputFormat] = useState<SubtitleFormat>("srt");
  const [outputFormat, setOutputFormat] = useState<SubtitleFormat>("vtt");
  const [offsetMs, setOffsetMs] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setRawText(text);
      const fmt = detectFormat(text) as SubtitleFormat;
      setInputFormat(fmt);
      const parsed = parseSubtitle(text, fmt);
      setEntries(parsed);
      toast.success(
        `Loaded ${parsed.length} entries (detected: ${FORMAT_LABELS[fmt]})`,
      );
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) loadFile(file);
    },
    [loadFile],
  );

  const handleParse = () => {
    try {
      const parsed = parseSubtitle(rawText, inputFormat);
      setEntries(parsed);
      toast.success(`Parsed ${parsed.length} entries`);
    } catch {
      toast.error("Failed to parse subtitle");
    }
  };

  const handleDownload = () => {
    if (!entries.length) {
      toast.error("No entries to export");
      return;
    }
    const output = serializeSubtitle(entries, outputFormat);
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subtitle.${FORMAT_EXTENSIONS[outputFormat]}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded as .${FORMAT_EXTENSIONS[outputFormat]}`);
  };

  const updateEntry = (
    idx: number,
    field: keyof SubtitleEntry,
    value: string | number,
  ) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e)),
    );
  };

  const addEntry = () => {
    const last = entries[entries.length - 1];
    const start = last ? last.endMs + 500 : 0;
    setEntries((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        startMs: start,
        endMs: start + 3000,
        text: "New subtitle",
      },
    ]);
  };

  const removeEntry = (idx: number) =>
    setEntries((prev) => prev.filter((_, i) => i !== idx));

  const applyShift = () => {
    setEntries((prev) => shiftTimings(prev, offsetMs));
    toast.success(`Shifted all timings by ${offsetMs}ms`);
  };

  const outputPreview = entries.length
    ? serializeSubtitle(entries, outputFormat)
    : "";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="secondary">Subtitle Converter & Editor</Badge>
        <span className="text-muted-foreground text-sm">
          {entries.length} entries loaded
        </span>
      </div>

      <button
        type="button"
        data-ocid="subtitle.dropzone"
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
      >
        <Upload className="mx-auto mb-2 text-muted-foreground" size={24} />
        <p className="text-sm text-muted-foreground">
          Drop subtitle file here or click to browse
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          SRT, VTT, ASS, SSA, SUB, SBV, LRC, DFXP, TTML, STL
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".srt,.vtt,.ass,.ssa,.sub,.sbv,.lrc,.dfxp,.ttml,.stl,.xml"
          className="hidden"
          data-ocid="subtitle.upload_button"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) loadFile(f);
          }}
        />
      </button>

      <div className="flex gap-3 flex-wrap items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Input:</span>
          <Select
            value={inputFormat}
            onValueChange={(v) => setInputFormat(v as SubtitleFormat)}
          >
            <SelectTrigger className="w-48" data-ocid="subtitle.input_select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORMATS.map((f) => (
                <SelectItem key={f} value={f}>
                  {FORMAT_LABELS[f]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="text-muted-foreground">→</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Output:</span>
          <Select
            value={outputFormat}
            onValueChange={(v) => setOutputFormat(v as SubtitleFormat)}
          >
            <SelectTrigger className="w-48" data-ocid="subtitle.output_select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORMATS.map((f) => (
                <SelectItem key={f} value={f}>
                  {FORMAT_LABELS[f]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleParse} data-ocid="subtitle.convert_button">
          <FileText size={16} className="mr-1" /> Parse / Convert
        </Button>
        <Button
          onClick={handleDownload}
          data-ocid="subtitle.download_button"
          variant="outline"
        >
          <Download size={16} className="mr-1" /> Download
        </Button>
      </div>

      <Tabs defaultValue="editor">
        <TabsList>
          <TabsTrigger value="raw">Raw Input</TabsTrigger>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview Output</TabsTrigger>
        </TabsList>

        <TabsContent value="raw" className="space-y-2">
          <Textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste subtitle text here..."
            className="font-mono text-xs min-h-[320px]"
          />
          <Button onClick={handleParse} size="sm">
            Parse Text
          </Button>
        </TabsContent>

        <TabsContent
          value="editor"
          className="space-y-3"
          data-ocid="subtitle.editor"
        >
          <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-lg flex-wrap">
            <Clock size={16} className="text-muted-foreground" />
            <span className="text-sm">Shift all timings:</span>
            <Input
              type="number"
              value={offsetMs}
              onChange={(e) => setOffsetMs(Number(e.target.value))}
              className="w-28"
              placeholder="ms"
            />
            <span className="text-xs text-muted-foreground">ms</span>
            <Button size="sm" variant="outline" onClick={applyShift}>
              Apply
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={addEntry}
              data-ocid="subtitle.add_button"
            >
              <Plus size={14} className="mr-1" /> Add Row
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left w-12">#</th>
                  <th className="px-3 py-2 text-left">Start</th>
                  <th className="px-3 py-2 text-left">End</th>
                  <th className="px-3 py-2 text-left">Duration</th>
                  <th className="px-3 py-2 text-left">Text</th>
                  <th className="px-3 py-2 w-10" />
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => (
                  <tr
                    key={entry.id}
                    className="border-t hover:bg-muted/30"
                    data-ocid={`subtitle.row.${idx + 1}`}
                  >
                    <td className="px-3 py-1 text-muted-foreground font-mono">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-1">
                      <Input
                        value={msToSrtTime(entry.startMs)}
                        onChange={(e) => {
                          const parts = e.target.value.split(/[,.]/);
                          const [h, m, s] = (parts[0] || "00:00:00")
                            .split(":")
                            .map(Number);
                          const ms2 =
                            h * 3600000 +
                            m * 60000 +
                            s * 1000 +
                            Number.parseInt(parts[1] || "0");
                          updateEntry(
                            idx,
                            "startMs",
                            Number.isNaN(ms2) ? entry.startMs : ms2,
                          );
                        }}
                        className="font-mono text-xs h-7 w-36"
                      />
                    </td>
                    <td className="px-3 py-1">
                      <Input
                        value={msToSrtTime(entry.endMs)}
                        onChange={(e) => {
                          const parts = e.target.value.split(/[,.]/);
                          const [h, m, s] = (parts[0] || "00:00:00")
                            .split(":")
                            .map(Number);
                          const ms2 =
                            h * 3600000 +
                            m * 60000 +
                            s * 1000 +
                            Number.parseInt(parts[1] || "0");
                          updateEntry(
                            idx,
                            "endMs",
                            Number.isNaN(ms2) ? entry.endMs : ms2,
                          );
                        }}
                        className="font-mono text-xs h-7 w-36"
                      />
                    </td>
                    <td className="px-3 py-1 font-mono text-xs text-muted-foreground">
                      {((entry.endMs - entry.startMs) / 1000).toFixed(2)}s
                    </td>
                    <td className="px-3 py-1">
                      <Input
                        value={entry.text}
                        onChange={(e) =>
                          updateEntry(idx, "text", e.target.value)
                        }
                        className="text-xs h-7 min-w-[200px]"
                      />
                    </td>
                    <td className="px-3 py-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => removeEntry(idx)}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-8 text-center text-muted-foreground"
                    >
                      No entries. Upload a file or paste text.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <Textarea
            value={outputPreview}
            readOnly
            className="font-mono text-xs min-h-[320px]"
          />
          {outputPreview && (
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => {
                navigator.clipboard.writeText(outputPreview);
                toast.success("Copied!");
              }}
            >
              Copy to Clipboard
            </Button>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
