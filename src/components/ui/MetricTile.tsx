import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MetricTileProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  highlight?: boolean;
  color?: "green" | "gold" | "default";
  className?: string;
  delay?: number;
}

export function MetricTile({
  icon,
  value,
  label,
  highlight = false,
  color = "default",
  className,
  delay = 0,
}: MetricTileProps) {
  const colorStyles = {
    green: "ring-primary/20 shadow-glow",
    gold: "ring-accent/20 shadow-glow-gold",
    default: "",
  };

  return (
    <div
      className={cn(
        "relative bg-card rounded-2xl p-4 border border-border/50 card-shadow",
        "animate-fade-in",
        highlight && colorStyles[color],
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-foreground/[0.02] to-transparent pointer-events-none" />
      
      <div className="relative flex flex-col items-center text-center gap-2">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          color === "gold" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
        )}>
          {icon}
        </div>
        <div className="space-y-0.5">
          <p className={cn(
            "text-2xl font-semibold",
            color === "gold" ? "text-accent" : "text-foreground"
          )}>
            {value}
          </p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}
