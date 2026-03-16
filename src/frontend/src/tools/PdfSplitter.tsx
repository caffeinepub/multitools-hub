import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n";
import { Download, Scissors, Upload } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useRef, useState } from "react";
import { toast } from "sonner";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function parseRanges(rangeStr: string, maxPage: number): [number, number][] {
  const ranges: [number, number][] = [];
  const parts = rangeStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const part of parts) {
    if (part.includes("-")) {
      const [a, b] = part.split("-").map((s) => Number.parseInt(s.trim(), 10));
      if (
        !Number.isNaN(a) &&
        !Number.isNaN(b) &&
        a >= 1 &&
        b >= a &&
        b <= maxPage
      ) {
        ranges.push([a - 1, b - 1]);
      }
    } else {
      const n = Number.parseInt(part, 10);
      if (!Number.isNaN(n) && n >= 1 && n <= maxPage) {
        ranges.push([n - 1, n - 1]);
      }
    }
  }
  return ranges;
}

export default function PdfSplitter() {
  const { t } = useTranslation();
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [rangeInput, setRangeInput] = useState("");
  const [splitting, setSplitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [splitParts, setSplitParts] = useState<
    { name: string; bytes: Uint8Array }[]
  >([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = async (file: File) => {
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    try {
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      setPageCount(doc.getPageCount());
      setPdfBytes(bytes);
      setFileName(file.name);
      setFileSize(file.size);
      setSplitParts([]);
      setRangeInput("");
    } catch {
      toast.error("Failed to read PDF");
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = Array.from(e.dataTransfer.files).find(
      (f) => f.type === "application/pdf" || f.name.endsWith(".pdf"),
    );
    if (file) loadFile(file);
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) loadFile(e.target.files[0]);
    e.target.value = "";
  };

  const split = async () => {
    if (!pdfBytes || !rangeInput.trim()) {
      toast.error("Enter page ranges");
      return;
    }
    const ranges = parseRanges(rangeInput, pageCount);
    if (ranges.length === 0) {
      toast.error("Invalid page ranges");
      return;
    }
    setSplitting(true);
    try {
      const parts: { name: string; bytes: Uint8Array }[] = [];
      for (let ri = 0; ri < ranges.length; ri++) {
        const [from, to] = ranges[ri];
        const srcDoc = await PDFDocument.load(pdfBytes, {
          ignoreEncryption: true,
        });
        const newDoc = await PDFDocument.create();
        const indices = Array.from(
          { length: to - from + 1 },
          (_, i) => from + i,
        );
        const pages = await newDoc.copyPages(srcDoc, indices);
        for (const page of pages) newDoc.addPage(page);
        const out = await newDoc.save();
        parts.push({
          name: `${fileName.replace(/\.pdf$/i, "")}_part${ri + 1}_pages${from + 1}-${to + 1}.pdf`,
          bytes: out,
        });
      }
      setSplitParts(parts);
      toast.success(`Split into ${parts.length} part(s)`);
    } catch {
      toast.error("Failed to split PDF");
    }
    setSplitting(false);
  };

  const downloadPart = (part: { name: string; bytes: Uint8Array }) => {
    const blob = new Blob([new Uint8Array(part.bytes)], {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = part.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDropzoneKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {!pdfBytes ? (
        <div
          data-ocid="pdf_splitter.dropzone"
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={handleDropzoneKey}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          }`}
        >
          <Upload size={28} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            {t("pdf_drop_files")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("pdf_split_upload")}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={onFileInput}
            data-ocid="pdf_splitter.upload_button"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-card border rounded-lg px-4 py-3">
            <Scissors size={16} className="text-rose-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{fileName}</p>
              <p className="text-xs text-muted-foreground">
                {t("pdf_pages_total").replace("{n}", String(pageCount))} ·{" "}
                {formatSize(fileSize)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPdfBytes(null);
                setSplitParts([]);
              }}
              className="text-muted-foreground"
            >
              ✕
            </Button>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="pdf-range-input"
              className="text-sm font-medium text-foreground"
            >
              {t("pdf_ranges_label")}
            </label>
            <Input
              id="pdf-range-input"
              data-ocid="pdf_splitter.input"
              value={rangeInput}
              onChange={(e) => setRangeInput(e.target.value)}
              placeholder={t("pdf_ranges_placeholder")}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              {t("pdf_pages_total").replace("{n}", String(pageCount))}
            </p>
          </div>

          <Button
            data-ocid="pdf_splitter.primary_button"
            onClick={split}
            disabled={splitting || !rangeInput.trim()}
            className="w-full"
          >
            <Scissors size={15} className="mr-2" />
            {splitting ? "Splitting..." : t("pdf_split_button")}
          </Button>

          {splitParts.length > 0 && (
            <div className="space-y-2">
              {splitParts.map((part, i) => (
                <div
                  key={part.name}
                  data-ocid={`pdf_splitter.item.${i + 1}`}
                  className="flex items-center gap-3 bg-card border rounded-lg px-3 py-2.5"
                >
                  <span className="flex-1 text-sm truncate font-medium">
                    {part.name}
                  </span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatSize(part.bytes.length)}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    data-ocid={`pdf_splitter.secondary_button.${i + 1}`}
                    onClick={() => downloadPart(part)}
                    className="gap-1.5 text-xs"
                  >
                    <Download size={12} />
                    {t("pdf_download_part")}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
