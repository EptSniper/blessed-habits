import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, BookOpen, Star, LogOut, ChevronDown, ChevronUp, Calendar, Plus } from "lucide-react";
import { AppBackground } from "@/components/ui/AppBackground";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { MetricTile } from "@/components/ui/MetricTile";
import { Button } from "@/components/ui/button";
import { CreateChildModal } from "@/components/CreateChildModal";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { tr } from "date-fns/locale";

interface ChildWithStats {
  id: string;
  firstName: string;
  lastName: string;
  weeklyStats: {
    quranPages: number;
    prayerCompletion: number;
    dhikrCount: number;
    daysLogged: number;
  };
  dailyLogs: DailyLogSummary[];
}

interface DailyLogSummary {
  date: string;
  quranPages: number;
  farzPrayers: number;
  dhikrTotal: number;
  hasGoodDeed: boolean;
}

export default function ParentDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, profile, userRole, signOut, isLoading: authLoading } = useAuth();
  const [children, setChildren] = useState<ChildWithStats[]>([]);
  const [expandedChild, setExpandedChild] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth");
      } else if (userRole && userRole !== "parent" && userRole !== "admin") {
        navigate("/dashboard");
      }
    }
  }, [user, userRole, authLoading, navigate]);

  useEffect(() => {
    if (user && (userRole === "parent" || userRole === "admin")) {
      fetchLinkedChildren();
    }
  }, [user, userRole]);

  const fetchLinkedChildren = async () => {
    if (!user) return;

    try {
      // Get linked children IDs
      const { data: links, error: linksError } = await supabase
        .from("parent_child_links")
        .select("child_id")
        .eq("parent_id", user.id);

      if (linksError) throw linksError;

      if (!links || links.length === 0) {
        setChildren([]);
        setIsLoading(false);
        return;
      }

      const childIds = links.map((l) => l.child_id);

      // Fetch children profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name")
        .in("user_id", childIds);

      if (profilesError) throw profilesError;

      // Fetch weekly logs for all children
      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

      const { data: weekLogs, error: logsError } = await supabase
        .from("daily_logs")
        .select("*")
        .in("child_id", childIds)
        .gte("log_date", format(weekStart, "yyyy-MM-dd"))
        .lte("log_date", format(weekEnd, "yyyy-MM-dd"));

      if (logsError) throw logsError;

      // Build children with stats
      const childrenWithStats: ChildWithStats[] = (profiles || []).map((p) => {
        const childLogs = (weekLogs || []).filter((l) => l.child_id === p.user_id);

        let quranPages = 0;
        let totalFarz = 0;
        let dhikrCount = 0;

        const dailyLogs: DailyLogSummary[] = childLogs.map((log) => {
          quranPages += log.quran_pages || 0;
          const farzCount =
            (log.prayer_fajr_farz ? 1 : 0) +
            (log.prayer_dhuhr_farz ? 1 : 0) +
            (log.prayer_asr_farz ? 1 : 0) +
            (log.prayer_maghrib_farz ? 1 : 0) +
            (log.prayer_isha_farz ? 1 : 0);
          totalFarz += farzCount;

          const logDhikr =
            (log.dhikr_subhan_allah || 0) +
            (log.dhikr_alhamdulillah || 0) +
            (log.dhikr_allahu_akbar || 0) +
            (log.dhikr_salawat || 0);
          dhikrCount += logDhikr;

          return {
            date: log.log_date,
            quranPages: log.quran_pages || 0,
            farzPrayers: farzCount,
            dhikrTotal: logDhikr,
            hasGoodDeed: !!log.good_deed,
          };
        });

        const daysLogged = childLogs.length;
        const prayerCompletion = daysLogged > 0 ? Math.round((totalFarz / (daysLogged * 5)) * 100) : 0;

        return {
          id: p.user_id,
          firstName: p.first_name,
          lastName: p.last_name,
          weeklyStats: {
            quranPages,
            prayerCompletion,
            dhikrCount,
            daysLogged,
          },
          dailyLogs,
        };
      });

      setChildren(childrenWithStats);
    } catch (error) {
      console.error("Error fetching linked children:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const toggleChildExpansion = (childId: string) => {
    setExpandedChild(expandedChild === childId ? null : childId);
  };

  const getWeekDays = () => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  };

  if (authLoading || isLoading) {
    return (
      <AppBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppBackground>
    );
  }

  const today = new Date();
  const formattedDate = format(today, "EEEE, d MMMM", { locale: tr });
  const displayName = profile?.first_name || user?.email?.split("@")[0] || "Veli";
  const weekDays = getWeekDays();

  // Aggregate stats across all children
  const totalChildren = children.length;
  const avgPrayerCompletion =
    totalChildren > 0
      ? Math.round(children.reduce((sum, c) => sum + c.weeklyStats.prayerCompletion, 0) / totalChildren)
      : 0;
  const totalQuranPages = children.reduce((sum, c) => sum + c.weeklyStats.quranPages, 0);

  return (
    <AppBackground showStars>
      <div className="min-h-screen pb-8">
        {/* Header */}
        <div className="relative px-6 pt-12 pb-8">
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

          <div className="relative animate-fade-in flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Merhaba,</p>
              <h1 className="text-3xl font-bold text-foreground mt-1">{displayName}</h1>
              <p className="text-sm text-muted-foreground mt-2 capitalize">{formattedDate}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
              title="Çıkış Yap"
            >
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Parent Badge */}
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Veli Paneli</span>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="px-6 grid grid-cols-3 gap-3">
          <MetricTile
            icon={<Users className="w-5 h-5" />}
            value={totalChildren}
            label="Çocuk"
            color="green"
            delay={0}
          />
          <MetricTile
            icon={<BookOpen className="w-5 h-5" />}
            value={totalQuranPages}
            label="Kuran Sayfa"
            color="green"
            delay={60}
          />
          <MetricTile
            icon={<Star className="w-5 h-5" />}
            value={`${avgPrayerCompletion}%`}
            label="Ort. Namaz"
            color="gold"
            delay={120}
          />
        </div>

        {/* Children List */}
        <div className="mt-6 px-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Çocuklarım</h2>
            <Button
              onClick={() => setShowCreateModal(true)}
              size="sm"
              className="h-9 rounded-xl gradient-primary text-primary-foreground shadow-glow gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Çocuk Ekle
            </Button>
          </div>

          {children.length === 0 ? (
            <div className="bg-card rounded-2xl p-6 border border-border/50 card-shadow text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Henüz çocuk hesabı oluşturmadınız.</p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 h-10 rounded-xl gradient-primary text-primary-foreground shadow-glow gap-1.5"
              >
                <Plus className="w-4 h-4" />
                İlk Çocuk Hesabını Oluştur
              </Button>
            </div>
          ) : (
            children.map((child, index) => (
              <div
                key={child.id}
                className={cn(
                  "bg-card rounded-2xl border border-border/50 card-shadow overflow-hidden",
                  "animate-fade-in",
                  index === 0 && "stagger-1",
                  index === 1 && "stagger-2",
                  index === 2 && "stagger-3"
                )}
              >
                {/* Child Header */}
                <button
                  onClick={() => toggleChildExpansion(child.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-foreground/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {child.firstName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-foreground">
                        {child.firstName} {child.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Bu hafta {child.weeklyStats.daysLogged} gün kayıt
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ProgressRing
                      progress={child.weeklyStats.prayerCompletion}
                      size={44}
                      strokeWidth={4}
                      color="green"
                    />
                    {expandedChild === child.id ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {expandedChild === child.id && (
                  <div className="border-t border-border/30 p-4 animate-fade-in">
                    {/* Weekly Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-secondary/50 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-foreground">
                          {child.weeklyStats.quranPages}
                        </p>
                        <p className="text-xs text-muted-foreground">Kuran Sayfa</p>
                      </div>
                      <div className="bg-secondary/50 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-foreground">
                          {child.weeklyStats.prayerCompletion}%
                        </p>
                        <p className="text-xs text-muted-foreground">Namaz</p>
                      </div>
                      <div className="bg-secondary/50 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-foreground">
                          {child.weeklyStats.dhikrCount}
                        </p>
                        <p className="text-xs text-muted-foreground">Zikir</p>
                      </div>
                    </div>

                    {/* Weekly Calendar View */}
                    <div className="mb-2">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">
                          Haftalık Özet
                        </span>
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {weekDays.map((day) => {
                          const dateStr = format(day, "yyyy-MM-dd");
                          const log = child.dailyLogs.find((l) => l.date === dateStr);
                          const isToday = format(today, "yyyy-MM-dd") === dateStr;
                          const isFuture = day > today;

                          return (
                            <div
                              key={dateStr}
                              className={cn(
                                "flex flex-col items-center p-2 rounded-lg",
                                isToday && "bg-primary/10 border border-primary/30",
                                isFuture && "opacity-40"
                              )}
                            >
                              <span className="text-xs text-muted-foreground mb-1">
                                {format(day, "EEE", { locale: tr }).slice(0, 2)}
                              </span>
                              <span
                                className={cn(
                                  "text-sm font-medium",
                                  isToday ? "text-primary" : "text-foreground"
                                )}
                              >
                                {format(day, "d")}
                              </span>
                              {log && !isFuture ? (
                                <div className="mt-1 w-2 h-2 rounded-full bg-primary" />
                              ) : !isFuture ? (
                                <div className="mt-1 w-2 h-2 rounded-full bg-muted/50" />
                              ) : (
                                <div className="mt-1 w-2 h-2" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Daily Log Details */}
                    {child.dailyLogs.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          Günlük Detaylar
                        </p>
                        <div className="space-y-2">
                          {child.dailyLogs
                            .sort((a, b) => b.date.localeCompare(a.date))
                            .slice(0, 3)
                            .map((log) => (
                              <div
                                key={log.date}
                                className="flex items-center justify-between bg-muted/20 rounded-lg p-3"
                              >
                                <span className="text-sm text-foreground">
                                  {format(new Date(log.date), "d MMMM EEEE", { locale: tr })}
                                </span>
                                <div className="flex items-center gap-3 text-sm">
                                  <span className="text-muted-foreground">
                                    📖 {log.quranPages}
                                  </span>
                                  <span className="text-muted-foreground">
                                    🕌 {log.farzPrayers}/5
                                  </span>
                                  <span className="text-muted-foreground">
                                    📿 {log.dhikrTotal}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Back to Child Dashboard (if also a child) */}
        {userRole === "admin" && (
          <div className="mt-6 px-6">
            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="w-full h-12 rounded-2xl border-border/50 text-foreground hover:bg-foreground/5"
            >
              Çocuk Paneline Git
            </Button>
          </div>
        )}
        {/* Create Child Modal */}
        {user && (
          <CreateChildModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => fetchLinkedChildren()}
            parentId={user.id}
          />
        )}
      </div>
    </AppBackground>
  );
}
