import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider, useTranslation } from "@/lib/i18n";
import {
  BarChart3,
  ChevronDown,
  Clock,
  Code2,
  FileSpreadsheet,
  FileStack,
  FileText,
  FileType,
  Globe,
  Hash,
  Home,
  KeyRound,
  Link,
  Lock,
  LogIn,
  LogOut,
  Menu,
  Minimize2,
  Moon,
  Palette,
  Scissors,
  Search,
  Shield,
  ShieldCheck,
  Sun,
  Type,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import AdminPanel from "./components/AdminPanel";
import AuthModal from "./components/AuthModal";
import { useActor } from "./hooks/useActor";
import Base64Tool from "./tools/Base64Tool";
import ColorConverter from "./tools/ColorConverter";
import ExcelTool from "./tools/ExcelTool";
import HashGenerator from "./tools/HashGenerator";
import JsonFormatter from "./tools/JsonFormatter";
import PdfCompressor from "./tools/PdfCompressor";
import PdfMerger from "./tools/PdfMerger";
import PdfSplitter from "./tools/PdfSplitter";
import PdfTool from "./tools/PdfTool";
import SubtitleConverter from "./tools/SubtitleConverter";
import TextCaseConverter from "./tools/TextCaseConverter";
import TimestampConverter from "./tools/TimestampConverter";
import UrlEncoderTool from "./tools/UrlEncoderTool";
import WordCounter from "./tools/WordCounter";
import WordTool from "./tools/WordTool";

type ToolId =
  | "home"
  | "admin"
  | "subtitle"
  | "textcase"
  | "json"
  | "base64"
  | "url"
  | "counter"
  | "color"
  | "hash"
  | "timestamp"
  | "pdf"
  | "word"
  | "excel"
  | "pdf-merger"
  | "pdf-splitter"
  | "pdf-compressor";

interface Tool {
  id: ToolId;
  labelKey: string;
  descKey: string;
  icon: React.ReactNode;
  category: string;
  color: string;
  popular?: boolean;
}

interface Category {
  name: string;
  icon: React.ReactNode;
  tools: Tool[];
  color: string;
}

interface AuthState {
  token: string;
  username: string;
  role: string;
}

type TranslationFn = (key: string) => string;

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
    case "pdf":
      return <PdfTool />;
    case "word":
      return <WordTool />;
    case "excel":
      return <ExcelTool />;
    case "pdf-merger":
      return <PdfMerger />;
    case "pdf-splitter":
      return <PdfSplitter />;
    case "pdf-compressor":
      return <PdfCompressor />;
    default:
      return null;
  }
}

const POPULAR_TOOLS: ToolId[] = ["json", "base64", "subtitle"];

const CATEGORY_COLORS: Record<string, string> = {
  Subtitle: "#06b6d4", // cyan
  Text: "#8b5cf6", // violet
  Dev: "#f59e0b", // amber
  Security: "#22c55e", // green
  File: "#f43f5e", // rose
};

