import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/lib/i18n";
import { Loader2, Lock, User, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { backendInterface } from "../backend";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (token: string, username: string, role: string) => void;
  actor: backendInterface | null;
}

function PasswordStrength({ password }: { password: string }) {
  const len = password.length;
  const strength = len === 0 ? 0 : len < 6 ? 1 : len < 9 ? 2 : len < 12 ? 3 : 4;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = [
    "",
    "bg-red-500",
    "bg-amber-500",
    "bg-lime-500",
    "bg-green-500",
  ];
  const textColors = [
    "",
    "text-red-500",
    "text-amber-500",
    "text-lime-600",
    "text-green-600",
  ];

  if (len === 0) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`strength-bar-segment flex-1 ${
              i <= strength ? colors[strength] : "bg-border"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${textColors[strength]}`}>
        {labels[strength]}
      </p>
    </div>
  );
}

export default function AuthModal({
  open,
  onOpenChange,
  onSuccess,
  actor,
}: AuthModalProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setUsername("");
    setPassword("");
    setError("");
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      setError("Not connected");
      return;
    }
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      let token: string;
      if (tab === "login") {
        token = await actor.login(username.trim(), password);
      } else {
        const msg = await actor.register(username.trim(), password);
        if (msg !== "ok") {
          setError(msg);
          setLoading(false);
          return;
        }
        token = await actor.login(username.trim(), password);
      }

      if (
        !token ||
        token.toLowerCase().startsWith("error") ||
        token.toLowerCase().startsWith("invalid")
      ) {
        setError(token || "Authentication failed");
        setLoading(false);
        return;
      }

      const profile = await actor.getProfile(token);
      const role = profile?.role ?? "user";
      localStorage.setItem("mth_token", token);
      onSuccess(token, username.trim(), role);
      toast.success(`${t("auth_logged_in_as")} ${username.trim()}`);
      reset();
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    }
    setLoading(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md" data-ocid="auth.dialog">
        {/* Branded Header */}
        <DialogHeader>
          <div className="flex flex-col items-center gap-3 pb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Zap size={22} className="text-white" />
            </div>
            <div className="text-center">
              <h2 className="font-display text-xl font-black text-foreground">
                MultiTools <span className="gradient-text">Hub</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {tab === "login" ? "Welcome back" : "Create your account"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(v) => {
            setTab(v as "login" | "register");
            setError("");
          }}
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login" data-ocid="auth.login_tab">
              {t("auth_login")}
            </TabsTrigger>
            <TabsTrigger value="register" data-ocid="auth.register_tab">
              {t("auth_register")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username">{t("auth_username")}</Label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="login-username"
                    data-ocid="auth.username_input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    className="pl-9"
                    autoComplete="username"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">{t("auth_password")}</Label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="login-password"
                    data-ocid="auth.password_input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9"
                    autoComplete="current-password"
                  />
                </div>
              </div>
              {error && (
                <p
                  className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md"
                  data-ocid="auth.error_state"
                >
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                data-ocid="auth.submit_button"
                className="btn-gradient w-full h-10 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Signing in..." : t("auth_submit_login")}
              </button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-username">{t("auth_username")}</Label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="reg-username"
                    data-ocid="auth.username_input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="choose a username"
                    className="pl-9"
                    autoComplete="username"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">{t("auth_password")}</Label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="reg-password"
                    data-ocid="auth.password_input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9"
                    autoComplete="new-password"
                  />
                </div>
                <PasswordStrength password={password} />
              </div>
              {error && (
                <p
                  className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md"
                  data-ocid="auth.error_state"
                >
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                data-ocid="auth.submit_button"
                className="btn-gradient w-full h-10 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Creating account..." : t("auth_submit_register")}
              </button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
