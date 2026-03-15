import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Copy, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState("2");
  const [status, setStatus] = useState<"idle" | "valid" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const format = () => {
    try {
      const parsed = JSON.parse(input);
      const indentVal = indent === "tab" ? "\t" : Number.parseInt(indent);
      setOutput(JSON.stringify(parsed, null, indentVal));
      setStatus("valid");
      setErrorMsg("");
      toast.success("JSON formatted");
    } catch (e: unknown) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Invalid JSON");
      toast.error("Invalid JSON");
    }
  };

  const minify = () => {
    try {
      setOutput(JSON.stringify(JSON.parse(input)));
      setStatus("valid");
      setErrorMsg("");
    } catch (e: unknown) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  const validate = () => {
    try {
      JSON.parse(input);
      setStatus("valid");
      setErrorMsg("");
      toast.success("Valid JSON!");
    } catch (e: unknown) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Invalid JSON");
      toast.error("Invalid JSON");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center flex-wrap">
        <Select value={indent} onValueChange={setIndent}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 spaces</SelectItem>
            <SelectItem value="4">4 spaces</SelectItem>
            <SelectItem value="tab">Tab</SelectItem>
          </SelectContent>
        </Select>
        <Button data-ocid="json.format_button" onClick={format}>
          Format
        </Button>
        <Button
          data-ocid="json.minify_button"
          variant="outline"
          onClick={minify}
        >
          Minify
        </Button>
        <Button variant="outline" onClick={validate}>
          Validate
        </Button>
        {status === "valid" && (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle size={12} className="mr-1" />
            Valid
          </Badge>
        )}
        {status === "error" && (
          <Badge variant="destructive" data-ocid="json.error_state">
            <XCircle size={12} className="mr-1" />
            Error
          </Badge>
        )}
      </div>
      {errorMsg && (
        <p className="text-sm text-destructive font-mono">{errorMsg}</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Input</p>
          <Textarea
            data-ocid="json.input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{ "key": "value" }'
            className="font-mono text-xs min-h-[320px]"
          />
        </div>
        <div className="relative">
          <p className="text-xs text-muted-foreground mb-1">Output</p>
          <Textarea
            value={output}
            readOnly
            className="font-mono text-xs min-h-[320px]"
          />
          {output && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-6 right-2"
              onClick={() => {
                navigator.clipboard.writeText(output);
                toast.success("Copied!");
              }}
            >
              <Copy size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
