import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { AppBackground } from "@/components/ui/AppBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

export default function Login() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login - will be replaced with real auth
    setTimeout(() => {
      setIsLoading(false);
      navigate("/dashboard");
    }, 800);
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
        <div className="mt-12 text-center animate-fade-in stagger-1">
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

        {/* Login Form */}
        <form onSubmit={handleLogin} className="mt-10 space-y-4 animate-fade-in stagger-2">
          <div className="bg-card rounded-2xl p-6 border border-border/50 card-shadow space-y-4">
            {/* Username */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("username")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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

          {/* Sign In Button */}
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

          {/* Links */}
          <div className="flex items-center justify-center gap-4 text-sm">
            <button type="button" className="text-muted-foreground hover:text-primary transition-colors">
              {t("forgotPassword")}
            </button>
            <span className="text-border">•</span>
            <button type="button" className="text-muted-foreground hover:text-primary transition-colors">
              {t("signUp")}
            </button>
          </div>
        </form>

        {/* Bismillah */}
        <div className="mt-auto pt-12 text-center animate-fade-in stagger-3">
          <p className="font-arabic text-lg text-accent/80">{t("bismillahArabic")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("bismillah")}</p>
        </div>
      </div>
    </AppBackground>
  );
}
