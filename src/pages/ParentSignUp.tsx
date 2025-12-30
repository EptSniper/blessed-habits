import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, User, Phone, Info, CheckCircle, ArrowLeft } from "lucide-react";
import { AppBackground } from "@/components/ui/AppBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function ParentSignUp() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [childCode, setChildCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !email || !password) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tüm zorunlu alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Şifre Uyuşmuyor",
        description: "Şifreler birbiriyle eşleşmiyor.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Şifre Çok Kısa",
        description: "Şifre en az 6 karakter olmalıdır.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Sign up the user with parent role
      const { error } = await signUp(email, password, firstName, lastName, "parent");
      
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
        return;
      }

      // If child code was provided, create a pending link request
      if (childCode.trim()) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("parent_link_requests").insert({
            parent_id: user.id,
            child_code: childCode.trim().toUpperCase(),
          });
        }
      }

      setIsSuccess(true);
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Hata",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AppBackground showStars>
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 animate-fade-in">
          <div className="bg-card rounded-2xl p-8 border border-border/50 card-shadow max-w-md w-full text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Başvuru Gönderildi</h1>
            <p className="text-muted-foreground mb-6">
              Başvurunuz TCC'ye gönderildi. Onaylandığında bilgilendirileceksiniz.
            </p>
            <Button
              onClick={() => navigate("/login")}
              className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold"
            >
              Giriş Sayfasına Dön
            </Button>
          </div>
        </div>
      </AppBackground>
    );
  }

  return (
    <AppBackground showStars>
      <div className="min-h-screen flex flex-col px-6 py-8 animate-fade-in">
        {/* Back Button */}
        <Link
          to="/login"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Giriş'e Dön</span>
        </Link>

        {/* Header */}
        <div className="text-center animate-fade-in stagger-1">
          <h1 className="text-2xl font-bold text-foreground">Ebeveyn Kaydı</h1>
          <p className="mt-2 text-muted-foreground">
            Çocuğunuzun ilerlemesini görüntülemek için erişim isteyin.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 animate-fade-in stagger-2">
          <div className="bg-card rounded-2xl p-6 border border-border/50 card-shadow space-y-4">
            {/* First Name */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Ad *"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="pl-12 h-14 bg-input border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            {/* Last Name */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Soyad *"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="pl-12 h-14 bg-input border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="E-posta *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-14 bg-input border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            {/* Phone (optional) */}
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="Telefon (isteğe bağlı)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-12 h-14 bg-input border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Şifre *"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 pr-12 h-14 bg-input border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Şifre Tekrar *"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-12 h-14 bg-input border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
          </div>

          {/* Child Code (optional) */}
          <div className="bg-card rounded-2xl p-6 border border-border/50 card-shadow space-y-3">
            <label className="text-sm font-medium text-foreground">
              Çocuk Kodu (isteğe bağlı)
            </label>
            <Input
              type="text"
              placeholder="Örn: TCC-7K4P2"
              value={childCode}
              onChange={(e) => setChildCode(e.target.value.toUpperCase())}
              className="h-14 bg-input border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20 font-mono tracking-wider"
            />
            <p className="text-xs text-muted-foreground">
              Çocuğunuz TCC'den bir kod aldıysa, buraya girin.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-secondary rounded-xl p-4 flex gap-3">
            <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Hesabınız TCC yetkilileri tarafından incelenecektir. Onaylandığında erişim sağlayabilirsiniz.
            </p>
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
              "Erişim İste"
            )}
          </Button>
        </form>
      </div>
    </AppBackground>
  );
}
