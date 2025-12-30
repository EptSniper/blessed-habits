import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, User as UserIcon, Users, Shield } from "lucide-react";
import { AppBackground } from "@/components/ui/AppBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type LoginRole = "child" | "parent" | "admin";

const roleConfig = {
  child: {
    icon: UserIcon,
    label: "Çocuk",
    emoji: "👦",
    helperText: "Öğretmeninizden aldığınız kullanıcı adını kullanın.",
    helperTextEn: "Use the username from your teacher.",
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const currentRoleConfig = roleConfig[selectedRole];

  const handleSubmit = async (e: React.FormEvent) => {
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
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast({
        title: "Hata",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
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

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 animate-fade-in stagger-3">
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

          {/* Sign Up Link - Only visible for Parent role */}
          {selectedRole === "parent" && (
            <div className="text-center space-y-2">
              <Link
                to="/parent-signup"
                className="text-sm text-accent hover:text-accent/80 transition-colors font-medium"
              >
                Hesabınız yok mu? Ebeveyn olarak kayıt olun
              </Link>
            </div>
          )}

          {/* Child Activation Link - Only visible for Child role */}
          {selectedRole === "child" && (
            <div className="text-center">
              <Link
                to="/child-activation"
                className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Hesabınızı aktifleştirin
              </Link>
            </div>
          )}
        </form>

        {/* Bismillah */}
        <div className="mt-auto pt-8 text-center animate-fade-in stagger-4">
          <p className="font-arabic text-lg text-accent/80">{t("bismillahArabic")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("bismillah")}</p>
        </div>
      </div>
    </AppBackground>
  );
}
