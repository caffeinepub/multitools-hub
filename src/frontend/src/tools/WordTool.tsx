import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, Loader2, Upload } from "lucide-react";
import mammoth from "mammoth";
import { useRef, useState } from "react";
import { toast } from "sonner";

export default function WordTool() {
  const [htmlContent, setHtmlContent] = useState("");
  const [plainText, setPlainText] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".docx")) {
      toast.error("Only .docx files are supported");
      return;
    }
    setLoading(true);
    setFileName(file.name);
    try {
      const buffer = await file.arrayBuffer();
      const [htmlResult, textResult] = await Promise.all([
        mammoth.convertToHtml({ arrayBuffer: buffer }),
        mammoth.extractRawText({ arrayBuffer: buffer }),
      ]);
      setHtmlContent(htmlResult.value);
      setPlainText(textResult.value);
      toast.success(`Loaded: ${file.name}`);
    } catch {
      toast.error("Failed to parse .docx file");
    }
    setLoading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const downloadTxt = () => {
    if (!plainText) return;
    const blob = new Blob([plainText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(".docx", ".txt") || "document.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded as .txt");
  };

  return (
    <div className="space-y-6">
      {/* Upload */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="w-full border-2 border-dashed border-border hover:border-primary/60 rounded-xl p-8 text-center cursor-pointer transition-colors group"
        data-ocid="word.dropzone"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Upload size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">
              Click to upload a Word document
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports .docx format
            </p>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          data-ocid="word.upload_button"
          onChange={handleFile}
        />
      </button>

      {loading && (
        <div
          className="flex items-center gap-2 text-sm text-muted-foreground"
          data-ocid="word.loading_state"
        >
          <Loader2 size={16} className="animate-spin" />
          Parsing document...
        </div>
      )}

      {htmlContent && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-primary" />
              <span className="text-sm font-medium truncate max-w-xs">
                {fileName}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={downloadTxt}
              data-ocid="word.download_button"
              className="gap-2"
            >
              <Download size={14} />
              Download TXT
            </Button>
          </div>

          <Tabs defaultValue="preview">
            <TabsList>
              <TabsTrigger value="preview">HTML Preview</TabsTrigger>
              <TabsTrigger value="text">Plain Text</TabsTrigger>
            </TabsList>
            <TabsContent value="preview">
              <div
                className="border rounded-xl p-6 bg-card prose prose-sm max-w-none dark:prose-invert overflow-auto max-h-[500px]"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: mammoth output is sanitized
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </TabsContent>
            <TabsContent value="text">
              <pre className="border rounded-xl p-4 bg-muted/30 text-sm font-mono whitespace-pre-wrap overflow-auto max-h-[500px]">
                {plainText}
              </pre>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {!htmlContent && !loading && (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="word.empty_state"
        >
          <FileText size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">No document loaded</p>
          <p className="text-xs mt-1">
            Upload a .docx file to preview its content
          </p>
        </div>
      )}
    </div>
  );
}
