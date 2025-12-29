import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 999,
  label,
  sublabel,
  className,
}: StepperProps) {
  const decrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const increment = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      {(label || sublabel) && (
        <div className="flex-1 min-w-0">
          {label && <p className="text-sm font-medium text-foreground">{label}</p>}
          {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
        </div>
      )}
      
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            "bg-secondary border border-border/50",
            "transition-all duration-150 ease-tcc-standard",
            "active:scale-95 active:bg-secondary/80",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          )}
        >
          <Minus className="w-4 h-4" />
        </button>
        
        <span className="w-12 text-center text-xl font-semibold text-foreground tabular-nums">
          {value}
        </span>
        
        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            "bg-primary text-primary-foreground",
            "transition-all duration-150 ease-tcc-standard",
            "active:scale-95 shadow-glow",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          )}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
