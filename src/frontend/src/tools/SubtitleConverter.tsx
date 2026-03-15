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
import { useTranslation } from "@/lib/i18n";
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
  const { t } = useTranslation();
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
        <Badge variant="secondary">{t("tool_subtitle_label")}</Badge>
        <span className="text-muted-foreground text-sm">
          {entries.length} {t("sub_entries")}
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
        className={`w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
      >
        <Upload className="mx-auto mb-2 text-muted-foreground" size={24} />
        <p className="text-sm text-muted-foreground">{t("sub_drop")}</p>
        <p className="text-xs text-muted-foreground mt-1">{t("sub_formats")}</p>
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

      {/* Format selectors - stack on mobile */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm font-medium whitespace-nowrap">
            {t("sub_input")}
          </span>
          <Select
            value={inputFormat}
            onValueChange={(v) => setInputFormat(v as SubtitleFormat)}
          >
            <SelectTrigger
              className="flex-1 sm:w-44"
              data-ocid="subtitle.input_select"
            >
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
        <span className="text-muted-foreground hidden sm:inline">→</span>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm font-medium whitespace-nowrap">
            {t("sub_output")}
          </span>
          <Select
            value={outputFormat}
            onValueChange={(v) => setOutputFormat(v as SubtitleFormat)}
          >
            <SelectTrigger
              className="flex-1 sm:w-44"
              data-ocid="subtitle.output_select"
            >
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
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleParse} data-ocid="subtitle.convert_button">
            <FileText size={16} className="mr-1" /> {t("sub_parse")}
          </Button>
          <Button
            onClick={handleDownload}
            data-ocid="subtitle.download_button"
            variant="outline"
          >
            <Download size={16} className="mr-1" /> {t("sub_download")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="editor">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="raw">{t("sub_raw")}</TabsTrigger>
          <TabsTrigger value="editor">{t("sub_editor")}</TabsTrigger>
          <TabsTrigger value="preview">{t("sub_preview")}</TabsTrigger>
        </TabsList>

        <TabsContent value="raw" className="space-y-2">
          <Textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={t("sub_paste")}
            className="font-mono text-xs min-h-[320px]"
          />
          <Button onClick={handleParse} size="sm">
            {t("sub_parse_text")}
          </Button>
        </TabsContent>

        <TabsContent
          value="editor"
          className="space-y-3"
          data-ocid="subtitle.editor"
        >
          <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-lg flex-wrap">
            <Clock size={16} className="text-muted-foreground" />
            <span className="text-sm">{t("sub_shift")}</span>
            <Input
              type="number"
              value={offsetMs}
              onChange={(e) => setOffsetMs(Number(e.target.value))}
              className="w-24"
              placeholder="ms"
            />
            <span className="text-xs text-muted-foreground">ms</span>
            <Button size="sm" variant="outline" onClick={applyShift}>
              {t("sub_apply")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={addEntry}
              data-ocid="subtitle.add_button"
            >
              <Plus size={14} className="mr-1" /> {t("sub_add_row")}
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left w-12">#</th>
                  <th className="px-3 py-2 text-left">Start</th>
                  <th className="px-3 py-2 text-left">End</th>
                  <th className="px-3 py-2 text-left">Dur.</th>
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
                        className="font-mono text-xs h-7 w-32"
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
                        className="font-mono text-xs h-7 w-32"
                      />
                    </td>
                    <td className="px-3 py-1 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {((entry.endMs - entry.startMs) / 1000).toFixed(2)}s
                    </td>
                    <td className="px-3 py-1">
                      <Input
                        value={entry.text}
                        onChange={(e) =>
                          updateEntry(idx, "text", e.target.value)
                        }
                        className="text-xs h-7 min-w-[160px]"
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
                      {t("sub_empty")}
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
                toast.success(t("copied"));
              }}
            >
              {t("sub_copy")}
            </Button>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
