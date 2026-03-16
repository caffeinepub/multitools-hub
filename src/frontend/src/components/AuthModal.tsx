import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/lib/i18n";
import { Loader2, Lock, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { backendInterface } from "../backend";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (token: string, username: string, role: string) => void;
  actor: backendInterface | null;
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
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            <span className="gradient-text">MultiTools Hub</span>
          </DialogTitle>
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
                    placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
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
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                data-ocid="auth.submit_button"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Signing in..." : t("auth_submit_login")}
              </Button>
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
                    placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                    className="pl-9"
                    autoComplete="new-password"
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
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                data-ocid="auth.submit_button"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Creating account..." : t("auth_submit_register")}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
