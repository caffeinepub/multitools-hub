import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/lib/i18n";
import { useMemo, useState } from "react";

export default function WordCounter() {
  const { t } = useTranslation();
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim()).length;
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim()).length;
    const readingTime = Math.ceil(words / 200);
    const speakingTime = Math.ceil(words / 130);
    return {
      chars,
      charsNoSpace,
      words,
      sentences,
      paragraphs,
      readingTime,
      speakingTime,
    };
  }, [text]);

  const statItems = [
    { labelKey: "wc_chars" as const, value: stats.chars },
    { labelKey: "wc_chars_nospace" as const, value: stats.charsNoSpace },
    { labelKey: "wc_words" as const, value: stats.words },
    { labelKey: "wc_sentences" as const, value: stats.sentences },
    { labelKey: "wc_paragraphs" as const, value: stats.paragraphs },
    { labelKey: "wc_reading" as const, value: `~${stats.readingTime} min` },
    { labelKey: "wc_speaking" as const, value: `~${stats.speakingTime} min` },
  ];

  return (
    <div className="space-y-4">
      <Textarea
        data-ocid="counter.input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("wc_placeholder")}
        className="min-h-[200px]"
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statItems.map((item) => (
          <div
            key={item.labelKey}
            className="bg-card border rounded-lg p-3 text-center"
          >
            <div className="text-2xl font-bold text-primary">{item.value}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t(item.labelKey)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
