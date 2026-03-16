import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { FileStack, GripVertical, Trash2, Upload } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface PdfFile {
  id: string;
  name: string;
  size: number;
  bytes: Uint8Array;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function PdfMerger() {
  const { t } = useTranslation();
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [merging, setMerging] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const readFiles = async (fileList: File[]) => {
    const pdfs = fileList.filter(
      (f) => f.type === "application/pdf" || f.name.endsWith(".pdf"),
    );
    const entries = await Promise.all(
      pdfs.map(async (f) => {
        const buf = await f.arrayBuffer();
        return {
          id: `${f.name}-${Date.now()}-${Math.random()}`,
          name: f.name,
          size: f.size,
          bytes: new Uint8Array(buf),
        } as PdfFile;
      }),
    );
    setFiles((prev) => [...prev, ...entries]);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    readFiles(Array.from(e.dataTransfer.files));
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) readFiles(Array.from(e.target.files));
    e.target.value = "";
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleRowDragStart = (i: number) => setDragIndex(i);
  const handleRowDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    setDragOverIndex(i);
  };
  const handleRowDrop = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === i) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    setFiles((prev) => {
      const next = [...prev];
      const [item] = next.splice(dragIndex, 1);
      next.splice(i, 0, item);
      return next;
    });
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const merge = async () => {
    if (files.length < 2) {
      toast.error("Add at least 2 PDFs");
      return;
    }
    setMerging(true);
    try {
      const merged = await PDFDocument.create();
      for (const f of files) {
        const doc = await PDFDocument.load(f.bytes, { ignoreEncryption: true });
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        for (const page of pages) merged.addPage(page);
      }
      const out = await merged.save();
      const blob = new Blob([new Uint8Array(out)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.pdf";
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t("pdf_download_merged"));
    } catch {
      toast.error("Failed to merge PDFs");
    }
    setMerging(false);
  };

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const handleDropzoneKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div
        data-ocid="pdf_merger.dropzone"
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
          {t("pdf_upload_prompt")}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={onFileInput}
          data-ocid="pdf_merger.upload_button"
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>
              {t("pdf_files_count").replace("{n}", String(files.length))}
            </span>
            <span>
              {t("pdf_total_size").replace("{size}", formatSize(totalSize))}
            </span>
          </div>

          <div className="space-y-1.5">
            {files.map((f, i) => (
              <div
                key={f.id}
                draggable
                onDragStart={() => handleRowDragStart(i)}
                onDragOver={(e) => handleRowDragOver(e, i)}
                onDrop={(e) => handleRowDrop(e, i)}
                onDragEnd={() => {
                  setDragIndex(null);
                  setDragOverIndex(null);
                }}
                data-ocid={`pdf_merger.item.${i + 1}`}
                className={`flex items-center gap-3 bg-card border rounded-lg px-3 py-2.5 text-sm transition-all ${
                  dragOverIndex === i
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : "border-border"
                }`}
              >
                <GripVertical
                  size={15}
                  className="text-muted-foreground cursor-grab flex-shrink-0"
                  data-ocid={`pdf_merger.drag_handle.${i + 1}`}
                />
                <FileStack size={15} className="text-rose-500 flex-shrink-0" />
                <span className="flex-1 truncate text-foreground font-medium">
                  {f.name}
                </span>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {formatSize(f.size)}
                </span>
                <button
                  type="button"
                  data-ocid={`pdf_merger.delete_button.${i + 1}`}
                  onClick={() => removeFile(f.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <Button
            data-ocid="pdf_merger.primary_button"
            onClick={merge}
            disabled={merging || files.length < 2}
            className="w-full"
          >
            <FileStack size={15} className="mr-2" />
            {merging ? "Merging..." : t("pdf_merge_button")}
          </Button>
        </div>
      )}

      {files.length === 0 && (
        <div
          data-ocid="pdf_merger.empty_state"
          className="text-center text-sm text-muted-foreground py-2"
        >
          {t("pdf_upload_prompt")}
        </div>
      )}
    </div>
  );
}
