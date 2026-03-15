import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/lib/i18n";
import { ArrowDown, ArrowUp, Copy, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export default function Base64Tool() {
  const { t } = useTranslation();
  const [plain, setPlain] = useState("");
  const [encoded, setEncoded] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const encode = () => {
    try {
      setEncoded(btoa(unescape(encodeURIComponent(plain))));
      toast.success("Encoded");
    } catch {
      toast.error("Encoding failed");
    }
  };

  const decode = () => {
    try {
      setPlain(decodeURIComponent(escape(atob(encoded))));
      toast.success("Decoded");
    } catch {
      toast.error("Invalid Base64");
    }
  };

  const encodeFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setEncoded(result.split(",")[1] || "");
      toast.success("File encoded as Base64");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{t("b64_plain")}</p>
          <Textarea
            data-ocid="base64.input"
            value={plain}
            onChange={(e) => setPlain(e.target.value)}
            placeholder={t("b64_placeholder")}
            className="font-mono text-xs min-h-[240px]"
          />
          <div className="flex gap-2 flex-wrap">
            <Button data-ocid="base64.encode_button" onClick={encode}>
              <ArrowDown size={14} className="mr-1" />
              {t("b64_encode")}
            </Button>
            <Button
              data-ocid="base64.upload_button"
              variant="outline"
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={14} className="mr-1" />
              {t("b64_encode_file")}
            </Button>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) encodeFile(f);
              }}
            />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{t("b64_base64")}</p>
          <div className="relative">
            <Textarea
              value={encoded}
              onChange={(e) => setEncoded(e.target.value)}
              placeholder={t("b64_paste")}
              className="font-mono text-xs min-h-[240px]"
            />
            {encoded && (
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => {
                  navigator.clipboard.writeText(encoded);
                  toast.success(t("copied"));
                }}
              >
                <Copy size={14} />
              </Button>
            )}
          </div>
          <Button
            data-ocid="base64.decode_button"
            variant="outline"
            onClick={decode}
          >
            <ArrowUp size={14} className="mr-1" />
            {t("b64_decode")}
          </Button>
        </div>
      </div>
    </div>
  );
}
