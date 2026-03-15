import { Textarea } from "@/components/ui/textarea";
import { useMemo } from "react";
import { useState } from "react";

export default function WordCounter() {
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
    { label: "Characters", value: stats.chars },
    { label: "Chars (no spaces)", value: stats.charsNoSpace },
    { label: "Words", value: stats.words },
    { label: "Sentences", value: stats.sentences },
    { label: "Paragraphs", value: stats.paragraphs },
    { label: "Reading time", value: `~${stats.readingTime} min` },
    { label: "Speaking time", value: `~${stats.speakingTime} min` },
  ];

  return (
    <div className="space-y-4">
      <Textarea
        data-ocid="counter.input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start typing or paste text to count..."
        className="min-h-[200px]"
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statItems.map((item) => (
          <div
            key={item.label}
            className="bg-card border rounded-lg p-3 text-center"
          >
            <div className="text-2xl font-bold text-primary">{item.value}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
