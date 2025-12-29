import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Lock, Mail, UserCircle } from "lucide-react";
import { AppBackground } from "@/components/ui/AppBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export default function Auth() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { signIn, signUp } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
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
      } else {
        if (!firstName || !lastName) {
          toast({
            title: "Eksik Bilgi",
            description: "Lütfen ad ve soyad alanlarını doldurun.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(email, password, firstName, lastName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Hesap Mevcut",
              description: "Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Kayıt Başarısız",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Kayıt Başarılı!",
            description: "Hesabınız oluşturuldu. Şimdi giriş yapabilirsiniz.",
          });
          navigate("/dashboard");
        }
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
        <div className="mt-8 text-center animate-fade-in stagger-1">
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
          <p className="mt-2 text-muted-foreground">
            {isLogin ? t("welcomeBack") : "Yeni hesap oluştur"}
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-4 animate-fade-in stagger-2">
          <div className="bg-card rounded-2xl p-6 border border-border/50 card-shadow space-y-4">
            {/* Name fields for signup */}
            {!isLogin && (
              <>
                <div className="relative">
                  <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Ad"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="pl-12 h-14 bg-input border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Soyad"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="pl-12 h-14 bg-input border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </>
            )}

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
            ) : isLogin ? (
              t("signIn")
            ) : (
              t("signUp")
            )}
          </Button>

          {/* Toggle Login/Signup */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? "Hesabınız yok mu? Kayıt olun" : "Zaten hesabınız var mı? Giriş yapın"}
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
