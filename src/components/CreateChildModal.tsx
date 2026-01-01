import { useState } from "react";
import { X, User, Lock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PinKeypad } from "@/components/ui/PinKeypad";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CreateChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parentId: string;
}

export function CreateChildModal({ isOpen, onClose, onSuccess, parentId }: CreateChildModalProps) {
  const [step, setStep] = useState<"info" | "pin" | "confirm">("info");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [groupClass, setGroupClass] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [createdChild, setCreatedChild] = useState<{ username: string; pin: string } | null>(null);

  const generateUsername = () => {
    if (firstName) {
      const randomNum = Math.floor(Math.random() * 100);
      setUsername(firstName.toLowerCase().replace(/\s/g, "") + randomNum);
    }
  };

  const handleNextStep = () => {
    if (step === "info") {
      if (!firstName.trim() || !username.trim()) {
        toast({
          title: "Eksik Bilgi",
          description: "İsim ve kullanıcı adı gereklidir.",
          variant: "destructive",
        });
        return;
      }
      setStep("pin");
    } else if (step === "pin") {
      if (pin.length < 4) {
        toast({
          title: "PIN Çok Kısa",
          description: "PIN en az 4 haneli olmalıdır.",
          variant: "destructive",
        });
        return;
      }
      if (pin !== confirmPin) {
        toast({
          title: "PIN Eşleşmiyor",
          description: "Girilen PIN'ler aynı olmalıdır.",
          variant: "destructive",
        });
        return;
      }
      createChildAccount();
    }
  };

  const createChildAccount = async () => {
    setIsLoading(true);
    try {
      // Check if username already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("child_auth")
        .select("username")
        .eq("username", username.toLowerCase())
        .maybeSingle();

      if (checkError && !checkError.message.includes("0 rows")) throw checkError;
      if (existingUser) {
        toast({
          title: "Kullanıcı Adı Kullanılıyor",
          description: "Bu kullanıcı adı zaten mevcut. Başka bir tane deneyin.",
          variant: "destructive",
        });
        setIsLoading(false);
        setStep("info");
        return;
      }

      // Create user via signup with random email (child won't use email)
      const childEmail = `child_${username.toLowerCase()}_${Date.now()}@tcc.internal`;
      const randomPassword = Math.random().toString(36).slice(-12);

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: childEmail,
        password: randomPassword,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName || "",
            role: "child",
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Kullanıcı oluşturulamadı");

      const childUserId = authData.user.id;

      // Link parent to child FIRST (this is needed for RLS policies)
      const { error: linkError } = await supabase.from("parent_child_links").insert({
        parent_id: parentId,
        child_id: childUserId,
      });

      if (linkError) throw linkError;

      // Now create child_auth record with PIN (RLS will pass because link exists)
      const pinHash = await hashPin(pin);
      const { error: authError } = await supabase.from("child_auth").insert({
        user_id: childUserId,
        username: username.toLowerCase(),
        pin_hash: pinHash,
      });

      if (authError) throw authError;

      // Create child_profiles record if group/class provided
      if (groupClass) {
        await supabase.from("child_profiles").insert({
          user_id: childUserId,
          group_class: groupClass,
        });
      }

      setCreatedChild({ username: username.toLowerCase(), pin });
      setStep("confirm");
      onSuccess();
    } catch (error) {
      console.error("Error creating child:", error);
      toast({
        title: "Hata",
        description: "Çocuk hesabı oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hashPin = async (pin: string): Promise<string> => {
    const { data, error } = await supabase.rpc("hash_pin", { pin });
    if (error) throw error;
    return data;
  };

  const handleClose = () => {
    setStep("info");
    setFirstName("");
    setLastName("");
    setUsername("");
    setGroupClass("");
    setPin("");
    setConfirmPin("");
    setCreatedChild(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-card rounded-3xl border border-border/50 shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/30">
          <h2 className="text-xl font-bold text-foreground">
            {step === "confirm" ? "Hesap Oluşturuldu!" : "Çocuk Hesabı Oluştur"}
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "info" && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  Çocuğun Adı *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Adı"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="pl-12 h-12 bg-input border-border/50 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  Soyadı (Opsiyonel)
                </label>
                <Input
                  type="text"
                  placeholder="Soyadı"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-12 bg-input border-border/50 rounded-xl"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  Kullanıcı Adı *
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="kullaniciadi"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
                    className="h-12 bg-input border-border/50 rounded-xl flex-1"
                  />
                  <Button
                    type="button"
                    onClick={generateUsername}
                    variant="outline"
                    className="h-12 px-4 rounded-xl border-border/50"
                  >
                    Öner
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Basit ve akılda kalıcı olsun
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  Grup / Sınıf (Opsiyonel)
                </label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Örn: 5. Sınıf"
                    value={groupClass}
                    onChange={(e) => setGroupClass(e.target.value)}
                    className="pl-12 h-12 bg-input border-border/50 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {step === "pin" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-3 block text-center">
                  <Lock className="w-4 h-4 inline mr-1" />
                  PIN Oluştur (4-6 hane)
                </label>
                <PinKeypad value={pin} onChange={setPin} maxLength={6} disabled={isLoading} />
              </div>

              {pin.length >= 4 && (
                <div className="animate-fade-in">
                  <label className="text-sm font-medium text-muted-foreground mb-3 block text-center">
                    PIN'i Onayla
                  </label>
                  <PinKeypad value={confirmPin} onChange={setConfirmPin} maxLength={6} disabled={isLoading} />
                </div>
              )}
            </div>
          )}

          {step === "confirm" && createdChild && (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-3xl">✓</span>
              </div>

              <div className="bg-secondary/50 rounded-2xl p-6 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Kullanıcı Adı</p>
                  <p className="text-2xl font-bold text-foreground">{createdChild.username}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">PIN</p>
                  <p className="text-2xl font-bold text-foreground tracking-widest">
                    {"●".repeat(createdChild.pin.length)}
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Bu bilgileri çocuğunuzla paylaşın. Giriş yapmak için kullanacaklar.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border/30">
          {step !== "confirm" ? (
            <div className="flex gap-3">
              {step === "pin" && (
                <Button
                  type="button"
                  onClick={() => setStep("info")}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl border-border/50"
                  disabled={isLoading}
                >
                  Geri
                </Button>
              )}
              <Button
                type="button"
                onClick={handleNextStep}
                disabled={isLoading}
                className="flex-1 h-12 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-glow"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : step === "info" ? (
                  "Devam Et"
                ) : (
                  "Hesap Oluştur"
                )}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              onClick={handleClose}
              className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-glow"
            >
              Tamam
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
