import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Flame, Calendar as CalendarIcon } from "lucide-react";
import { AppBackground } from "@/components/ui/AppBackground";
import { BottomNav } from "@/components/ui/BottomNav";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

// Mock data
const mockCompletedDays = [3, 5, 6, 7, 10, 11, 12, 15, 18, 19, 20, 21, 22, 25, 26, 27, 28];
const mockStats = {
  completedDays: 17,
  longestStreak: 5,
};

export default function History() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const monthName = currentDate.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const weekDays = ["Pz", "Pt", "Sa", "Ça", "Pe", "Cu", "Ct"];

  const isToday = (day: number) => {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const isCompleted = (day: number) => mockCompletedDays.includes(day);

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
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
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
                      <span className={cn(
                        "absolute bottom-1 w-1.5 h-1.5 rounded-full",
                        isTodayDay ? "bg-accent" : "bg-primary shadow-glow"
                      )} />
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
              <p className="text-3xl font-bold text-foreground">{mockStats.completedDays}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("completedDays")}</p>
            </div>
            
            <div className="bg-card rounded-2xl p-5 border border-border/50 card-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-accent" />
                </div>
              </div>
              <p className="text-3xl font-bold text-accent">{mockStats.longestStreak}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("longestStreak")}</p>
            </div>
          </div>

          {/* Recent Logs - Placeholder */}
          <div className="bg-card rounded-2xl border border-border/50 card-shadow overflow-hidden">
            <div className="p-4 border-b border-border/30">
              <h3 className="font-semibold text-foreground">Son Kayıtlar</h3>
            </div>
            <div className="p-4 text-center text-muted-foreground text-sm">
              Kayıtlarınız burada görünecek
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    </AppBackground>
  );
}
