import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, User as UserIcon, Users, Shield, Key } from "lucide-react";
import { AppBackground } from "@/components/ui/AppBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PinKeypad } from "@/components/ui/PinKeypad";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type LoginRole = "child" | "parent" | "admin";

const roleConfig = {
  child: {
    icon: UserIcon,
    label: "Çocuk",
    emoji: "👦",
    helperText: "Ebeveyninin verdiği kullanıcı adı ve PIN'i kullan.",
    helperTextEn: "Use the username and PIN your parent gave you.",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
  },
  parent: {
    icon: Users,
    label: "Ebeveyn",
    emoji: "👨‍👩‍👧",
    helperText: "Çocuğunuzun ilerlemesini görüntülemek için giriş yapın.",
    helperTextEn: "Log in to view your child's progress.",
    color: "text-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent/30",
  },
  admin: {
    icon: Shield,
    label: "Yönetici",
    emoji: "🛡️",
    helperText: "Sadece TCC yetkilileri için.",
    helperTextEn: "For TCC staff only.",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/30",
  },
};

export default function Auth() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { signIn } = useAuth();

  const [selectedRole, setSelectedRole] = useState<LoginRole>("parent");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Child login state
  const [childUsername, setChildUsername] = useState("");
  const [childPin, setChildPin] = useState("");

  // Parent login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Admin login state
  const [adminToken, setAdminToken] = useState("");

  const currentRoleConfig = roleConfig[selectedRole];

  const handleChildLogin = async () => {
    if (!childUsername.trim() || childPin.length < 4) {
      toast({
        title: "Eksik Bilgi",
        description: "Kullanıcı adı ve PIN giriniz.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc("verify_child_login", {
        p_username: childUsername.toLowerCase(),
        p_pin: childPin,
      });

      if (error) throw error;

      const result = data?.[0];
      if (!result?.is_valid) {
        toast({
          title: "Giriş Başarısız",
          description: result?.error_message || "Kullanıcı adı veya PIN hatalı.",
          variant: "destructive",
        });
        setChildPin("");
        return;
      }

      // Sign in with a system account for child (we'll create a custom session)
      // For now, we'll store the child user_id and redirect
      localStorage.setItem("child_user_id", result.user_id);
      localStorage.setItem("user_role", "child");
      
      toast({
        title: "Hoş geldin! 🌙",
        description: "Başarıyla giriş yaptın.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Child login error:", error);
      toast({
        title: "Hata",
        description: "Giriş yapılırken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleParentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Giriş Başarısız",
            description: "E-posta veya şifre yanlış. Lütfen tekrar deneyin.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Hata",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        // Role-based routing will be handled by Dashboard
        navigate("/parent");
      }
    } catch (error) {
      console.error("Parent login error:", error);
      toast({
        title: "Hata",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    if (!adminToken.trim()) {
      toast({
        title: "Token Gerekli",
        description: "Yönetici token'ı giriniz.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc("verify_admin_token", {
        p_token: adminToken,
      });

      if (error) throw error;

      const result = data?.[0];
      if (!result?.is_valid) {
        toast({
          title: "Geçersiz Token",
          description: result?.error_message || "Bu token geçerli değil.",
          variant: "destructive",
        });
        return;
      }

      // Store admin session
      localStorage.setItem("admin_email", result.admin_email);
      localStorage.setItem("admin_name", result.admin_name || "Admin");
      localStorage.setItem("user_role", "admin");
      
      toast({
        title: "Hoş geldiniz! 🛡️",
        description: `${result.admin_name || "Admin"} olarak giriş yaptınız.`,
      });
      
      navigate("/admin");
    } catch (error) {
      console.error("Admin login error:", error);
      toast({
        title: "Hata",
        description: "Token doğrulanırken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/parent`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Google sign in error:", error);
      toast({
        title: "Hata",
        description: "Google ile giriş yapılırken bir hata oluştu.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <AppBackground showStars>
      <div className="min-h-screen flex flex-col px-6 py-12 animate-fade-in">
        {/* Language Toggle */}
        <div className="flex justify-end">
          <div className="flex items-center gap-1 p-1 bg-secondary rounded-full">
            <button
              onClick={() => setLanguage("tr")}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-160",
                language === "tr"
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              🇹🇷 TR
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-160",
                language === "en"
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              🇺🇸 EN
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="mt-6 text-center animate-fade-in stagger-1">
          {/* Logo */}
          <div className="w-20 h-20 mx-auto rounded-full gradient-primary flex items-center justify-center shadow-glow mb-6">
            <svg viewBox="0 0 48 48" className="w-10 h-10 text-primary-foreground">
              <path
                fill="currentColor"
                d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20c1.73 0 3.4-.22 5-.64-8.64-2.17-15-10.04-15-19.36s6.36-17.19 15-19.36c-1.6-.42-3.27-.64-5-.64z"
              />
              <circle fill="currentColor" cx="36" cy="14" r="3" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">TCC İslami Çetele</h1>
          <p className="mt-2 text-muted-foreground">{t("welcomeBack")}</p>
        </div>

        {/* Role Selector Chips */}
        <div className="mt-6 flex justify-center gap-2 animate-fade-in stagger-2">
          {(Object.keys(roleConfig) as LoginRole[]).map((role) => {
            const config = roleConfig[role];
            const isSelected = selectedRole === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border",
                  isSelected
                    ? `${config.bgColor} ${config.color} ${config.borderColor} shadow-sm`
                    : "bg-card border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                <span>{config.emoji}</span>
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>

        {/* Helper Text */}
        <p className={cn(
          "mt-4 text-center text-sm transition-all duration-200",
          currentRoleConfig.color
        )}>
          {language === "tr" ? currentRoleConfig.helperText : currentRoleConfig.helperTextEn}
        </p>

        {/* Child Login Form */}
        {selectedRole === "child" && (
          <div className="mt-6 space-y-4 animate-fade-in">
            <div className="bg-card rounded-2xl p-6 border border-border/50 card-shadow space-y-4">
              {/* Username */}
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Kullanıcı Adı"
                  value={childUsername}
                  onChange={(e) => setChildUsername(e.target.value)}
                  className="pl-12 h-14 bg-input border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* PIN Label */}
              <p className="text-sm text-muted-foreground text-center">PIN (4-6 hane)</p>

              {/* PIN Keypad */}
              <PinKeypad
                value={childPin}
                onChange={setChildPin}
                maxLength={6}
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="button"
              onClick={handleChildLogin}
              disabled={isLoading || !childUsername.trim() || childPin.length < 4}
              className="w-full h-14 rounded-2xl gradient-primary text-primary-foreground font-semibold text-base shadow-glow hover:shadow-glow-lg transition-all duration-200 active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                "Giriş Yap"
              )}
            </Button>

            {/* Help Text */}
            <p className="text-center text-sm text-muted-foreground">
              PIN'ini unuttun mu?{" "}
              <span className="text-primary">Ebeveyninden yardım iste.</span>
            </p>
          </div>
        )}

        {/* Parent Login Form */}
        {selectedRole === "parent" && (
          <form onSubmit={handleParentLogin} className="mt-6 space-y-4 animate-fade-in">
            {/* Google Sign In */}
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              variant="outline"
              className="w-full h-14 rounded-2xl bg-card border-border/50 text-foreground font-medium text-base hover:bg-secondary transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google ile devam et
            </Button>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-border/50" />
              <span className="text-sm text-muted-foreground">veya</span>
              <div className="flex-1 h-px bg-border/50" />
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border/50 card-shadow space-y-4">
              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="E-posta"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 bg-input border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={t("password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-14 bg-input border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-2xl gradient-primary text-primary-foreground font-semibold text-base shadow-glow hover:shadow-glow-lg transition-all duration-200 active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                t("signIn")
              )}
            </Button>

            {/* Sign Up Link */}
            <div className="text-center">
              <Link
                to="/parent-signup"
                className="text-sm text-accent hover:text-accent/80 transition-colors font-medium"
              >
                Hesabınız yok mu? Ebeveyn olarak kayıt olun
              </Link>
            </div>
          </form>
        )}

        {/* Admin Login Form */}
        {selectedRole === "admin" && (
          <div className="mt-6 space-y-4 animate-fade-in">
            <div className="bg-card rounded-2xl p-6 border border-border/50 card-shadow space-y-4">
              {/* Token */}
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Yönetici Token"
                  value={adminToken}
                  onChange={(e) => setAdminToken(e.target.value)}
                  className="pl-12 h-14 bg-input border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-destructive/50 focus:ring-2 focus:ring-destructive/20"
                />
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Yönetici token'ı TCC yetkililerinden alınır.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="button"
              onClick={handleAdminLogin}
              disabled={isLoading || !adminToken.trim()}
              className="w-full h-14 rounded-2xl bg-destructive text-destructive-foreground font-semibold text-base shadow-glow hover:bg-destructive/90 transition-all duration-200 active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
              ) : (
                "Yönetici Girişi"
              )}
            </Button>
          </div>
        )}

        {/* Bismillah */}
        <div className="mt-auto pt-8 text-center animate-fade-in stagger-4">
          <p className="font-arabic text-lg text-accent/80">{t("bismillahArabic")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("bismillah")}</p>
        </div>
      </div>
    </AppBackground>
  );
}
