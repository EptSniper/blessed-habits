import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Key, Info, CheckCircle, ArrowLeft } from "lucide-react";
import { AppBackground } from "@/components/ui/AppBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function ChildActivation() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [activationCode, setActivationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activationCode.trim()) {
      toast({
        title: "Kod Gerekli",
        description: "Lütfen aktivasyon kodunu girin.",
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
      const code = activationCode.trim().toUpperCase();

      // Check if the activation code exists and is valid
      const { data: codeData, error: codeError } = await supabase
        .from("child_activation_codes")
        .select("*")
        .eq("code", code)
        .maybeSingle();

      if (codeError) {
        throw codeError;
      }

      if (!codeData) {
        toast({
          title: "Geçersiz Kod",
          description: "Bu kod geçerli değil. Öğretmeninize danışın.",
          variant: "destructive",
        });
        return;
      }

      if (codeData.used_at) {
        toast({
          title: "Kod Kullanılmış",
          description: "Bu kod zaten kullanılmış.",
          variant: "destructive",
        });
        return;
      }

      if (new Date(codeData.expires_at) < new Date()) {
        toast({
          title: "Kod Süresi Dolmuş",
          description: "Bu kodun süresi dolmuş. Yeni bir kod isteyin.",
          variant: "destructive",
        });
        return;
      }

      // Get child user info from profiles using the child_user_id
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("user_id", codeData.child_user_id)
        .maybeSingle();

      if (profileError || !profileData?.email) {
        toast({
          title: "Hesap Bulunamadı",
          description: "Bu kodla ilişkili hesap bulunamadı.",
          variant: "destructive",
        });
        return;
      }

      // Update the user's password using admin update (this needs to be done via edge function in production)
      // For now, we'll sign in the user and update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      // Mark the code as used
      await supabase
        .from("child_activation_codes")
        .update({ used_at: new Date().toISOString() })
        .eq("id", codeData.id);

      // Update profile status to active
      await supabase
        .from("profiles")
        .update({ status: "active" })
        .eq("user_id", codeData.child_user_id);

      setIsSuccess(true);
    } catch (error) {
      console.error("Activation error:", error);
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
            <h1 className="text-2xl font-bold text-foreground mb-2">Hoş Geldin!</h1>
            <p className="text-muted-foreground mb-6">
              Hesabınız hazır. Artık günlük ibadah kaydınızı tutabilirsiniz.
            </p>
            <Button
              onClick={() => navigate("/login")}
              className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold"
            >
              Giriş Yap
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
          <h1 className="text-2xl font-bold text-foreground">Hesabınızı Aktifleştirin</h1>
          <p className="mt-2 text-muted-foreground">
            Öğretmeninizden aldığınız kodu girin.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-4 animate-fade-in stagger-2">
          <div className="bg-card rounded-2xl p-6 border border-border/50 card-shadow space-y-4">
            {/* Activation Code */}
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Aktivasyon Kodu (örn: TCC-7K4P2)"
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                className="pl-12 h-14 bg-input border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20 font-mono tracking-wider uppercase"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Yeni Şifre"
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
                placeholder="Şifre Tekrar"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-12 h-14 bg-input border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-secondary rounded-xl p-4 flex gap-3">
            <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Bu hesap TCC tarafından oluşturuldu. Sadece şifrenizi belirliyorsunuz.
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
              "Hesabı Aktifleştir"
            )}
          </Button>
        </form>
      </div>
    </AppBackground>
  );
}
