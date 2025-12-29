import { Clock, Check } from "lucide-react";
import { TogglePill } from "./TogglePill";
import { cn } from "@/lib/utils";

interface PrayerRowProps {
  name: string;
  arabicName?: string;
  farz: boolean;
  onFarzChange: (value: boolean) => void;
  sunnah: boolean;
  onSunnahChange: (value: boolean) => void;
  onTime?: boolean;
  onOnTimeChange?: (value: boolean) => void;
  showOnTime?: boolean;
  className?: string;
}

export function PrayerRow({
  name,
  arabicName,
  farz,
  onFarzChange,
  sunnah,
  onSunnahChange,
  onTime,
  onOnTimeChange,
  showOnTime = true,
  className,
}: PrayerRowProps) {
  const isComplete = farz && sunnah;

  return (
    <div className={cn(
      "flex items-center justify-between py-3 border-b border-border/30 last:border-0",
      className
    )}>
      <div className="flex items-center gap-2">
        {/* Completion indicator */}
        <div className={cn(
          "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200",
          isComplete
            ? "bg-primary/20"
            : farz
            ? "bg-primary/10"
            : "bg-muted/30"
        )}>
          {farz && (
            <Check className={cn(
              "w-3 h-3 transition-all duration-200",
              isComplete ? "text-primary" : "text-primary/60"
            )} />
          )}
        </div>

        {/* Prayer name */}
        <div>
          <p className={cn(
            "text-sm font-medium transition-colors duration-200",
            farz ? "text-foreground" : "text-muted-foreground"
          )}>
            {name}
          </p>
          {arabicName && (
            <p className="text-xs font-arabic text-muted-foreground/60">{arabicName}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <TogglePill
          checked={farz}
          onChange={onFarzChange}
          label="Farz"
          size="sm"
        />
        <TogglePill
          checked={sunnah}
          onChange={onSunnahChange}
          label="Sunnah"
          size="sm"
        />
        {showOnTime && onOnTimeChange && (
          <button
            type="button"
            onClick={() => onOnTimeChange(!onTime)}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              "transition-all duration-150 active:scale-95",
              onTime
                ? "bg-accent/15 text-accent"
                : "bg-secondary/50 text-muted-foreground"
            )}
            title="On time"
          >
            <Clock className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
