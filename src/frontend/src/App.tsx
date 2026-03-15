import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/sonner";
import {
  BarChart3,
  ChevronRight,
  Clock,
  Code2,
  FileText,
  Hash,
  Home,
  Link,
  Menu,
  Moon,
  Palette,
  Sun,
  Type,
  X,
} from "lucide-react";
import { useState } from "react";
import Base64Tool from "./tools/Base64Tool";
import ColorConverter from "./tools/ColorConverter";
import HashGenerator from "./tools/HashGenerator";
import JsonFormatter from "./tools/JsonFormatter";
import SubtitleConverter from "./tools/SubtitleConverter";
import TextCaseConverter from "./tools/TextCaseConverter";
import TimestampConverter from "./tools/TimestampConverter";
import UrlEncoderTool from "./tools/UrlEncoderTool";
import WordCounter from "./tools/WordCounter";

type ToolId =
  | "home"
  | "subtitle"
  | "textcase"
  | "json"
  | "base64"
  | "url"
  | "counter"
  | "color"
  | "hash"
  | "timestamp";

interface Tool {
  id: ToolId;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  categoryColor: string;
}

const TOOLS: Tool[] = [
  {
    id: "subtitle",
    label: "Subtitle Converter & Editor",
    description:
      "Convert between SRT, VTT, ASS, SUB, SBV, LRC, DFXP, STL and edit entries inline.",
    icon: <FileText size={20} />,
    category: "Subtitle",
    categoryColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  },
  {
    id: "textcase",
    label: "Text Case Converter",
    description:
      "Transform text to UPPER, lower, Title, camelCase, snake_case and more.",
    icon: <Type size={20} />,
    category: "Text",
    categoryColor: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  {
    id: "counter",
    label: "Word & Character Counter",
    description:
      "Count characters, words, sentences, paragraphs, reading and speaking time.",
    icon: <BarChart3 size={20} />,
    category: "Text",
    categoryColor: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  {
    id: "json",
    label: "JSON Formatter & Validator",
    description: "Format, minify, and validate JSON with error highlighting.",
    icon: <Code2 size={20} />,
    category: "Encoding",
    categoryColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    id: "base64",
    label: "Base64 Encoder/Decoder",
    description: "Encode and decode text or files to/from Base64.",
    icon: <Hash size={20} />,
    category: "Encoding",
    categoryColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    id: "url",
    label: "URL Encoder/Decoder",
    description: "Encode or decode URL-encoded strings and components.",
    icon: <Link size={20} />,
    category: "Encoding",
    categoryColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    id: "hash",
    label: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, SHA-512 hashes instantly.",
    icon: <Hash size={20} />,
    category: "Developer",
    categoryColor: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
  {
    id: "timestamp",
    label: "Timestamp Converter",
    description:
      "Convert Unix timestamps to/from human-readable dates across timezones.",
    icon: <Clock size={20} />,
    category: "Developer",
    categoryColor: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
  {
    id: "color",
    label: "Color Converter",
    description: "Convert colors between HEX, RGB, HSL, and CMYK formats.",
    icon: <Palette size={20} />,
    category: "Design",
    categoryColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
];

const CATEGORIES = [
  { name: "Subtitle", tools: TOOLS.filter((t) => t.category === "Subtitle") },
  { name: "Text", tools: TOOLS.filter((t) => t.category === "Text") },
  { name: "Encoding", tools: TOOLS.filter((t) => t.category === "Encoding") },
  { name: "Developer", tools: TOOLS.filter((t) => t.category === "Developer") },
  { name: "Design", tools: TOOLS.filter((t) => t.category === "Design") },
];

const TOOL_COMPONENTS: Partial<Record<ToolId, React.ReactNode>> = {
  subtitle: <SubtitleConverter />,
  textcase: <TextCaseConverter />,
  json: <JsonFormatter />,
  base64: <Base64Tool />,
  url: <UrlEncoderTool />,
  counter: <WordCounter />,
  color: <ColorConverter />,
  hash: <HashGenerator />,
  timestamp: <TimestampConverter />,
};

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolId>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  const toggleDark = () => {
    setDark((d) => {
      document.documentElement.classList.toggle("dark", !d);
      return !d;
    });
  };

  if (dark) document.documentElement.classList.add("dark");

  const currentTool = TOOLS.find((t) => t.id === activeTool);

  const navigate = (id: ToolId) => {
    setActiveTool(id);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col
        transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0
      `}
      >
        <div className="flex items-center gap-2 px-4 py-4 border-b border-sidebar-border">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <Code2 size={14} className="text-primary-foreground" />
          </div>
          <span className="font-bold text-sidebar-foreground text-sm tracking-wide">
            MultiTools Hub
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="ml-auto lg:hidden h-7 w-7 text-sidebar-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={16} />
          </Button>
        </div>

        <ScrollArea className="flex-1 py-2">
          <button
            type="button"
            data-ocid="nav.home_link"
            onClick={() => navigate("home")}
            className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
              activeTool === "home"
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60"
            }`}
          >
            <Home size={15} />
            <span>Home</span>
          </button>

          {CATEGORIES.map((cat, ci) => (
            <div key={cat.name}>
              <p className="px-4 py-2 text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-widest mt-2">
                {cat.name}
              </p>
              {cat.tools.map((tool, ti) => (
                <button
                  type="button"
                  key={tool.id}
                  data-ocid={`nav.tool_link.${ci * 3 + ti + 1}`}
                  onClick={() => navigate(tool.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
                    activeTool === tool.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }`}
                >
                  <span className="text-sidebar-foreground/50">
                    {tool.icon}
                  </span>
                  <span className="truncate">{tool.label}</span>
                </button>
              ))}
            </div>
          ))}
        </ScrollArea>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setSidebarOpen(false);
          }}
          role="presentation"
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <Button
            size="icon"
            variant="ghost"
            className="lg:hidden h-8 w-8"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={16} />
          </Button>
          {activeTool !== "home" && currentTool && (
            <div className="flex items-center gap-2 text-sm">
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => navigate("home")}
              >
                Home
              </button>
              <ChevronRight size={14} className="text-muted-foreground" />
              <span className="font-medium">{currentTool.label}</span>
            </div>
          )}
          {activeTool === "home" && (
            <span className="font-semibold text-sm">MultiTools Hub</span>
          )}
          <div className="ml-auto">
            <Button
              size="icon"
              variant="ghost"
              data-ocid="theme.toggle"
              onClick={toggleDark}
              className="h-8 w-8"
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </Button>
          </div>
        </header>

        <ScrollArea className="flex-1">
          <main className="p-6 max-w-5xl mx-auto">
            {activeTool === "home" ? (
              <div>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold mb-2">
                    Multi<span className="text-primary">Tools</span> Hub
                  </h1>
                  <p className="text-muted-foreground">
                    A collection of free, client-side utilities. No uploads, no
                    tracking, all processing happens in your browser.
                  </p>
                </div>
                {CATEGORIES.map((cat) => (
                  <div key={cat.name} className="mb-8">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                      {cat.name} Tools
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {cat.tools.map((tool) => (
                        <button
                          type="button"
                          key={tool.id}
                          onClick={() => navigate(tool.id)}
                          className="bg-card border rounded-xl p-4 text-left hover:border-primary/50 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                              {tool.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm mb-1 truncate">
                                {tool.label}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {tool.description}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <Badge
                              variant="secondary"
                              className={`text-xs ${tool.categoryColor}`}
                            >
                              {tool.category}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {currentTool && (
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {currentTool.icon}
                      </div>
                      <h1 className="text-2xl font-bold">
                        {currentTool.label}
                      </h1>
                    </div>
                    <p className="text-muted-foreground text-sm ml-11">
                      {currentTool.description}
                    </p>
                  </div>
                )}
                {TOOL_COMPONENTS[activeTool]}
              </div>
            )}
          </main>
        </ScrollArea>
      </div>
      <Toaster />
    </div>
  );
}
