import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Flame, Star, ChevronRight, Check, LogOut } from "lucide-react";
import { AppBackground } from "@/components/ui/AppBackground";
import { BottomNav } from "@/components/ui/BottomNav";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { MetricTile } from "@/components/ui/MetricTile";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface DashboardStats {
  streak: number;
  quranPagesThisWeek: number;
  prayerCompletion: number;
  todayLog: {
    hasQuran: boolean;
    prayerCount: number;
    hasDhikr: boolean;
  } | null;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, profile, userRole, signOut, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    streak: 0,
    quranPagesThisWeek: 0,
    prayerCompletion: 0,
    todayLog: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Show parent dashboard link for parents
  const isParent = userRole === "parent" || userRole === "admin";

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      // Fetch today's log
      const { data: todayData } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("child_id", user.id)
        .eq("log_date", today)
        .maybeSingle();

      // Fetch this week's logs
      const { data: weekLogs } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("child_id", user.id)
        .gte("log_date", weekAgo)
        .lte("log_date", today);

      // Calculate stats
      let quranPagesThisWeek = 0;
      let totalFarz = 0;
      let totalPrayerDays = 0;

      if (weekLogs) {
        weekLogs.forEach((log) => {
          quranPagesThisWeek += log.quran_pages || 0;
          const farzCount =
            (log.prayer_fajr_farz ? 1 : 0) +
            (log.prayer_dhuhr_farz ? 1 : 0) +
            (log.prayer_asr_farz ? 1 : 0) +
            (log.prayer_maghrib_farz ? 1 : 0) +
            (log.prayer_isha_farz ? 1 : 0);
          totalFarz += farzCount;
          totalPrayerDays++;
        });
      }

      const prayerCompletion = totalPrayerDays > 0 
        ? Math.round((totalFarz / (totalPrayerDays * 5)) * 100) 
        : 0;

      // Calculate streak
      const { data: allLogs } = await supabase
        .from("daily_logs")
        .select("log_date")
        .eq("child_id", user.id)
        .order("log_date", { ascending: false })
        .limit(30);

      let streak = 0;
      if (allLogs && allLogs.length > 0) {
        const dates = allLogs.map(l => l.log_date);
        const todayDate = new Date(today);
        
        for (let i = 0; i < 30; i++) {
          const checkDate = new Date(todayDate);
          checkDate.setDate(checkDate.getDate() - i);
          const checkDateStr = checkDate.toISOString().split("T")[0];
          
          if (dates.includes(checkDateStr)) {
            streak++;
          } else if (i > 0) { // Allow today to not be logged yet
            break;
          }
        }
      }

      // Today's checklist
      let todayLog = null;
      if (todayData) {
        const prayerCount =
          (todayData.prayer_fajr_farz ? 1 : 0) +
          (todayData.prayer_dhuhr_farz ? 1 : 0) +
          (todayData.prayer_asr_farz ? 1 : 0) +
          (todayData.prayer_maghrib_farz ? 1 : 0) +
          (todayData.prayer_isha_farz ? 1 : 0);

        const hasDhikr =
          (todayData.dhikr_subhan_allah || 0) +
          (todayData.dhikr_alhamdulillah || 0) +
          (todayData.dhikr_allahu_akbar || 0) +
          (todayData.dhikr_salawat || 0) > 0;

        todayLog = {
          hasQuran: (todayData.quran_pages || 0) > 0,
          prayerCount,
          hasDhikr,
        };
      }

      setStats({
        streak,
        quranPagesThisWeek,
        prayerCompletion,
        todayLog,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
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
  const formattedDate = today.toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const displayName = profile?.first_name || user?.email?.split("@")[0] || "Kullanıcı";

  const todayChecklist = [
    {
      id: "quran",
      label: t("quran"),
      status: stats.todayLog?.hasQuran ? "done" : "pending",
    },
    {
      id: "prayers",
      label: t("prayers"),
      status: stats.todayLog?.prayerCount === 5 ? "done" : stats.todayLog?.prayerCount ? "partial" : "pending",
      detail: stats.todayLog?.prayerCount ? `${stats.todayLog.prayerCount}/5` : undefined,
    },
    {
      id: "dhikr",
      label: t("dhikr"),
      status: stats.todayLog?.hasDhikr ? "done" : "pending",
    },
  ];

  return (
    <AppBackground showStars>
      <div className="min-h-screen pb-24">
        {/* Header */}
        <div className="relative px-6 pt-12 pb-8">
          {/* Decorative gradient */}
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

          <div className="relative animate-fade-in flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{t("assalamuAlaikum")},</p>
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
        </div>

        {/* Metrics Row */}
        <div className="px-6 grid grid-cols-3 gap-3">
          <MetricTile
            icon={<Flame className="w-5 h-5" />}
            value={stats.streak}
            label={t("streak")}
            color="gold"
            highlight
            delay={0}
          />
          <MetricTile
            icon={<BookOpen className="w-5 h-5" />}
            value={stats.quranPagesThisWeek}
            label={t("pages")}
            color="green"
            delay={60}
          />
          <MetricTile
            icon={<Star className="w-5 h-5" />}
            value={`${stats.prayerCompletion}%`}
            label={t("prayerCompletion")}
            color="green"
            delay={120}
          />
        </div>

        {/* Prayer Progress Ring */}
        <div className="mt-6 px-6 animate-fade-in stagger-2">
          <div className="bg-card rounded-2xl p-6 border border-border/50 card-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{t("prayerCompletion")}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t("thisWeek")}</p>
              </div>
              <ProgressRing
                progress={stats.prayerCompletion}
                size={90}
                strokeWidth={8}
                color="green"
              />
            </div>
          </div>
        </div>

        {/* Today's Checklist */}
        <div className="mt-6 px-6 animate-fade-in stagger-3">
          <div className="bg-card rounded-2xl border border-border/50 card-shadow overflow-hidden">
            <div className="p-4 border-b border-border/30">
              <h3 className="font-semibold text-foreground">{t("todaysChecklist")}</h3>
            </div>
            <div className="divide-y divide-border/30">
              {todayChecklist.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate("/daily-log")}
                  className="w-full flex items-center justify-between p-4 hover:bg-foreground/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        item.status === "done"
                          ? "bg-primary/20 text-primary"
                          : item.status === "partial"
                          ? "bg-accent/20 text-accent"
                          : "bg-muted/30 text-muted-foreground"
                      )}
                    >
                      {item.status === "done" ? (
                        <Check className="w-4 h-4" />
                      ) : item.status === "partial" ? (
                        <span className="text-xs font-medium">{item.detail}</span>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-current" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "font-medium",
                        item.status === "done" ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 px-6 space-y-3 animate-fade-in stagger-4">
          <Button
            onClick={() => navigate("/daily-log")}
            className="w-full h-14 rounded-2xl gradient-primary text-primary-foreground font-semibold text-base shadow-glow hover:shadow-glow-lg transition-all duration-200 active:scale-[0.98]"
          >
            {t("logToday")}
          </Button>
          <Button
            onClick={() => navigate("/history")}
            variant="outline"
            className="w-full h-12 rounded-2xl border-border/50 text-foreground hover:bg-foreground/5 transition-all duration-200"
          >
            {t("viewHistory")}
          </Button>
          {isParent && (
            <Button
              onClick={() => navigate("/parent")}
              variant="outline"
              className="w-full h-12 rounded-2xl border-primary/30 text-primary hover:bg-primary/10 transition-all duration-200"
            >
              Veli Paneline Git
            </Button>
          )}
        </div>
      </div>

      <BottomNav />
    </AppBackground>
  );
}
