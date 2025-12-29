import { ChevronDown, LucideIcon } from "lucide-react";
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function SectionCard({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
  className,
}: SectionCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn(
      "bg-card rounded-2xl border border-border/50 overflow-hidden card-shadow",
      className
    )}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-foreground/[0.02] to-transparent pointer-events-none" />

      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full flex items-center justify-between p-4 hover:bg-foreground/[0.02] transition-colors duration-150"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-foreground">{title}</span>
        </div>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-muted-foreground transition-transform duration-220 ease-tcc-enter",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Content */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-260 ease-tcc-enter",
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="relative px-4 pb-4 pt-0">
          {children}
        </div>
      </div>
    </div>
  );
}
