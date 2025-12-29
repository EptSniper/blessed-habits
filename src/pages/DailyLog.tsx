import { useState } from "react";
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
import { cn } from "@/lib/utils";

export default function DailyLog() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showCelebration, setShowCelebration] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Form state
  const [quranPages, setQuranPages] = useState(0);
  const [showQuranDetails, setShowQuranDetails] = useState(false);
  const [quranSurah, setQuranSurah] = useState("");
  const [quranAyah, setQuranAyah] = useState("");
  const [quranNotes, setQuranNotes] = useState("");
  
  const [bookTitle, setBookTitle] = useState("");
  const [bookPages, setBookPages] = useState(0);

  const [prayers, setPrayers] = useState({
    fajr: { farz: false, sunnah: false, onTime: false },
    dhuhr: { farz: false, sunnah: false, onTime: false },
    asr: { farz: false, sunnah: false, onTime: false },
    maghrib: { farz: false, sunnah: false, onTime: false },
    isha: { farz: false, sunnah: false, onTime: false },
  });
  const [witr, setWitr] = useState(false);
  const [jumuah, setJumuah] = useState(false);

  const [dhikr, setDhikr] = useState({
    subhanAllah: 0,
    alhamdulillah: 0,
    allahuAkbar: 0,
    salawat: 0,
  });

  const [memorization, setMemorization] = useState("");
  const [review, setReview] = useState("");
  const [goodDeed, setGoodDeed] = useState("");

  const today = new Date();
  const formattedDate = today.toLocaleDateString("tr-TR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const isFriday = today.getDay() === 5;

  const updatePrayer = (prayer: keyof typeof prayers, field: 'farz' | 'sunnah' | 'onTime', value: boolean) => {
    setPrayers(prev => ({
      ...prev,
      [prayer]: { ...prev[prayer], [field]: value }
    }));
  };

  const handleSave = () => {
    setIsSaved(true);
    
    // Check if log is substantially complete
    const farzCount = Object.values(prayers).filter(p => p.farz).length;
    const hasDhikr = Object.values(dhikr).some(v => v > 0);
    
    if (farzCount >= 3 || quranPages > 0 || hasDhikr) {
      setShowCelebration(true);
    }

    // In real app, save to database here
    setTimeout(() => setIsSaved(false), 2000);
  };

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
            <button className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{formattedDate}</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-4 space-y-4 animate-fade-in">
          {/* Quran Section */}
          <SectionCard title={t("quran")} icon={BookOpen}>
            <Stepper
              value={quranPages}
              onChange={setQuranPages}
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
                  value={quranSurah}
                  onChange={(e) => setQuranSurah(e.target.value)}
                  className="bg-input border-border/50 rounded-xl"
                />
                <Input
                  placeholder={t("ayahRange")}
                  value={quranAyah}
                  onChange={(e) => setQuranAyah(e.target.value)}
                  className="bg-input border-border/50 rounded-xl"
                />
                <Textarea
                  placeholder={t("notes")}
                  value={quranNotes}
                  onChange={(e) => setQuranNotes(e.target.value)}
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
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              className="bg-input border-border/50 rounded-xl mb-4"
            />
            <Stepper
              value={bookPages}
              onChange={setBookPages}
              label={t("bookPages")}
            />
          </SectionCard>

          {/* Prayers */}
          <SectionCard title={t("prayers")} icon={Moon}>
            <div className="space-y-1">
              <PrayerRow
                name={t("fajr")}
                arabicName="الفجر"
                farz={prayers.fajr.farz}
                onFarzChange={(v) => updatePrayer('fajr', 'farz', v)}
                sunnah={prayers.fajr.sunnah}
                onSunnahChange={(v) => updatePrayer('fajr', 'sunnah', v)}
                onTime={prayers.fajr.onTime}
                onOnTimeChange={(v) => updatePrayer('fajr', 'onTime', v)}
              />
              <PrayerRow
                name={t("dhuhr")}
                arabicName="الظهر"
                farz={prayers.dhuhr.farz}
                onFarzChange={(v) => updatePrayer('dhuhr', 'farz', v)}
                sunnah={prayers.dhuhr.sunnah}
                onSunnahChange={(v) => updatePrayer('dhuhr', 'sunnah', v)}
                onTime={prayers.dhuhr.onTime}
                onOnTimeChange={(v) => updatePrayer('dhuhr', 'onTime', v)}
              />
              <PrayerRow
                name={t("asr")}
                arabicName="العصر"
                farz={prayers.asr.farz}
                onFarzChange={(v) => updatePrayer('asr', 'farz', v)}
                sunnah={prayers.asr.sunnah}
                onSunnahChange={(v) => updatePrayer('asr', 'sunnah', v)}
                onTime={prayers.asr.onTime}
                onOnTimeChange={(v) => updatePrayer('asr', 'onTime', v)}
              />
              <PrayerRow
                name={t("maghrib")}
                arabicName="المغرب"
                farz={prayers.maghrib.farz}
                onFarzChange={(v) => updatePrayer('maghrib', 'farz', v)}
                sunnah={prayers.maghrib.sunnah}
                onSunnahChange={(v) => updatePrayer('maghrib', 'sunnah', v)}
                onTime={prayers.maghrib.onTime}
                onOnTimeChange={(v) => updatePrayer('maghrib', 'onTime', v)}
              />
              <PrayerRow
                name={t("isha")}
                arabicName="العشاء"
                farz={prayers.isha.farz}
                onFarzChange={(v) => updatePrayer('isha', 'farz', v)}
                sunnah={prayers.isha.sunnah}
                onSunnahChange={(v) => updatePrayer('isha', 'sunnah', v)}
                onTime={prayers.isha.onTime}
                onOnTimeChange={(v) => updatePrayer('isha', 'onTime', v)}
              />
            </div>
            
            {/* Witr and Jumuah */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/30">
              <TogglePill
                checked={witr}
                onChange={setWitr}
                label={t("witr")}
              />
              {isFriday && (
                <TogglePill
                  checked={jumuah}
                  onChange={setJumuah}
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
                value={dhikr.subhanAllah}
                onChange={(v) => setDhikr(prev => ({ ...prev, subhanAllah: v }))}
              />
              <DhikrCounter
                label={t("alhamdulillah")}
                arabicLabel="الْحَمْدُ لِلَّه"
                value={dhikr.alhamdulillah}
                onChange={(v) => setDhikr(prev => ({ ...prev, alhamdulillah: v }))}
              />
              <DhikrCounter
                label={t("allahuAkbar")}
                arabicLabel="اللَّهُ أَكْبَر"
                value={dhikr.allahuAkbar}
                onChange={(v) => setDhikr(prev => ({ ...prev, allahuAkbar: v }))}
              />
              <DhikrCounter
                label={t("salawat")}
                arabicLabel="صَلَوَات"
                value={dhikr.salawat}
                onChange={(v) => setDhikr(prev => ({ ...prev, salawat: v }))}
              />
            </div>
          </SectionCard>

          {/* Memorization & Review */}
          <SectionCard title={t("memorization")} icon={BookOpen} defaultOpen={false}>
            <div className="space-y-3">
              <Textarea
                placeholder={t("memorization")}
                value={memorization}
                onChange={(e) => setMemorization(e.target.value)}
                className="bg-input border-border/50 rounded-xl resize-none"
                rows={2}
              />
              <Textarea
                placeholder={t("review")}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="bg-input border-border/50 rounded-xl resize-none"
                rows={2}
              />
            </div>
          </SectionCard>

          {/* Good Deed */}
          <SectionCard title={t("goodDeed")} icon={Heart} defaultOpen={false}>
            <Textarea
              placeholder={t("goodDeed")}
              value={goodDeed}
              onChange={(e) => setGoodDeed(e.target.value)}
              className="bg-input border-border/50 rounded-xl resize-none"
              rows={2}
            />
          </SectionCard>
        </div>

        {/* Sticky Save Bar */}
        <div className="fixed bottom-16 left-0 right-0 z-30 px-4 py-4 bg-background/95 backdrop-blur-xl border-t border-border/30">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className={cn(
              "flex items-center gap-2 text-sm transition-all duration-200",
              isSaved ? "opacity-100" : "opacity-0"
            )}>
              <Check className="w-4 h-4 text-primary" />
              <span className="text-primary font-medium">{t("saved")}</span>
            </div>
            <Button
              onClick={handleSave}
              className="px-8 h-12 rounded-2xl gradient-primary text-primary-foreground font-semibold shadow-glow hover:shadow-glow-lg transition-all duration-200 active:scale-[0.98]"
            >
              {t("saveLog")}
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
