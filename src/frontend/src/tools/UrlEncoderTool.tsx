import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function UrlEncoderTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const encode = (full: boolean) => {
    setOutput(full ? encodeURIComponent(input) : encodeURI(input));
    toast.success("Encoded");
  };

  const decode = () => {
    try {
      setOutput(decodeURIComponent(input));
      toast.success("Decoded");
    } catch {
      toast.error("Invalid URL encoding");
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        data-ocid="url.input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter URL or text..."
        className="font-mono text-sm min-h-[120px]"
      />
      <div className="flex gap-2 flex-wrap">
        <Button data-ocid="url.encode_button" onClick={() => encode(true)}>
          Encode (Full)
        </Button>
        <Button variant="outline" onClick={() => encode(false)}>
          Encode (URI)
        </Button>
        <Button
          data-ocid="url.decode_button"
          variant="outline"
          onClick={decode}
        >
          Decode
        </Button>
      </div>
      {output && (
        <div className="relative">
          <Textarea
            value={output}
            readOnly
            className="font-mono text-sm min-h-[120px]"
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2"
            onClick={() => {
              navigator.clipboard.writeText(output);
              toast.success("Copied!");
            }}
          >
            <Copy size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}
