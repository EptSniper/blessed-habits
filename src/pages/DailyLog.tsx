import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Calendar, BookOpen, BookMarked, Moon, Sparkles, Heart, Check } from "lucide-react";
import { AppBackground } from "@/components/ui/AppBackground";
import { BottomNav } from "@/components/ui/BottomNav";
import { SectionCard } from "@/components/ui/SectionCard";
import { Stepper } from "@/components/ui/Stepper";
import { PrayerRow } from "@/components/ui/PrayerRow";
import { DhikrCounter } from "@/components/ui/DhikrCounter";
import { TogglePill } from "@/components/ui/TogglePill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CelebrationToast } from "@/components/CelebrationToast";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DailyLogData {
  quran_pages: number;
  quran_surah: string;
  quran_ayah_range: string;
  quran_notes: string;
  book_title: string;
  book_pages: number;
  prayer_fajr_farz: boolean;
  prayer_fajr_sunnah: boolean;
  prayer_fajr_on_time: boolean;
  prayer_dhuhr_farz: boolean;
  prayer_dhuhr_sunnah: boolean;
  prayer_dhuhr_on_time: boolean;
  prayer_asr_farz: boolean;
  prayer_asr_sunnah: boolean;
  prayer_asr_on_time: boolean;
  prayer_maghrib_farz: boolean;
  prayer_maghrib_sunnah: boolean;
  prayer_maghrib_on_time: boolean;
  prayer_isha_farz: boolean;
  prayer_isha_sunnah: boolean;
  prayer_isha_on_time: boolean;
  witr: boolean;
  jumuah: boolean;
  dhikr_subhan_allah: number;
  dhikr_alhamdulillah: number;
  dhikr_allahu_akbar: number;
  dhikr_salawat: number;
  dhikr_other_label: string;
  dhikr_other_count: number;
  memorization_details: string;
  review_details: string;
  good_deed: string;
}

const initialLogData: DailyLogData = {
  quran_pages: 0,
  quran_surah: "",
  quran_ayah_range: "",
  quran_notes: "",
  book_title: "",
  book_pages: 0,
  prayer_fajr_farz: false,
  prayer_fajr_sunnah: false,
  prayer_fajr_on_time: false,
  prayer_dhuhr_farz: false,
  prayer_dhuhr_sunnah: false,
  prayer_dhuhr_on_time: false,
  prayer_asr_farz: false,
  prayer_asr_sunnah: false,
  prayer_asr_on_time: false,
  prayer_maghrib_farz: false,
  prayer_maghrib_sunnah: false,
  prayer_maghrib_on_time: false,
  prayer_isha_farz: false,
  prayer_isha_sunnah: false,
  prayer_isha_on_time: false,
  witr: false,
  jumuah: false,
  dhikr_subhan_allah: 0,
  dhikr_alhamdulillah: 0,
  dhikr_allahu_akbar: 0,
  dhikr_salawat: 0,
  dhikr_other_label: "",
  dhikr_other_count: 0,
  memorization_details: "",
  review_details: "",
  good_deed: "",
};

