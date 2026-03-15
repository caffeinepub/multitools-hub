import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/lib/i18n";
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
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const convert = (fn: (s: string) => string) => {
    setOutput(fn(input));
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    toast.success(t("copied"));
  };

  const cases = [
    {
      labelKey: "tc_uppercase" as const,
      fn: (s: string) => s.toUpperCase(),
      ocid: "textcase.uppercase_button",
    },
    {
      labelKey: "tc_lowercase" as const,
      fn: (s: string) => s.toLowerCase(),
      ocid: "textcase.lowercase_button",
    },
    {
      labelKey: "tc_title" as const,
      fn: toTitleCase,
      ocid: "textcase.title_button",
    },
    {
      labelKey: "tc_sentence" as const,
      fn: toSentenceCase,
      ocid: "textcase.sentence_button",
    },
    {
      labelKey: "tc_camel" as const,
      fn: toCamelCase,
      ocid: "textcase.camel_button",
    },
    {
      labelKey: "tc_pascal" as const,
      fn: toPascalCase,
      ocid: "textcase.pascal_button",
    },
    {
      labelKey: "tc_snake" as const,
      fn: toSnakeCase,
      ocid: "textcase.snake_button",
    },
    {
      labelKey: "tc_kebab" as const,
      fn: toKebabCase,
      ocid: "textcase.kebab_button",
    },
    { labelKey: "tc_dot" as const, fn: toDotCase, ocid: "textcase.dot_button" },
  ];

  return (
    <div className="space-y-4">
      <Textarea
        data-ocid="textcase.input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t("tc_placeholder")}
        className="min-h-[140px]"
      />
      <div className="flex flex-wrap gap-2">
        {cases.map((c) => (
          <Button
            key={c.labelKey}
            variant="outline"
            size="sm"
            data-ocid={c.ocid}
            onClick={() => convert(c.fn)}
          >
            {t(c.labelKey)}
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
