import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n";
import { Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const TIMEZONES = [
  { label: "UTC", tz: "UTC" },
  { label: "New York (ET)", tz: "America/New_York" },
  { label: "London (GMT)", tz: "Europe/London" },
  { label: "Paris (CET)", tz: "Europe/Paris" },
  { label: "Jakarta (WIB)", tz: "Asia/Jakarta" },
  { label: "Singapore (SGT)", tz: "Asia/Singapore" },
  { label: "Tokyo (JST)", tz: "Asia/Tokyo" },
  { label: "Sydney (AEDT)", tz: "Australia/Sydney" },
];

export default function TimestampConverter() {
  const { t } = useTranslation();
  const [tsInput, setTsInput] = useState(String(Math.floor(Date.now() / 1000)));
  const [dateInput, setDateInput] = useState("");
  const [results, setResults] = useState<{ label: string; value: string }[]>(
    [],
  );

  const fromTimestamp = (overrideTs?: string) => {
    const str = overrideTs ?? tsInput;
    const num = Number.parseInt(str);
    if (Number.isNaN(num)) {
      toast.error("Invalid timestamp");
      return;
    }
    const ms = str.length > 11 ? num : num * 1000;
    const date = new Date(ms);
    const r = [
      { label: "Unix (seconds)", value: String(Math.floor(ms / 1000)) },
      { label: "Unix (milliseconds)", value: String(ms) },
      { label: "ISO 8601", value: date.toISOString() },
      ...TIMEZONES.map((tz) => ({
        label: tz.label,
        value: date.toLocaleString("en-US", {
          timeZone: tz.tz,
          dateStyle: "full",
          timeStyle: "long",
        }),
      })),
    ];
    setResults(r);
  };

  const fromDate = () => {
    const d = new Date(dateInput);
    if (Number.isNaN(d.getTime())) {
      toast.error("Invalid date");
      return;
    }
    const ts = String(Math.floor(d.getTime() / 1000));
    setTsInput(ts);
    fromTimestamp(ts);
  };

  const now = () => {
    const ts = String(Math.floor(Date.now() / 1000));
    setTsInput(ts);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">{t("ts_unix")}</p>
          <div className="flex gap-2">
            <Input
              data-ocid="timestamp.input"
              value={tsInput}
              onChange={(e) => setTsInput(e.target.value)}
              placeholder="1234567890"
              className="font-mono flex-1"
            />
            <Button variant="outline" onClick={now}>
              {t("ts_now")}
            </Button>
          </div>
          <Button
            data-ocid="timestamp.convert_button"
            onClick={() => fromTimestamp()}
          >
            {t("ts_convert")}
          </Button>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">{t("ts_datetime")}</p>
          <Input
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            type="datetime-local"
          />
          <Button variant="outline" onClick={fromDate}>
            {t("ts_from_date")}
          </Button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r) => (
            <div
              key={r.label}
              className="bg-card border rounded-lg p-3 flex items-center justify-between gap-2"
            >
              <div className="min-w-0 flex-1">
                <div className="text-xs text-muted-foreground">{r.label}</div>
                <div className="font-mono text-sm break-all">{r.value}</div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="flex-shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(r.value);
                  toast.success(t("copied"));
                }}
              >
                <Copy size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
