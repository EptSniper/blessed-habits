import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Users,
  UserPlus,
  ClipboardList,
  ArrowLeft,
  Check,
  X,
  Key,
  Copy,
  Loader2,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import { AppBackground } from "@/components/ui/AppBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PendingParent {
  id: string;
  parent_id: string;
  child_code: string | null;
  status: string;
  created_at: string;
  profile: {
    first_name: string;
    last_name: string;
    email: string | null;
  } | null;
}

interface ChildProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  status: string;
}

interface ActivationCode {
  id: string;
  code: string;
  child_user_id: string | null;
  expires_at: string;
  used_at: string | null;
  created_at: string;
  child_profile?: ChildProfile | null;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  // Check for token-based admin auth
  const storedRole = localStorage.getItem("user_role");
  const adminEmail = localStorage.getItem("admin_email");
  const adminName = localStorage.getItem("admin_name");
  const isAdminAuth = storedRole === "admin" && adminEmail;

  const [activeTab, setActiveTab] = useState<"requests" | "children" | "codes">("requests");
  const [pendingRequests, setPendingRequests] = useState<PendingParent[]>([]);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [activationCodes, setActivationCodes] = useState<ActivationCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PendingParent | null>(null);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [isApproving, setIsApproving] = useState(false);
  const [showCreateChild, setShowCreateChild] = useState(false);
  const [newChildForm, setNewChildForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    groupClass: "",
  });
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isAdminAuth) {
      navigate("/auth");
      return;
    }
    fetchData();
  }, [isAdminAuth]);

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchPendingRequests(),
      fetchChildren(),
      fetchActivationCodes(),
    ]);
    setIsLoading(false);
  };

  const fetchPendingRequests = async () => {
    const { data, error } = await supabase
      .from("parent_link_requests")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching requests:", error);
      return;
    }

    // Fetch profiles for each request
    const requestsWithProfiles = await Promise.all(
      (data || []).map(async (request) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name, email")
          .eq("user_id", request.parent_id)
          .maybeSingle();

        return { ...request, profile };
      })
    );

    setPendingRequests(requestsWithProfiles);
  };

  const fetchChildren = async () => {
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "child");

    if (roleError) {
      console.error("Error fetching child roles:", roleError);
      return;
    }

    const childIds = roleData?.map((r) => r.user_id) || [];

    if (childIds.length === 0) {
      setChildren([]);
      return;
    }

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, first_name, last_name, email, status")
      .in("user_id", childIds);

    if (profileError) {
      console.error("Error fetching child profiles:", profileError);
      return;
    }

    setChildren(profiles || []);
  };

  const fetchActivationCodes = async () => {
    const { data, error } = await supabase
      .from("child_activation_codes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching codes:", error);
      return;
    }

    // Fetch child profiles for each code
    const codesWithProfiles = await Promise.all(
      (data || []).map(async (code) => {
        if (!code.child_user_id) return { ...code, child_profile: null };

        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name, email, status")
          .eq("user_id", code.child_user_id)
          .maybeSingle();

        return { ...code, child_profile: profile };
      })
    );

    setActivationCodes(codesWithProfiles);
  };

  const handleApproveRequest = async (link: boolean = true) => {
    if (!selectedRequest) return;

    setIsApproving(true);

    try {
      // Update request status
      await supabase
        .from("parent_link_requests")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedRequest.id);

      // Update parent profile status to active
      await supabase
        .from("profiles")
        .update({ status: "active" })
        .eq("user_id", selectedRequest.parent_id);

      // If linking to a child
      if (link && selectedChild) {
        await supabase.from("parent_child_links").insert({
          parent_id: selectedRequest.parent_id,
          child_id: selectedChild,
        });
      }

      toast({
        title: "Onaylandı",
        description: "Ebeveyn başvurusu onaylandı.",
      });

      setSelectedRequest(null);
      setSelectedChild("");
      fetchPendingRequests();
    } catch (error) {
      console.error("Error approving request:", error);
      toast({
        title: "Hata",
        description: "Bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;

    setIsApproving(true);

    try {
      await supabase
        .from("parent_link_requests")
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedRequest.id);

      toast({
        title: "Reddedildi",
        description: "Ebeveyn başvurusu reddedildi.",
      });

      setSelectedRequest(null);
      fetchPendingRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Hata",
        description: "Bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleCreateChild = async () => {
    if (!newChildForm.firstName || !newChildForm.lastName || !newChildForm.email) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tüm zorunlu alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    setIsApproving(true);

    try {
      // Create user via Supabase Auth admin (in production, this should be an edge function)
      // For now, we'll create a temporary password
      const tempPassword = Math.random().toString(36).slice(-12);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newChildForm.email,
        password: tempPassword,
        options: {
          data: {
            first_name: newChildForm.firstName,
            last_name: newChildForm.lastName,
            role: "child",
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("User creation failed");
      }

      // Update child profile with additional info
      if (newChildForm.groupClass) {
        await supabase.from("child_profiles").insert({
          user_id: authData.user.id,
          group_class: newChildForm.groupClass,
        });
      }

      // Generate activation code
      const { data: codeData, error: codeError } = await supabase.rpc("generate_child_code");

      if (codeError) throw codeError;

      // Save activation code
      await supabase.from("child_activation_codes").insert({
        code: codeData,
        child_user_id: authData.user.id,
      });

      setGeneratedCode(codeData);
      setNewChildForm({ firstName: "", lastName: "", email: "", groupClass: "" });
      fetchChildren();
      fetchActivationCodes();

      toast({
        title: "Çocuk Hesabı Oluşturuldu",
        description: "Aktivasyon kodu oluşturuldu.",
      });
    } catch (error: any) {
      console.error("Error creating child:", error);
      toast({
        title: "Hata",
        description: error.message || "Bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Kopyalandı",
      description: "Aktivasyon kodu panoya kopyalandı.",
    });
  };

  const filteredChildren = children.filter(
    (child) =>
      child.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <AppBackground>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <div className="min-h-screen pb-24">
        {/* Header */}
        <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-bold text-foreground">Yönetici Paneli</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 py-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab("requests")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
              activeTab === "requests"
                ? "bg-accent text-accent-foreground"
                : "bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            <ClipboardList className="w-4 h-4" />
            Bekleyen ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("children")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
              activeTab === "children"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="w-4 h-4" />
            Çocuklar ({children.length})
          </button>
          <button
            onClick={() => setActiveTab("codes")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
              activeTab === "codes"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            <Key className="w-4 h-4" />
            Kodlar
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-8">
          {/* Pending Requests Tab */}
          {activeTab === "requests" && (
            <div className="space-y-4 animate-fade-in">
              {pendingRequests.length === 0 ? (
                <div className="bg-card rounded-2xl p-8 text-center border border-border/50">
                  <p className="text-muted-foreground">Bekleyen başvuru yok</p>
                </div>
              ) : (
                pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    onClick={() => setSelectedRequest(request)}
                    className="bg-card rounded-2xl p-4 border border-border/50 cursor-pointer hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {request.profile?.first_name} {request.profile?.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{request.profile?.email}</p>
                        {request.child_code && (
                          <p className="text-xs text-accent mt-1">
                            Çocuk Kodu: {request.child_code}
                          </p>
                        )}
                      </div>
                      <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium">
                        Bekliyor
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(request.created_at).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Children Tab */}
          {activeTab === "children" && (
            <div className="space-y-4 animate-fade-in">
              {/* Search and Create Button */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Çocuk ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 bg-card border-border/50 rounded-xl"
                  />
                </div>
                <Button
                  onClick={() => setShowCreateChild(true)}
                  className="h-12 px-4 rounded-xl gradient-primary"
                >
                  <UserPlus className="w-5 h-5" />
                </Button>
              </div>

              {/* Children List */}
              {filteredChildren.length === 0 ? (
                <div className="bg-card rounded-2xl p-8 text-center border border-border/50">
                  <p className="text-muted-foreground">Çocuk bulunamadı</p>
                </div>
              ) : (
                filteredChildren.map((child) => (
                  <div
                    key={child.user_id}
                    className="bg-card rounded-2xl p-4 border border-border/50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {child.first_name} {child.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{child.email}</p>
                      </div>
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium",
                          child.status === "active"
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {child.status === "active" ? "Aktif" : "Bekliyor"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Codes Tab */}
          {activeTab === "codes" && (
            <div className="space-y-4 animate-fade-in">
              {activationCodes.length === 0 ? (
                <div className="bg-card rounded-2xl p-8 text-center border border-border/50">
                  <p className="text-muted-foreground">Aktivasyon kodu yok</p>
                </div>
              ) : (
                activationCodes.map((code) => (
                  <div
                    key={code.id}
                    className="bg-card rounded-2xl p-4 border border-border/50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-lg text-foreground">{code.code}</span>
                          <button
                            onClick={() => copyCode(code.code)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        {code.child_profile && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {code.child_profile.first_name} {code.child_profile.last_name}
                          </p>
                        )}
                      </div>
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium",
                          code.used_at
                            ? "bg-primary/20 text-primary"
                            : new Date(code.expires_at) < new Date()
                            ? "bg-destructive/20 text-destructive"
                            : "bg-accent/20 text-accent"
                        )}
                      >
                        {code.used_at
                          ? "Kullanıldı"
                          : new Date(code.expires_at) < new Date()
                          ? "Süresi Doldu"
                          : "Bekliyor"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Bitiş: {new Date(code.expires_at).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Request Approval Sheet */}
        <Sheet open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <SheetContent side="bottom" className="bg-card rounded-t-3xl border-t border-border/50">
            <SheetHeader>
              <SheetTitle>Ebeveyn Başvurusu</SheetTitle>
              <SheetDescription>
                Başvuruyu inceleyip onaylayın veya reddedin.
              </SheetDescription>
            </SheetHeader>

            {selectedRequest && (
              <div className="mt-4 space-y-4">
                <div className="bg-secondary rounded-xl p-4">
                  <p className="font-semibold text-foreground">
                    {selectedRequest.profile?.first_name} {selectedRequest.profile?.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.profile?.email}</p>
                  {selectedRequest.child_code && (
                    <p className="text-sm text-accent mt-2">
                      Girilen Kod: {selectedRequest.child_code}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Çocuk Seç</label>
                  <Select value={selectedChild} onValueChange={setSelectedChild}>
                    <SelectTrigger className="mt-2 h-12 bg-input border-border/50 rounded-xl">
                      <SelectValue placeholder="Çocuk seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      {children.map((child) => (
                        <SelectItem key={child.user_id} value={child.user_id}>
                          {child.first_name} {child.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleRejectRequest}
                    variant="outline"
                    disabled={isApproving}
                    className="flex-1 h-12 rounded-xl border-destructive/50 text-destructive hover:bg-destructive/10"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reddet
                  </Button>
                  <Button
                    onClick={() => handleApproveRequest(true)}
                    disabled={isApproving || !selectedChild}
                    className="flex-1 h-12 rounded-xl gradient-primary"
                  >
                    {isApproving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Onayla & Bağla
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Create Child Sheet */}
        <Sheet open={showCreateChild} onOpenChange={setShowCreateChild}>
          <SheetContent side="bottom" className="bg-card rounded-t-3xl border-t border-border/50">
            <SheetHeader>
              <SheetTitle>Yeni Çocuk Hesabı</SheetTitle>
              <SheetDescription>
                Çocuk için yeni bir hesap ve aktivasyon kodu oluşturun.
              </SheetDescription>
            </SheetHeader>

            {generatedCode ? (
              <div className="mt-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Hesap Oluşturuldu!</h3>
                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-2">Aktivasyon Kodu:</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono text-2xl text-foreground">{generatedCode}</span>
                    <button
                      onClick={() => copyCode(generatedCode)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setGeneratedCode(null);
                    setShowCreateChild(false);
                  }}
                  className="w-full h-12 rounded-xl"
                  variant="outline"
                >
                  Kapat
                </Button>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <Input
                  placeholder="Ad *"
                  value={newChildForm.firstName}
                  onChange={(e) =>
                    setNewChildForm({ ...newChildForm, firstName: e.target.value })
                  }
                  className="h-12 bg-input border-border/50 rounded-xl"
                />
                <Input
                  placeholder="Soyad *"
                  value={newChildForm.lastName}
                  onChange={(e) =>
                    setNewChildForm({ ...newChildForm, lastName: e.target.value })
                  }
                  className="h-12 bg-input border-border/50 rounded-xl"
                />
                <Input
                  type="email"
                  placeholder="E-posta *"
                  value={newChildForm.email}
                  onChange={(e) =>
                    setNewChildForm({ ...newChildForm, email: e.target.value })
                  }
                  className="h-12 bg-input border-border/50 rounded-xl"
                />
                <Input
                  placeholder="Sınıf / Grup (isteğe bağlı)"
                  value={newChildForm.groupClass}
                  onChange={(e) =>
                    setNewChildForm({ ...newChildForm, groupClass: e.target.value })
                  }
                  className="h-12 bg-input border-border/50 rounded-xl"
                />

                <Button
                  onClick={handleCreateChild}
                  disabled={isApproving}
                  className="w-full h-12 rounded-xl gradient-primary"
                >
                  {isApproving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Hesap Oluştur"
                  )}
                </Button>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </AppBackground>
  );
}
