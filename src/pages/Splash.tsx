import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBackground } from "@/components/ui/AppBackground";

export default function Splash() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => {
        navigate("/login");
      }, 300);
    }, 1800);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AppBackground showStars showMosque>
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        {/* Logo with glow */}
        <div className={`relative transition-all duration-500 ${isLoading ? 'scale-100 opacity-100' : 'scale-110 opacity-0'}`}>
          {/* Outer glow ring */}
          <div className="absolute inset-0 -m-4 rounded-full bg-primary/10 animate-pulse-ring" />
          <div className="absolute inset-0 -m-8 rounded-full bg-primary/5 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
          
          {/* Main logo circle */}
          <div className="relative w-28 h-28 rounded-full gradient-primary flex items-center justify-center shadow-glow-lg">
            {/* Crescent and Star */}
            <svg viewBox="0 0 48 48" className="w-14 h-14 text-primary-foreground">
              <path
                fill="currentColor"
                d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20c1.73 0 3.4-.22 5-.64-8.64-2.17-15-10.04-15-19.36s6.36-17.19 15-19.36c-1.6-.42-3.27-.64-5-.64z"
              />
              <circle fill="currentColor" cx="36" cy="14" r="3" />
            </svg>
          </div>
        </div>

        {/* App name */}
        <div className={`mt-8 text-center transition-all duration-500 delay-150 ${isLoading ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            TCC İslami Çetele
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Turkish Community Center
          </p>
        </div>

        {/* Loading indicator */}
        <div className={`mt-12 transition-all duration-500 delay-300 ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-8 h-1 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-shimmer" style={{ width: '50%', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)' }} />
          </div>
        </div>
      </div>
    </AppBackground>
  );
}
