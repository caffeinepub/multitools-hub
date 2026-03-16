import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface SheetRow {
  rowNum: number;
  cells: string[];
}

interface SheetData {
  headers: string[];
  rows: SheetRow[];
  totalRows: number;
  totalCols: number;
  sheetName: string;
}

function ExcelHeaderCell({
  header,
  colIdx,
}: { header: string; colIdx: number }) {
  return (
    <th className="px-3 py-2 text-left font-medium whitespace-nowrap">
      {header || (
        <span className="text-muted-foreground italic">Col {colIdx + 1}</span>
      )}
    </th>
  );
}

export default function ExcelTool() {
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setFileName(file.name);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData: string[][] = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: "",
      });

      if (jsonData.length === 0) {
        toast.error("Spreadsheet appears to be empty");
        setLoading(false);
        return;
      }

      const headers = (jsonData[0] || []).map(String);
      // Pre-number rows to avoid using map index in JSX key
      const rows: SheetRow[] = jsonData.slice(1, 101).map((row, mapIdx) => ({
        rowNum: mapIdx + 1,
        cells: headers.map((_, ci) => String(row[ci] ?? "")),
      }));

      setSheetData({
        headers,
        rows,
        totalRows: jsonData.length - 1,
        totalCols: headers.length,
        sheetName,
      });
      toast.success(`Loaded ${jsonData.length - 1} rows from "${sheetName}"`);
    } catch {
      toast.error("Failed to parse spreadsheet");
    }
    setLoading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const downloadCsv = () => {
    if (!sheetData) return;
    const allRows = [sheetData.headers, ...sheetData.rows.map((r) => r.cells)]
      .map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([allRows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(/\.[^.]+$/, ".csv") || "data.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded as CSV");
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="w-full border-2 border-dashed border-border hover:border-primary/60 rounded-xl p-8 text-center cursor-pointer transition-colors group"
        data-ocid="excel.dropzone"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Upload size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">Click to upload a spreadsheet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports .xlsx, .xls, .csv
            </p>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
          className="hidden"
          data-ocid="excel.upload_button"
          onChange={handleFile}
        />
      </button>

      {loading && (
        <div
          className="flex items-center gap-2 text-sm text-muted-foreground"
          data-ocid="excel.loading_state"
        >
          <Loader2 size={16} className="animate-spin" />
          Parsing spreadsheet...
        </div>
      )}

      {sheetData && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={16} className="text-primary" />
              <span className="text-sm font-medium truncate max-w-xs">
                {fileName}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 ml-auto">
              <Badge variant="secondary">{sheetData.sheetName}</Badge>
              <Badge variant="outline">
                {sheetData.totalRows.toLocaleString()} rows
              </Badge>
              <Badge variant="outline">{sheetData.totalCols} cols</Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={downloadCsv}
                data-ocid="excel.download_button"
                className="gap-2"
              >
                <Download size={14} />
                CSV
              </Button>
            </div>
          </div>

          {sheetData.totalRows > 100 && (
            <p className="text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md">
              Showing first 100 of {sheetData.totalRows.toLocaleString()} rows
            </p>
          )}

          <ScrollArea className="h-[450px] border rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-muted/90 backdrop-blur-sm">
                  <tr>
                    <th className="px-3 py-2 text-left text-muted-foreground font-medium w-10">
                      #
                    </th>
                    {sheetData.headers.map((h, colIdx) => (
                      <ExcelHeaderCell
                        key={`h-${colIdx}-${h}`}
                        header={h}
                        colIdx={colIdx}
                      />
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sheetData.rows.map((row) => (
                    <tr
                      key={`row-${row.rowNum}`}
                      className="border-t border-border/50 hover:bg-muted/30 transition-colors"
                      data-ocid={`excel.row.${row.rowNum}`}
                    >
                      <td className="px-3 py-2 text-muted-foreground font-mono">
                        {row.rowNum}
                      </td>
                      {row.cells.map((cell, cellIdx) => (
                        <td
                          key={`${row.rowNum}-${cellIdx}`}
                          className="px-3 py-2 max-w-xs truncate"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </div>
      )}

      {!sheetData && !loading && (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="excel.empty_state"
        >
          <FileSpreadsheet size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">No spreadsheet loaded</p>
          <p className="text-xs mt-1">
            Upload an Excel or CSV file to view its data
          </p>
        </div>
      )}
    </div>
  );
}
