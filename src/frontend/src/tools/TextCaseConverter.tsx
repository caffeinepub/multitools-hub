import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const toTitleCase = (s: string) =>
  s.replace(
    /\w\S*/g,
    (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase(),
  );
const toSentenceCase = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
const toCamelCase = (s: string) =>
  s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
const toPascalCase = (s: string) => {
  const c = toCamelCase(s);
  return c.charAt(0).toUpperCase() + c.slice(1);
};
const toSnakeCase = (s: string) =>
  s
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "");
const toKebabCase = (s: string) =>
  s
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "");
const toDotCase = (s: string) =>
  s
    .toLowerCase()
    .replace(/[\s_-]+/g, ".")
    .replace(/[^a-zA-Z0-9.]/g, "");

export default function TextCaseConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const convert = (fn: (s: string) => string) => {
    setOutput(fn(input));
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied!");
  };

  const cases = [
    {
      label: "UPPERCASE",
      fn: (s: string) => s.toUpperCase(),
      ocid: "textcase.uppercase_button",
    },
    {
      label: "lowercase",
      fn: (s: string) => s.toLowerCase(),
      ocid: "textcase.lowercase_button",
    },
    { label: "Title Case", fn: toTitleCase, ocid: "textcase.title_button" },
    {
      label: "Sentence case",
      fn: toSentenceCase,
      ocid: "textcase.sentence_button",
    },
    { label: "camelCase", fn: toCamelCase, ocid: "textcase.camel_button" },
    { label: "PascalCase", fn: toPascalCase, ocid: "textcase.pascal_button" },
    { label: "snake_case", fn: toSnakeCase, ocid: "textcase.snake_button" },
    { label: "kebab-case", fn: toKebabCase, ocid: "textcase.kebab_button" },
    { label: "dot.case", fn: toDotCase, ocid: "textcase.dot_button" },
  ];

  return (
    <div className="space-y-4">
      <Textarea
        data-ocid="textcase.input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter your text here..."
        className="min-h-[140px]"
      />
      <div className="flex flex-wrap gap-2">
        {cases.map((c) => (
          <Button
            key={c.label}
            variant="outline"
            size="sm"
            data-ocid={c.ocid}
            onClick={() => convert(c.fn)}
          >
            {c.label}
          </Button>
        ))}
      </div>
      {output && (
        <div className="relative">
          <Textarea value={output} readOnly className="min-h-[140px] pr-12" />
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2"
            onClick={copy}
          >
            <Copy size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}
