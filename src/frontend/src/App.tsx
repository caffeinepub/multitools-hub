import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider, useTranslation } from "@/lib/i18n";
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

function ActiveTool({ id }: { id: ToolId }) {
  switch (id) {
    case "subtitle":
      return <SubtitleConverter />;
    case "textcase":
      return <TextCaseConverter />;
    case "json":
      return <JsonFormatter />;
    case "base64":
      return <Base64Tool />;
    case "url":
      return <UrlEncoderTool />;
    case "counter":
      return <WordCounter />;
    case "color":
      return <ColorConverter />;
    case "hash":
      return <HashGenerator />;
    case "timestamp":
      return <TimestampConverter />;
    default:
      return null;
  }
}

function AppInner() {
  const { t, toggleLang } = useTranslation();
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

  const TOOLS: Tool[] = [
    {
      id: "subtitle",
      label: t("tool_subtitle_label"),
      description: t("tool_subtitle_desc"),
      icon: <FileText size={20} />,
      category: t("cat_subtitle"),
      categoryColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    },
    {
      id: "textcase",
      label: t("tool_textcase_label"),
      description: t("tool_textcase_desc"),
      icon: <Type size={20} />,
      category: t("cat_text"),
      categoryColor: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    },
    {
      id: "counter",
      label: t("tool_counter_label"),
      description: t("tool_counter_desc"),
      icon: <BarChart3 size={20} />,
      category: t("cat_text"),
      categoryColor: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    },
    {
      id: "json",
      label: t("tool_json_label"),
      description: t("tool_json_desc"),
      icon: <Code2 size={20} />,
      category: t("cat_encoding"),
      categoryColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      id: "base64",
      label: t("tool_base64_label"),
      description: t("tool_base64_desc"),
      icon: <Hash size={20} />,
      category: t("cat_encoding"),
      categoryColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      id: "url",
      label: t("tool_url_label"),
      description: t("tool_url_desc"),
      icon: <Link size={20} />,
      category: t("cat_encoding"),
      categoryColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      id: "hash",
      label: t("tool_hash_label"),
      description: t("tool_hash_desc"),
      icon: <Hash size={20} />,
      category: t("cat_developer"),
      categoryColor: "bg-green-500/10 text-green-600 dark:text-green-400",
    },
    {
      id: "timestamp",
      label: t("tool_timestamp_label"),
      description: t("tool_timestamp_desc"),
      icon: <Clock size={20} />,
      category: t("cat_developer"),
      categoryColor: "bg-green-500/10 text-green-600 dark:text-green-400",
    },
    {
      id: "color",
      label: t("tool_color_label"),
      description: t("tool_color_desc"),
      icon: <Palette size={20} />,
      category: t("cat_design"),
      categoryColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    },
  ];

  const CATEGORIES = [
    {
      name: t("cat_subtitle"),
      tools: TOOLS.filter((t2) => t2.id === "subtitle"),
    },
    {
      name: t("cat_text"),
      tools: TOOLS.filter((t2) => t2.category === t("cat_text")),
    },
    {
      name: t("cat_encoding"),
      tools: TOOLS.filter((t2) => t2.category === t("cat_encoding")),
    },
    {
      name: t("cat_developer"),
      tools: TOOLS.filter((t2) => t2.category === t("cat_developer")),
    },
    {
      name: t("cat_design"),
      tools: TOOLS.filter((t2) => t2.category === t("cat_design")),
    },
  ];

  const currentTool = TOOLS.find((tool) => tool.id === activeTool);

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
            <span>{t("home")}</span>
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

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <Button
            size="icon"
            variant="ghost"
            className="lg:hidden h-8 w-8 flex-shrink-0"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={16} />
          </Button>
          {activeTool !== "home" && currentTool && (
            <div className="flex items-center gap-1.5 text-sm min-w-0 flex-1">
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground flex-shrink-0"
                onClick={() => navigate("home")}
              >
                {t("home")}
              </button>
              <ChevronRight
                size={14}
                className="text-muted-foreground flex-shrink-0"
              />
              <span className="font-medium truncate">{currentTool.label}</span>
            </div>
          )}
          {activeTool === "home" && (
            <span className="font-semibold text-sm flex-1">
              {t("app_title")}
            </span>
          )}
          <div className="ml-auto flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              data-ocid="lang.toggle"
              onClick={toggleLang}
              className="h-8 px-2 text-xs font-semibold"
            >
              {t("lang_toggle")}
            </Button>
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
          <main className="p-4 sm:p-6 max-w-5xl mx-auto">
            {activeTool === "home" ? (
              <div>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold mb-2">
                    Multi<span className="text-primary">Tools</span> Hub
                  </h1>
                  <p className="text-muted-foreground">
                    {t("app_description")}
                  </p>
                </div>
                {CATEGORIES.map((cat) => (
                  <div key={cat.name} className="mb-8">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                      {cat.name} {t("tools_label")}
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
                            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors flex-shrink-0">
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
                      <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                        {currentTool.icon}
                      </div>
                      <h1 className="text-xl sm:text-2xl font-bold">
                        {currentTool.label}
                      </h1>
                    </div>
                    <p className="text-muted-foreground text-sm ml-11">
                      {currentTool.description}
                    </p>
                  </div>
                )}
                <ActiveTool id={activeTool} />
              </div>
            )}
          </main>
        </ScrollArea>
      </div>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}
