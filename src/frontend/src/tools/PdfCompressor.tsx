import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { Download, Minimize2, Upload } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useRef, useState } from "react";
import { toast } from "sonner";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function compressPdf(input: Uint8Array): Promise<Uint8Array> {
  // Re-save with pdf-lib using object streams to reduce file size.
  // This removes redundant cross-reference tables and compresses object data.
  const doc = await PDFDocument.load(input, { ignoreEncryption: true });
  return doc.save({ useObjectStreams: true });
}

function uint8ArrayToBlob(data: Uint8Array, type: string): Blob {
  return new Blob([new Uint8Array(data)], { type });
}

export default function PdfCompressor() {
  const { t } = useTranslation();
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState("");
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedBytes, setCompressedBytes] = useState<Uint8Array | null>(
    null,
  );
  const [compressing, setCompressing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = async (file: File) => {
    const buf = await file.arrayBuffer();
    setPdfBytes(new Uint8Array(buf));
    setFileName(file.name);
    setOriginalSize(file.size);
    setCompressedBytes(null);
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

  const compress = async () => {
    if (!pdfBytes) return;
    setCompressing(true);
    try {
      const result = await compressPdf(pdfBytes);
      setCompressedBytes(result);
      const saved = Math.round((1 - result.length / originalSize) * 100);
      if (saved > 0) {
        toast.success(`Compressed! Saved ${saved}%`);
      } else {
        toast.info("File already optimized — minimal savings possible");
      }
    } catch {
      toast.error("Compression failed");
    }
    setCompressing(false);
  };

  const download = () => {
    if (!compressedBytes) return;
    const blob = uint8ArrayToBlob(compressedBytes, "application/pdf");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(/\.pdf$/i, "_compressed.pdf");
    a.click();
    URL.revokeObjectURL(url);
  };

  const savings = compressedBytes
    ? Math.max(0, Math.round((1 - compressedBytes.length / originalSize) * 100))
    : 0;

  const handleDropzoneKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {!pdfBytes ? (
        <div
          data-ocid="pdf_compressor.dropzone"
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
            {t("pdf_compress_upload")}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={onFileInput}
            data-ocid="pdf_compressor.upload_button"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-card border rounded-lg px-4 py-3">
            <Minimize2 size={16} className="text-rose-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{fileName}</p>
              <p className="text-xs text-muted-foreground">
                {t("pdf_original_size")}: {formatSize(originalSize)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPdfBytes(null);
                setCompressedBytes(null);
              }}
              className="text-muted-foreground"
            >
              ✕
            </Button>
          </div>

          {compressedBytes && (
            <div className="bg-card border rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {t("pdf_original_size")}
                  </p>
                  <p className="font-bold text-foreground text-sm">
                    {formatSize(originalSize)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {t("pdf_compressed_size")}
                  </p>
                  <p className="font-bold text-green-500 text-sm">
                    {formatSize(compressedBytes.length)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {t("pdf_savings")}
                  </p>
                  <p
                    className={`font-bold text-sm ${savings > 0 ? "text-green-500" : "text-muted-foreground"}`}
                  >
                    {savings > 0 ? `-${savings}%` : "~0%"}
                  </p>
                </div>
              </div>
              <Button
                data-ocid="pdf_compressor.secondary_button"
                variant="outline"
                onClick={download}
                className="w-full gap-2"
              >
                <Download size={15} />
                {t("pdf_download_compressed")}
              </Button>
            </div>
          )}

          <Button
            data-ocid="pdf_compressor.primary_button"
            onClick={compress}
            disabled={compressing}
            className="w-full"
          >
            <Minimize2 size={15} className="mr-2" />
            {compressing ? "Compressing..." : t("pdf_compress_button")}
          </Button>
        </div>
      )}
    </div>
  );
}
