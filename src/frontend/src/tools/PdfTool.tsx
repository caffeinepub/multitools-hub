import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, Loader2, Merge, Upload, X } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfFile {
  name: string;
  data: ArrayBuffer;
  pageCount: number;
}

export default function PdfTool() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [merging, setMerging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const loadPdf = useCallback(async (file: File): Promise<PdfFile> => {
    const data = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: data.slice(0) }).promise;
    return { name: file.name, data, pageCount: pdf.numPages };
  }, []);

  const renderPreview = useCallback(async (pdfFile: PdfFile) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const pdf = await pdfjsLib.getDocument({ data: pdfFile.data.slice(0) })
      .promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.2 });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;
    setLoading(true);
    try {
      const loaded = await Promise.all(selected.map(loadPdf));
      setFiles((prev) => [...prev, ...loaded]);
      if (loaded.length === 1) {
        await renderPreview(loaded[0]);
      }
      toast.success(
        `Loaded ${loaded.length} PDF${loaded.length > 1 ? "s" : ""}`,
      );
    } catch {
      toast.error("Failed to load PDF. Make sure it's a valid file.");
    }
    setLoading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error("Upload at least 2 PDFs to merge");
      return;
    }
    setMerging(true);
    try {
      const merged = await PDFDocument.create();
      for (const f of files) {
        const doc = await PDFDocument.load(f.data);
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        for (const page of pages) merged.addPage(page);
      }
      const bytes = await merged.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.pdf";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDFs merged and downloaded!");
    } catch {
      toast.error("Failed to merge PDFs");
    }
    setMerging(false);
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="w-full border-2 border-dashed border-border hover:border-primary/60 rounded-xl p-8 text-center cursor-pointer transition-colors group"
        data-ocid="pdf.dropzone"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Upload size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">Click to upload PDF files</p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports multiple files for merging
            </p>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          data-ocid="pdf.upload_button"
          onChange={handleFileChange}
        />
      </button>

      {loading && (
        <div
          className="flex items-center gap-2 text-sm text-muted-foreground"
          data-ocid="pdf.loading_state"
        >
          <Loader2 size={16} className="animate-spin" />
          Loading PDF...
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">
              {files.length} PDF{files.length > 1 ? "s" : ""} loaded
            </h3>
            {files.length >= 2 && (
              <Button
                size="sm"
                onClick={handleMerge}
                disabled={merging}
                data-ocid="pdf.merge_button"
                className="gap-2"
              >
                {merging ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Merge size={14} />
                )}
                {merging ? "Merging..." : "Merge & Download"}
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {files.map((f, i) => (
              <div
                key={f.name}
                className="flex items-center gap-3 p-3 bg-card border rounded-lg"
                data-ocid={`pdf.item.${i + 1}`}
              >
                <FileText size={18} className="text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{f.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {f.pageCount} page{f.pageCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => removeFile(i)}
                >
                  <X size={14} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {files.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">First Page Preview</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => renderPreview(files[0])}
                className="gap-2"
                data-ocid="pdf.secondary_button"
              >
                Refresh Preview
              </Button>
            </div>
            <div className="border rounded-xl overflow-hidden bg-muted/20">
              <canvas ref={canvasRef} className="max-w-full h-auto" />
            </div>
          </div>
        </>
      )}

      {files.length === 0 && !loading && (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="pdf.empty_state"
        >
          <FileText size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">No PDFs loaded yet</p>
          <p className="text-xs mt-1">
            Upload a PDF to view its info and preview
          </p>
        </div>
      )}
    </div>
  );
}