function AppInner() {
  const { t, toggleLang } = useTranslation();
  const { actor } = useActor();
  const [activeTool, setActiveTool] = useState<ToolId>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const [search, setSearch] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!actor) return;
    const token = localStorage.getItem("mth_token");
    if (!token) return;
    actor
      .getProfile(token)
      .then((profile) => {
        if (profile) {
          setAuth({ token, username: profile.username, role: profile.role });
        } else {
          localStorage.removeItem("mth_token");
        }
      })
      .catch(() => {
        localStorage.removeItem("mth_token");
      });
  }, [actor]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        setSearch("");
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const TOOLS: Tool[] = [
    {
      id: "subtitle",
      labelKey: "tool_subtitle_label",
      descKey: "tool_subtitle_desc",
      icon: <FileText size={18} />,
      category: "Subtitle",
      color: "text-cyan-500",
      popular: true,
    },
    {
      id: "textcase",
      labelKey: "tool_textcase_label",
      descKey: "tool_textcase_desc",
      icon: <Type size={18} />,
      category: "Text",
      color: "text-violet-500",
    },
    {
      id: "counter",
      labelKey: "tool_counter_label",
      descKey: "tool_counter_desc",
      icon: <BarChart3 size={18} />,
      category: "Text",
      color: "text-violet-500",
    },
    {
      id: "json",
      labelKey: "tool_json_label",
      descKey: "tool_json_desc",
      icon: <Code2 size={18} />,
      category: "Dev",
      color: "text-amber-500",
      popular: true,
    },
    {
      id: "base64",
      labelKey: "tool_base64_label",
      descKey: "tool_base64_desc",
      icon: <Hash size={18} />,
      category: "Dev",
      color: "text-amber-500",
      popular: true,
    },
    {
      id: "url",
      labelKey: "tool_url_label",
      descKey: "tool_url_desc",
      icon: <Link size={18} />,
      category: "Dev",
      color: "text-amber-500",
    },
    {
      id: "hash",
      labelKey: "tool_hash_label",
      descKey: "tool_hash_desc",
      icon: <KeyRound size={18} />,
      category: "Security",
      color: "text-green-500",
    },
    {
      id: "timestamp",
      labelKey: "tool_timestamp_label",
      descKey: "tool_timestamp_desc",
      icon: <Clock size={18} />,
      category: "Security",
      color: "text-green-500",
    },
    {
      id: "color",
      labelKey: "tool_color_label",
      descKey: "tool_color_desc",
      icon: <Palette size={18} />,
      category: "Security",
      color: "text-green-500",
    },
    {
      id: "pdf",
      labelKey: "tool_pdf_label",
      descKey: "tool_pdf_desc",
      icon: <FileText size={18} />,
      category: "File",
      color: "text-rose-500",
    },
    {
      id: "word",
      labelKey: "tool_word_label",
      descKey: "tool_word_desc",
      icon: <FileType size={18} />,
      category: "File",
      color: "text-rose-500",
    },
    {
      id: "excel",
      labelKey: "tool_excel_label",
      descKey: "tool_excel_desc",
      icon: <FileSpreadsheet size={18} />,
      category: "File",
      color: "text-rose-500",
    },
    {
      id: "pdf-merger" as ToolId,
      labelKey: "tool_pdfmerger_label",
      descKey: "tool_pdfmerger_desc",
      icon: <FileStack size={18} />,
      category: "File",
      color: "text-rose-500",
    },
    {
      id: "pdf-splitter" as ToolId,
      labelKey: "tool_pdfsplitter_label",
      descKey: "tool_pdfsplitter_desc",
      icon: <Scissors size={18} />,
      category: "File",
      color: "text-rose-500",
    },
    {
      id: "pdf-compressor" as ToolId,
      labelKey: "tool_pdfcompressor_label",
      descKey: "tool_pdfcompressor_desc",
      icon: <Minimize2 size={18} />,
      category: "File",
      color: "text-rose-500",
    },
  ];

  const CATEGORIES: Category[] = [
    {
      name: "Subtitle",
      icon: <Globe size={14} />,
      tools: TOOLS.filter((tool) => tool.category === "Subtitle"),
      color: CATEGORY_COLORS.Subtitle,
    },
    {
      name: "Text",
      icon: <Type size={14} />,
      tools: TOOLS.filter((tool) => tool.category === "Text"),
      color: CATEGORY_COLORS.Text,
    },
    {
      name: "Dev",
      icon: <Code2 size={14} />,
      tools: TOOLS.filter((tool) => tool.category === "Dev"),
      color: CATEGORY_COLORS.Dev,
    },
    {
      name: "Security",
      icon: <Shield size={14} />,
      tools: TOOLS.filter((tool) => tool.category === "Security"),
      color: CATEGORY_COLORS.Security,
    },
    {
      name: "File",
      icon: <FileText size={14} />,
      tools: TOOLS.filter((tool) => tool.category === "File"),
      color: CATEGORY_COLORS.File,
    },
  ];

  const catLabels: Record<string, string> = {
    Subtitle: t("cat_subtitle"),
    Text: t("cat_text"),
    Dev: t("cat_encoding"),
    Security: t("cat_developer"),
    File: t("cat_file"),
  };

  const filteredTools = search.trim()
    ? TOOLS.filter((tool) => {
        const q = search.toLowerCase();
        return (
          t(tool.labelKey as Parameters<typeof t>[0])
            .toLowerCase()
            .includes(q) ||
          t(tool.descKey as Parameters<typeof t>[0])
            .toLowerCase()
            .includes(q) ||
          catLabels[tool.category]?.toLowerCase().includes(q)
        );
      })
    : TOOLS;

  const navigate = (id: ToolId) => {
    setActiveTool(id);
    setSidebarOpen(false);
    setSearch("");
    if (id !== "home" && id !== "admin" && actor) {
      actor.recordUsage(id).catch(() => {});
    }
  };

  const handleLogout = () => {
    if (auth && actor) {
      actor.logout(auth.token).catch(() => {});
    }
    localStorage.removeItem("mth_token");
    setAuth(null);
    setActiveTool("home");
  };

  const toggleCategory = (catName: string) => {
    setCollapsedCats((prev) => {
      const next = new Set(prev);
      if (next.has(catName)) next.delete(catName);
      else next.add(catName);
      return next;
    });
  };

  const currentTool = TOOLS.find((tool) => tool.id === activeTool);
  const isAdmin = auth?.role === "admin";

  if (activeTool === "admin" && auth) {
    return (
      <div className="min-h-screen bg-background">
        <AdminPanel
          token={auth.token}
          onBack={() => setActiveTool("home")}
          actor={actor}
        />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
          role="presentation"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 flex flex-col
          bg-sidebar border-r border-sidebar-border
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0
        `}
      >
        <div className="flex items-center gap-2 px-4 h-14 border-b border-sidebar-border flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-bold text-sidebar-foreground text-sm tracking-tight font-display">
            MultiTools <span className="text-primary">Hub</span>
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

        <ScrollArea className="flex-1">
          <nav className="py-2">
            <button
              type="button"
              data-ocid="nav.home_link"
              onClick={() => navigate("home")}
              className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors rounded-none ${
                activeTool === "home"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              }`}
            >
              <Home size={15} />
              <span>{t("home")}</span>
            </button>

            {CATEGORIES.map((cat, ci) => {
              const isCollapsed = collapsedCats.has(cat.name);
              return (
                <div key={cat.name} className="mt-1">
                  <button
                    type="button"
                    data-ocid={`nav.category_toggle.${ci + 1}`}
                    onClick={() => toggleCategory(cat.name)}
                    className="w-full flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-sidebar-foreground/40 hover:text-sidebar-foreground/70 uppercase tracking-widest transition-colors"
                  >
                    <span className="flex-1 text-left">
                      {catLabels[cat.name]}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-xs h-4 px-1.5 bg-sidebar-accent/50"
                    >
                      {cat.tools.length}
                    </Badge>
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-200 ${
                        isCollapsed ? "-rotate-90" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`category-content ${
                      isCollapsed ? "collapsed" : "expanded"
                    }`}
                  >
                    {cat.tools.map((tool, ti) => (
                      <button
                        type="button"
                        key={tool.id}
                        data-ocid={`nav.tool_link.${ci * 3 + ti + 1}`}
                        onClick={() => navigate(tool.id)}
                        className={`w-full flex items-center gap-2.5 px-5 py-2 text-sm transition-colors ${
                          activeTool === tool.id
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                            : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        }`}
                      >
                        <span className={tool.color}>{tool.icon}</span>
                        <span className="truncate">
                          {t(tool.labelKey as Parameters<typeof t>[0])}
                        </span>
                        {POPULAR_TOOLS.includes(tool.id) && (
                          <span className="ml-auto text-[9px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
                            HOT
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="px-4 py-3 border-t border-sidebar-border text-xs text-sidebar-foreground/30">
          © {new Date().getFullYear()}{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sidebar-foreground/60 transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Glassmorphism Header */}
        <header className="glass-header sticky top-0 z-30 h-14 flex items-center gap-3 px-4 flex-shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="lg:hidden h-8 w-8 flex-shrink-0"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={16} />
          </Button>

          <div className="relative flex-1 max-w-sm">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              ref={searchRef}
              data-ocid="header.search_input"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (e.target.value && activeTool !== "home")
                  setActiveTool("home");
              }}
              placeholder={`${t("search_placeholder")} ⌘K`}
              className="pl-9 pr-4 h-8 text-sm bg-muted/50 border-transparent focus:border-input"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  searchRef.current?.focus();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                data-ocid="search.command_palette_open"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleLang}
              className="h-8 px-2 text-xs font-semibold hidden sm:flex"
            >
              {t("lang_toggle")}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              data-ocid="header.theme_toggle"
              onClick={() => setDark((d) => !d)}
              className="h-8 w-8"
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </Button>

            {!auth ? (
              <Button
                size="sm"
                variant="default"
                data-ocid="header.login_button"
                onClick={() => setAuthModalOpen(true)}
                className="h-8 gap-1.5 text-xs"
              >
                <LogIn size={13} />
                {t("auth_login")}
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    data-ocid="header.user_dropdown"
                    className="h-8 gap-2 px-2"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {auth.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium hidden sm:block">
                      {auth.username}
                    </span>
                    <ChevronDown size={12} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    {t("auth_logged_in_as")}
                    <span className="font-semibold text-foreground block">
                      {auth.username}
                    </span>
                  </div>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <DropdownMenuItem
                      data-ocid="header.admin_panel_link"
                      onClick={() => navigate("admin")}
                      className="gap-2 cursor-pointer"
                    >
                      <ShieldCheck size={14} />
                      {t("auth_admin_panel")}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    data-ocid="header.logout_button"
                    onClick={handleLogout}
                    className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut size={14} />
                    {t("auth_logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        <ScrollArea className="flex-1">
          <main className="p-4 sm:p-6 max-w-5xl mx-auto">
            {activeTool === "home" ? (
              <div>
                {/* Hero Section */}
                <div className="hero-mesh mb-12 pt-2">
                  <div
                    className="animate-fade-up"
                    style={{ animationDelay: "0ms" }}
                  >
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-5">
                      <Zap size={11} />
                      12 Professional Tools — All Client-Side
                    </div>
                  </div>
                  <div
                    className="animate-fade-up"
                    style={{ animationDelay: "60ms" }}
                  >
                    <h1 className="font-display font-black leading-[1.05] mb-4">
                      <span className="block text-4xl sm:text-5xl lg:text-6xl text-foreground">
                        The Ultimate
                      </span>
                      <span className="block text-4xl sm:text-5xl lg:text-6xl gradient-text">
                        Tools Hub
                      </span>
                    </h1>
                  </div>
                  <div
                    className="animate-fade-up"
                    style={{ animationDelay: "120ms" }}
                  >
                    <p className="text-muted-foreground text-base sm:text-lg max-w-lg mb-8">
                      {t("app_description")}
                    </p>
                  </div>
                  <div
                    className="animate-fade-up flex flex-wrap gap-3"
                    style={{ animationDelay: "180ms" }}
                  >
                    {[
                      {
                        icon: <Zap size={16} />,
                        value: "12",
                        label: "Tools",
                        color: "text-primary",
                      },
                      {
                        icon: <Lock size={16} />,
                        value: "100%",
                        label: "Client-side",
                        color: "text-green-500",
                      },
                      {
                        icon: <LogIn size={16} />,
                        value: "0",
                        label: "Sign-up needed",
                        color: "text-amber-500",
                      },
                    ].map(({ icon, value, label, color }) => (
                      <div
                        key={label}
                        className="flex items-center gap-3 bg-card border border-border px-4 py-3 rounded-xl shadow-sm"
                      >
                        <span className={color}>{icon}</span>
                        <div>
                          <div
                            className={`text-lg font-black font-display leading-none ${color}`}
                          >
                            {value}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {label}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {search.trim() ? (
                  <div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {filteredTools.length} result
                      {filteredTools.length !== 1 ? "s" : ""} for &ldquo;
                      {search}&rdquo;
                    </p>
                    {filteredTools.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredTools.map((tool) => (
                          <ToolCard
                            key={tool.id}
                            tool={tool}
                            active={false}
                            onClick={() => navigate(tool.id)}
                            tFn={t as TranslationFn}
                            categoryColor={CATEGORY_COLORS[tool.category]}
                          />
                        ))}
                      </div>
                    ) : (
                      <div
                        className="text-center py-16 text-muted-foreground"
                        data-ocid="search.empty_state"
                      >
                        <Search size={36} className="mx-auto mb-3 opacity-20" />
                        <p>No tools found for &ldquo;{search}&rdquo;</p>
                      </div>
                    )}
                  </div>
                ) : (
                  CATEGORIES.map((cat) => (
                    <div key={cat.name} className="mb-10">
                      <h2
                        className="font-display text-sm font-bold uppercase tracking-widest mb-5 flex items-center gap-2.5"
                        style={{ color: cat.color }}
                      >
                        <span
                          className="w-6 h-6 rounded-md flex items-center justify-center"
                          style={{ background: `${cat.color}22` }}
                        >
                          {cat.icon}
                        </span>
                        {catLabels[cat.name]}
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {cat.tools.map((tool) => (
                          <ToolCard
                            key={tool.id}
                            tool={tool}
                            active={activeTool === tool.id}
                            onClick={() => navigate(tool.id)}
                            tFn={t as TranslationFn}
                            categoryColor={cat.color}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div>
                {currentTool && (
                  <div className="mb-6">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                      <button
                        type="button"
                        onClick={() => navigate("home")}
                        className="hover:text-foreground transition-colors"
                      >
                        {t("home")}
                      </button>
                      <span>/</span>
                      <span>{catLabels[currentTool.category]}</span>
                      <span>/</span>
                      <span className="text-foreground font-medium">
                        {t(currentTool.labelKey as Parameters<typeof t>[0])}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2.5 rounded-xl bg-primary/10 ${
                          currentTool.color
                        } flex-shrink-0`}
                      >
                        {currentTool.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h1 className="font-display text-2xl font-bold mb-1">
                          {t(currentTool.labelKey as Parameters<typeof t>[0])}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                          {t(currentTool.descKey as Parameters<typeof t>[0])}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <ActiveTool id={activeTool} />
              </div>
            )}
          </main>

          <footer className="px-4 sm:px-6 py-4 border-t text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()}. Built with ❤ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors underline underline-offset-2"
            >
              caffeine.ai
            </a>
          </footer>
        </ScrollArea>
      </div>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        onSuccess={(token, username, role) =>
          setAuth({ token, username, role })
        }
        actor={actor}
      />
      <Toaster />
    </div>
  );
}

function ToolCard({
  tool,
  active,
  onClick,
  tFn,
  categoryColor,
}: {
  tool: Tool;
  active: boolean;
  onClick: () => void;
  tFn: TranslationFn;
  categoryColor: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={
        {
          borderLeftColor: active ? categoryColor : undefined,
          "--hover-color": categoryColor,
        } as React.CSSProperties
      }
      className={`tool-card bg-card border-l-4 border rounded-xl p-4 text-left w-full group transition-all ${
        active
          ? "border-primary/40 shadow-md"
          : "border-l-transparent border-border hover:border-l-[var(--hover-color)] hover:border-primary/20"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-lg bg-primary/10 ${
            tool.color
          } flex-shrink-0 group-hover:bg-primary/20 transition-colors`}
        >
          {tool.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm truncate">
              {tFn(tool.labelKey)}
            </span>
            {tool.popular && (
              <span className="flex-shrink-0 text-[9px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                Popular
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {tFn(tool.descKey)}
          </p>
        </div>
      </div>
    </button>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}
