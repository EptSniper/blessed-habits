import { ReactNode } from "react";

interface AppBackgroundProps {
  children: ReactNode;
  showStars?: boolean;
  showMosque?: boolean;
}

export function AppBackground({ children, showStars = true, showMosque = false }: AppBackgroundProps) {
  return (
    <div className="relative min-h-screen w-full gradient-bg overflow-hidden">
      {/* Stars and Crescent Pattern */}
      {showStars && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[60%] opacity-[0.04] animate-stars">
            {/* Stars */}
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-foreground"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 60}%`,
                  opacity: 0.3 + Math.random() * 0.7,
                  transform: `scale(${0.5 + Math.random() * 1})`,
                }}
              />
            ))}
            {/* Crescent Moon */}
            <div className="absolute top-[15%] right-[15%] w-12 h-12 opacity-60">
              <svg viewBox="0 0 24 24" fill="currentColor" className="text-accent/30">
                <path d="M12 3a9 9 0 0 0 0 18c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-4.42-4.03-8-9-8Z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Mosque Silhouette */}
      {showMosque && (
        <div className="absolute bottom-0 left-0 right-0 h-32 opacity-[0.03] pointer-events-none">
          <svg viewBox="0 0 400 100" preserveAspectRatio="xMidYMax slice" className="w-full h-full">
            <path
              d="M0 100 L0 60 Q50 40 100 60 L100 40 Q120 20 140 40 L140 60 Q160 50 180 60 L180 35 Q200 10 220 35 L220 60 Q240 50 260 60 L260 40 Q280 20 300 40 L300 60 Q350 40 400 60 L400 100 Z"
              fill="currentColor"
              className="text-foreground"
            />
          </svg>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
