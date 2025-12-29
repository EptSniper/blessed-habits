import { useNavigate } from "react-router-dom";
import { BookOpen, Flame, Star, ChevronRight, Check } from "lucide-react";
import { AppBackground } from "@/components/ui/AppBackground";
import { BottomNav } from "@/components/ui/BottomNav";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { MetricTile } from "@/components/ui/MetricTile";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

// Mock data - will be replaced with real data
const mockData = {
  name: "Ahmed",
  streak: 7,
  quranPagesThisWeek: 12,
  prayerCompletion: 85,
  todayChecklist: [
    { id: "quran", label: "Kur'an", status: "done" },
    { id: "prayers", label: "Namazlar", status: "partial", detail: "3/5" },
    { id: "dhikr", label: "Zikir", status: "pending" },
  ],
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const today = new Date();
  const formattedDate = today.toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <AppBackground showStars>
      <div className="min-h-screen pb-24">
        {/* Header */}
        <div className="relative px-6 pt-12 pb-8">
          {/* Decorative gradient */}
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          
          <div className="relative animate-fade-in">
            <p className="text-muted-foreground text-sm">{t("assalamuAlaikum")},</p>
            <h1 className="text-3xl font-bold text-foreground mt-1">{mockData.name}</h1>
            <p className="text-sm text-muted-foreground mt-2 capitalize">{formattedDate}</p>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="px-6 grid grid-cols-3 gap-3">
          <MetricTile
            icon={<Flame className="w-5 h-5" />}
            value={mockData.streak}
            label={t("streak")}
            color="gold"
            highlight
            delay={0}
          />
          <MetricTile
            icon={<BookOpen className="w-5 h-5" />}
            value={mockData.quranPagesThisWeek}
            label={t("pages")}
            color="green"
            delay={60}
          />
          <MetricTile
            icon={<Star className="w-5 h-5" />}
            value={`${mockData.prayerCompletion}%`}
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
                progress={mockData.prayerCompletion}
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
              {mockData.todayChecklist.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate("/daily-log")}
                  className="w-full flex items-center justify-between p-4 hover:bg-foreground/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      item.status === "done"
                        ? "bg-primary/20 text-primary"
                        : item.status === "partial"
                        ? "bg-accent/20 text-accent"
                        : "bg-muted/30 text-muted-foreground"
                    )}>
                      {item.status === "done" ? (
                        <Check className="w-4 h-4" />
                      ) : item.status === "partial" ? (
                        <span className="text-xs font-medium">{item.detail}</span>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-current" />
                      )}
                    </div>
                    <span className={cn(
                      "font-medium",
                      item.status === "done" ? "text-foreground" : "text-muted-foreground"
                    )}>
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
        </div>
      </div>

      <BottomNav />
    </AppBackground>
  );
}
