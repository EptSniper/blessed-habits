import { createContext, useContext, useState, ReactNode } from "react";

type Language = "tr" | "en";

interface Translations {
  [key: string]: {
    tr: string;
    en: string;
  };
}

const translations: Translations = {
  // Common
  welcome: { tr: "Hoş geldiniz", en: "Welcome" },
  welcomeBack: { tr: "Tekrar hoş geldiniz", en: "Welcome back" },
  signIn: { tr: "Giriş Yap", en: "Sign In" },
  signUp: { tr: "Kayıt Ol", en: "Sign Up" },
  forgotPassword: { tr: "Şifremi unuttum", en: "Forgot password" },
  username: { tr: "Kullanıcı Adı", en: "Username" },
  password: { tr: "Şifre", en: "Password" },
  save: { tr: "Kaydet", en: "Save" },
  saved: { tr: "Kaydedildi", en: "Saved" },
  cancel: { tr: "İptal", en: "Cancel" },
  
  // Dashboard
  assalamuAlaikum: { tr: "Es-Selâmu Aleyküm", en: "Assalamu Alaikum" },
  dashboard: { tr: "Ana Sayfa", en: "Dashboard" },
  dailyLog: { tr: "Günlük Kayıt", en: "Daily Log" },
  history: { tr: "Geçmiş", en: "History" },
  streak: { tr: "Seri", en: "Streak" },
  days: { tr: "gün", en: "days" },
  thisWeek: { tr: "Bu Hafta", en: "This Week" },
  pages: { tr: "sayfa", en: "pages" },
  prayerCompletion: { tr: "Namaz", en: "Prayer" },
  todaysChecklist: { tr: "Bugünün Kontrol Listesi", en: "Today's Checklist" },
  logToday: { tr: "Bugünü Kaydet", en: "Log Today" },
  viewHistory: { tr: "Geçmişi Gör", en: "View History" },
  
  // Daily Log
  quran: { tr: "Kur'an", en: "Quran" },
  quranPages: { tr: "Kur'an Sayfası", en: "Quran Pages" },
  addDetails: { tr: "Detay Ekle", en: "Add Details" },
  surah: { tr: "Sure", en: "Surah" },
  ayahRange: { tr: "Ayet Aralığı", en: "Ayah Range" },
  notes: { tr: "Notlar", en: "Notes" },
  islamicBook: { tr: "İslami Kitap", en: "Islamic Book" },
  bookTitle: { tr: "Kitap Adı", en: "Book Title" },
  bookPages: { tr: "Sayfa", en: "Pages" },
  prayers: { tr: "Namazlar", en: "Prayers" },
  fajr: { tr: "Sabah", en: "Fajr" },
  dhuhr: { tr: "Öğle", en: "Dhuhr" },
  asr: { tr: "İkindi", en: "Asr" },
  maghrib: { tr: "Akşam", en: "Maghrib" },
  isha: { tr: "Yatsı", en: "Isha" },
  witr: { tr: "Vitir", en: "Witr" },
  jumuah: { tr: "Cuma", en: "Jumuah" },
  dhikr: { tr: "Zikir", en: "Dhikr" },
  subhanAllah: { tr: "Sübhanallah", en: "SubhanAllah" },
  alhamdulillah: { tr: "Elhamdülillah", en: "Alhamdulillah" },
  allahuAkbar: { tr: "Allahu Ekber", en: "Allahu Akbar" },
  salawat: { tr: "Salavat", en: "Salawat" },
  memorization: { tr: "Ezberleme", en: "Memorization" },
  review: { tr: "Tekrar", en: "Review" },
  goodDeed: { tr: "İyi Amel", en: "Good Deed" },
  saveLog: { tr: "Kaydı Kaydet", en: "Save Log" },
  
  // History
  completedDays: { tr: "Tamamlanan Günler", en: "Completed Days" },
  longestStreak: { tr: "En Uzun Seri", en: "Longest Streak" },
  viewFullLog: { tr: "Tam Kaydı Gör", en: "View Full Log" },
  
  // Bismillah
  bismillah: { tr: "Bismillahirrahmanirrahim", en: "In the name of Allah, the Most Gracious, the Most Merciful" },
  bismillahArabic: { tr: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", en: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" },
  
  // Encouragement
  barakAllah: { tr: "BarakAllahu Feek", en: "BarakAllahu Feek" },
  greatJob: { tr: "Harika iş!", en: "Great job!" },
  keepGoing: { tr: "Devam et!", en: "Keep going!" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("tr");

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
