import { cn } from "@/lib/utils";

interface TogglePillProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  size?: "sm" | "md";
  className?: string;
}

export function TogglePill({
  checked,
  onChange,
  label,
  size = "md",
  className,
}: TogglePillProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "rounded-full border font-medium transition-all duration-160 ease-tcc-enter",
        "active:scale-95",
        size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm",
        checked
          ? "bg-primary/15 border-primary/40 text-primary shadow-glow"
          : "bg-secondary border-border/50 text-muted-foreground hover:text-foreground hover:border-border",
        className
      )}
    >
      {label}
    </button>
  );
}