export default function DailyLog() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const [showCelebration, setShowCelebration] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [existingLogId, setExistingLogId] = useState<string | null>(null);
  const [showQuranDetails, setShowQuranDetails] = useState(false);
  const [logData, setLogData] = useState<DailyLogData>(initialLogData);

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const isFriday = today.getDay() === 5;

  const formattedDate = today.toLocaleDateString("tr-TR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchTodayLog();
    }
  }, [user]);

  const fetchTodayLog = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("child_id", user.id)
        .eq("log_date", todayStr)
        .maybeSingle();

      if (error) {
        console.error("Error fetching log:", error);
        return;
      }

      if (data) {
        setExistingLogId(data.id);
        setLogData({
          quran_pages: data.quran_pages || 0,
          quran_surah: data.quran_surah || "",
          quran_ayah_range: data.quran_ayah_range || "",
          quran_notes: data.quran_notes || "",
          book_title: data.book_title || "",
          book_pages: data.book_pages || 0,
          prayer_fajr_farz: data.prayer_fajr_farz || false,
          prayer_fajr_sunnah: data.prayer_fajr_sunnah || false,
          prayer_fajr_on_time: data.prayer_fajr_on_time || false,
          prayer_dhuhr_farz: data.prayer_dhuhr_farz || false,
          prayer_dhuhr_sunnah: data.prayer_dhuhr_sunnah || false,
          prayer_dhuhr_on_time: data.prayer_dhuhr_on_time || false,
          prayer_asr_farz: data.prayer_asr_farz || false,
          prayer_asr_sunnah: data.prayer_asr_sunnah || false,
          prayer_asr_on_time: data.prayer_asr_on_time || false,
          prayer_maghrib_farz: data.prayer_maghrib_farz || false,
          prayer_maghrib_sunnah: data.prayer_maghrib_sunnah || false,
          prayer_maghrib_on_time: data.prayer_maghrib_on_time || false,
          prayer_isha_farz: data.prayer_isha_farz || false,
          prayer_isha_sunnah: data.prayer_isha_sunnah || false,
          prayer_isha_on_time: data.prayer_isha_on_time || false,
          witr: data.witr || false,
          jumuah: data.jumuah || false,
          dhikr_subhan_allah: data.dhikr_subhan_allah || 0,
          dhikr_alhamdulillah: data.dhikr_alhamdulillah || 0,
          dhikr_allahu_akbar: data.dhikr_allahu_akbar || 0,
          dhikr_salawat: data.dhikr_salawat || 0,
          dhikr_other_label: data.dhikr_other_label || "",
          dhikr_other_count: data.dhikr_other_count || 0,
          memorization_details: data.memorization_details || "",
          review_details: data.review_details || "",
          good_deed: data.good_deed || "",
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const updateLogData = (field: keyof DailyLogData, value: any) => {
    setLogData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);

    try {
      const logPayload = {
        child_id: user.id,
        log_date: todayStr,
        ...logData,
      };

      if (existingLogId) {
        const { error } = await supabase
          .from("daily_logs")
          .update(logPayload)
          .eq("id", existingLogId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("daily_logs")
          .insert(logPayload)
          .select()
          .single();

        if (error) throw error;
        if (data) setExistingLogId(data.id);
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);

      // Check if log is substantially complete
      const farzCount = 
        (logData.prayer_fajr_farz ? 1 : 0) +
        (logData.prayer_dhuhr_farz ? 1 : 0) +
        (logData.prayer_asr_farz ? 1 : 0) +
        (logData.prayer_maghrib_farz ? 1 : 0) +
        (logData.prayer_isha_farz ? 1 : 0);

      const hasDhikr = 
        logData.dhikr_subhan_allah +
        logData.dhikr_alhamdulillah +
        logData.dhikr_allahu_akbar +
        logData.dhikr_salawat > 0;

      if (farzCount >= 3 || logData.quran_pages > 0 || hasDhikr) {
        setShowCelebration(true);
      }

      toast({
        title: "Kaydedildi!",
        description: "Günlük kaydınız başarıyla kaydedildi.",
      });
    } catch (error: any) {
      console.error("Error saving log:", error);
      toast({
        title: "Hata",
        description: "Kayıt sırasında bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <AppBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <div className="min-h-screen pb-32">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border/30">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">{t("dailyLog")}</h1>
            <div className="w-10" />
          </div>

          {/* Date Chip */}
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-sm font-medium text-foreground w-fit">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-4 space-y-4 animate-fade-in">
          {/* Quran Section */}
          <SectionCard title={t("quran")} icon={BookOpen}>
            <Stepper
              value={logData.quran_pages}
              onChange={(v) => updateLogData("quran_pages", v)}
              label={t("quranPages")}
            />

            <button
              onClick={() => setShowQuranDetails(!showQuranDetails)}
              className="mt-4 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              {showQuranDetails ? "- " : "+ "}{t("addDetails")}
            </button>

            {showQuranDetails && (
              <div className="mt-4 space-y-3 animate-fade-in">
                <Input
                  placeholder={t("surah")}
                  value={logData.quran_surah}
                  onChange={(e) => updateLogData("quran_surah", e.target.value)}
                  className="bg-input border-border/50 rounded-xl"
                />
                <Input
                  placeholder={t("ayahRange")}
                  value={logData.quran_ayah_range}
                  onChange={(e) => updateLogData("quran_ayah_range", e.target.value)}
                  className="bg-input border-border/50 rounded-xl"
                />
                <Textarea
                  placeholder={t("notes")}
                  value={logData.quran_notes}
                  onChange={(e) => updateLogData("quran_notes", e.target.value)}
                  className="bg-input border-border/50 rounded-xl resize-none"
                  rows={2}
                />
              </div>
            )}
          </SectionCard>

          {/* Islamic Book */}
          <SectionCard title={t("islamicBook")} icon={BookMarked}>
            <Input
              placeholder={t("bookTitle")}
              value={logData.book_title}
              onChange={(e) => updateLogData("book_title", e.target.value)}
              className="bg-input border-border/50 rounded-xl mb-4"
            />
            <Stepper
              value={logData.book_pages}
              onChange={(v) => updateLogData("book_pages", v)}
              label={t("bookPages")}
            />
          </SectionCard>

          {/* Prayers */}
          <SectionCard title={t("prayers")} icon={Moon}>
            <div className="space-y-1">
              <PrayerRow
                name={t("fajr")}
                arabicName="الفجر"
                farz={logData.prayer_fajr_farz}
                onFarzChange={(v) => updateLogData("prayer_fajr_farz", v)}
                sunnah={logData.prayer_fajr_sunnah}
                onSunnahChange={(v) => updateLogData("prayer_fajr_sunnah", v)}
                onTime={logData.prayer_fajr_on_time}
                onOnTimeChange={(v) => updateLogData("prayer_fajr_on_time", v)}
              />
              <PrayerRow
                name={t("dhuhr")}
                arabicName="الظهر"
                farz={logData.prayer_dhuhr_farz}
                onFarzChange={(v) => updateLogData("prayer_dhuhr_farz", v)}
                sunnah={logData.prayer_dhuhr_sunnah}
                onSunnahChange={(v) => updateLogData("prayer_dhuhr_sunnah", v)}
                onTime={logData.prayer_dhuhr_on_time}
                onOnTimeChange={(v) => updateLogData("prayer_dhuhr_on_time", v)}
              />
              <PrayerRow
                name={t("asr")}
                arabicName="العصر"
                farz={logData.prayer_asr_farz}
                onFarzChange={(v) => updateLogData("prayer_asr_farz", v)}
                sunnah={logData.prayer_asr_sunnah}
                onSunnahChange={(v) => updateLogData("prayer_asr_sunnah", v)}
                onTime={logData.prayer_asr_on_time}
                onOnTimeChange={(v) => updateLogData("prayer_asr_on_time", v)}
              />
              <PrayerRow
                name={t("maghrib")}
                arabicName="المغرب"
                farz={logData.prayer_maghrib_farz}
                onFarzChange={(v) => updateLogData("prayer_maghrib_farz", v)}
                sunnah={logData.prayer_maghrib_sunnah}
                onSunnahChange={(v) => updateLogData("prayer_maghrib_sunnah", v)}
                onTime={logData.prayer_maghrib_on_time}
                onOnTimeChange={(v) => updateLogData("prayer_maghrib_on_time", v)}
              />
              <PrayerRow
                name={t("isha")}
                arabicName="العشاء"
                farz={logData.prayer_isha_farz}
                onFarzChange={(v) => updateLogData("prayer_isha_farz", v)}
                sunnah={logData.prayer_isha_sunnah}
                onSunnahChange={(v) => updateLogData("prayer_isha_sunnah", v)}
                onTime={logData.prayer_isha_on_time}
                onOnTimeChange={(v) => updateLogData("prayer_isha_on_time", v)}
              />
            </div>

            {/* Witr and Jumuah */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/30">
              <TogglePill
                checked={logData.witr}
                onChange={(v) => updateLogData("witr", v)}
                label={t("witr")}
              />
              {isFriday && (
                <TogglePill
                  checked={logData.jumuah}
                  onChange={(v) => updateLogData("jumuah", v)}
                  label={t("jumuah")}
                />
              )}
            </div>
          </SectionCard>

          {/* Dhikr */}
          <SectionCard title={t("dhikr")} icon={Sparkles}>
            <div className="grid grid-cols-2 gap-3">
              <DhikrCounter
                label={t("subhanAllah")}
                arabicLabel="سُبْحَانَ اللَّه"
                value={logData.dhikr_subhan_allah}
                onChange={(v) => updateLogData("dhikr_subhan_allah", v)}
              />
              <DhikrCounter
                label={t("alhamdulillah")}
                arabicLabel="الْحَمْدُ لِلَّه"
                value={logData.dhikr_alhamdulillah}
                onChange={(v) => updateLogData("dhikr_alhamdulillah", v)}
              />
              <DhikrCounter
                label={t("allahuAkbar")}
                arabicLabel="اللَّهُ أَكْبَر"
                value={logData.dhikr_allahu_akbar}
                onChange={(v) => updateLogData("dhikr_allahu_akbar", v)}
              />
              <DhikrCounter
                label={t("salawat")}
                arabicLabel="صَلَوَات"
                value={logData.dhikr_salawat}
                onChange={(v) => updateLogData("dhikr_salawat", v)}
              />
            </div>
          </SectionCard>

          {/* Memorization & Review */}
          <SectionCard title={t("memorization")} icon={BookOpen} defaultOpen={false}>
            <div className="space-y-3">
              <Textarea
                placeholder={t("memorization")}
                value={logData.memorization_details}
                onChange={(e) => updateLogData("memorization_details", e.target.value)}
                className="bg-input border-border/50 rounded-xl resize-none"
                rows={2}
              />
              <Textarea
                placeholder={t("review")}
                value={logData.review_details}
                onChange={(e) => updateLogData("review_details", e.target.value)}
                className="bg-input border-border/50 rounded-xl resize-none"
                rows={2}
              />
            </div>
          </SectionCard>

          {/* Good Deed */}
          <SectionCard title={t("goodDeed")} icon={Heart} defaultOpen={false}>
            <Textarea
              placeholder={t("goodDeed")}
              value={logData.good_deed}
              onChange={(e) => updateLogData("good_deed", e.target.value)}
              className="bg-input border-border/50 rounded-xl resize-none"
              rows={2}
            />
          </SectionCard>
        </div>

        {/* Sticky Save Bar */}
        <div className="fixed bottom-16 left-0 right-0 z-30 px-4 py-4 bg-background/95 backdrop-blur-xl border-t border-border/30">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div
              className={cn(
                "flex items-center gap-2 text-sm transition-all duration-200",
                isSaved ? "opacity-100" : "opacity-0"
              )}
            >
              <Check className="w-4 h-4 text-primary" />
              <span className="text-primary font-medium">{t("saved")}</span>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 h-12 rounded-2xl gradient-primary text-primary-foreground font-semibold shadow-glow hover:shadow-glow-lg transition-all duration-200 active:scale-[0.98]"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                t("saveLog")
              )}
            </Button>
          </div>
        </div>

        <BottomNav />
      </div>

      <CelebrationToast
        show={showCelebration}
        onClose={() => setShowCelebration(false)}
        message={`${t("barakAllah")} 🌙`}
      />
    </AppBackground>
  );
}
