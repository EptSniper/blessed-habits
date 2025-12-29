import { Plus, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DhikrCounterProps {
  label: string;
  arabicLabel?: string;
  value: number;
  onChange: (value: number) => void;
  milestone?: number;
  className?: string;
}

export function DhikrCounter({
  label,
  arabicLabel,
  value,
  onChange,
  milestone = 33,
  className,
}: DhikrCounterProps) {
  const [showSparkle, setShowSparkle] = useState(false);

  useEffect(() => {
    if (value > 0 && value % milestone === 0) {
      setShowSparkle(true);
      const timer = setTimeout(() => setShowSparkle(false), 320);
      return () => clearTimeout(timer);
    }
  }, [value, milestone]);

  const increment = () => {
    onChange(value + 1);
  };

  const reset = () => {
    onChange(0);
  };

  return (
    <div className={cn(
      "relative bg-card rounded-2xl p-4 border border-border/50",
      "flex flex-col items-center gap-3",
      className
    )}>
      {/* Sparkle effect */}
      {showSparkle && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-accent rounded-full animate-sparkle"
              style={{
                left: `${30 + Math.random() * 40}%`,
                top: `${20 + Math.random() * 40}%`,
                animationDelay: `${i * 50}ms`,
              }}
            />
          ))}
        </div>
      )}

      {/* Label */}
      <div className="text-center">
        {arabicLabel && (
          <p className="font-arabic text-base text-accent mb-0.5">{arabicLabel}</p>
        )}
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>

      {/* Counter */}
      <div className="relative">
        <span className={cn(
          "text-3xl font-semibold tabular-nums transition-all duration-150",
          value > 0 ? "text-foreground" : "text-muted-foreground"
        )}>
          {value}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            "bg-secondary/50 text-muted-foreground",
            "transition-all duration-150 active:scale-95",
            value === 0 && "opacity-30"
          )}
          disabled={value === 0}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        
        <button
          type="button"
          onClick={increment}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            "gradient-primary text-primary-foreground shadow-glow",
            "transition-all duration-150 active:scale-95"
          )}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Milestone indicator */}
      <p className="text-[10px] text-muted-foreground/60">
        {Math.floor(value / milestone)} × {milestone}
      </p>
    </div>
  );
}
