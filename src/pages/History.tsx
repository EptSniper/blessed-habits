import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Flame, Calendar as CalendarIcon } from "lucide-react";
import { AppBackground } from "@/components/ui/AppBackground";
import { BottomNav } from "@/components/ui/BottomNav";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export default function History() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [stats, setStats] = useState({ completedDays: 0, longestStreak: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const monthName = currentDate.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchMonthLogs();
    }
  }, [user, currentDate]);

  const fetchMonthLogs = async () => {
    if (!user) return;

    try {
      const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${daysInMonth}`;

      const { data, error } = await supabase
        .from("daily_logs")
        .select("log_date")
        .eq("child_id", user.id)
        .gte("log_date", startDate)
        .lte("log_date", endDate);

      if (error) {
        console.error("Error fetching logs:", error);
        return;
      }

      if (data) {
        const days = data.map((log) => new Date(log.log_date).getDate());
        setCompletedDays(days);
      }

      // Fetch all-time stats
      const { data: allLogs } = await supabase
        .from("daily_logs")
        .select("log_date")
        .eq("child_id", user.id)
        .order("log_date", { ascending: false });

      if (allLogs) {
        const totalDays = allLogs.length;

        // Calculate longest streak
        let longestStreak = 0;
        let currentStreak = 0;
        let prevDate: Date | null = null;

        const sortedDates = allLogs
          .map((l) => new Date(l.log_date))
          .sort((a, b) => a.getTime() - b.getTime());

        sortedDates.forEach((date) => {
          if (prevDate) {
            const diffDays = Math.floor(
              (date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (diffDays === 1) {
              currentStreak++;
            } else {
              currentStreak = 1;
            }
          } else {
            currentStreak = 1;
          }
          longestStreak = Math.max(longestStreak, currentStreak);
          prevDate = date;
        });

        setStats({ completedDays: totalDays, longestStreak });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const weekDays = ["Pz", "Pt", "Sa", "Ça", "Pe", "Cu", "Ct"];

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isCompleted = (day: number) => completedDays.includes(day);

  if (authLoading || isLoading) {
    return (
      <AppBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppBackground>
    );
  }

  return (
    <AppBackground showStars>
      <div className="min-h-screen pb-24">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border/30">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">{t("history")}</h1>
            <div className="w-10" />
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6 space-y-6 animate-fade-in">
          {/* Calendar Card */}
          <div className="bg-card rounded-2xl border border-border/50 card-shadow overflow-hidden">
            {/* Month Navigation */}
            <div className="flex items-center justify-between p-4 border-b border-border/30">
              <button
                onClick={prevMonth}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-foreground capitalize">{monthName}</h2>
              <button
                onClick={nextMonth}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 px-4 pt-4">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 p-4">
              {/* Empty cells for days before start of month */}
              {Array.from({ length: startingDayOfWeek }, (_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Days of month */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const completed = isCompleted(day);
                const isTodayDay = isToday(day);

                return (
                  <button
                    key={day}
                    className={cn(
                      "aspect-square rounded-full flex items-center justify-center text-sm font-medium",
                      "transition-all duration-150 active:scale-95",
                      completed && "relative",
                      isTodayDay
                        ? "ring-2 ring-accent ring-offset-2 ring-offset-card text-accent"
                        : completed
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {day}
                    {completed && (
                      <span
                        className={cn(
                          "absolute bottom-1 w-1.5 h-1.5 rounded-full",
                          isTodayDay ? "bg-accent" : "bg-primary shadow-glow"
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card rounded-2xl p-5 border border-border/50 card-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{stats.completedDays}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("completedDays")}</p>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border/50 card-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-accent" />
                </div>
              </div>
              <p className="text-3xl font-bold text-accent">{stats.longestStreak}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("longestStreak")}</p>
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    </AppBackground>
  );
}
