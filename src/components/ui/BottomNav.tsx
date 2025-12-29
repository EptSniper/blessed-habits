import { Home, BookOpen, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: <Home className="w-5 h-5" />, label: "Dashboard", path: "/dashboard" },
  { icon: <BookOpen className="w-5 h-5" />, label: "Daily Log", path: "/daily-log" },
  { icon: <History className="w-5 h-5" />, label: "History", path: "/history" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-tcc-bg1/95 backdrop-blur-xl border-t border-border/30">
        <div className="max-w-md mx-auto flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 px-4 rounded-xl",
                  "transition-all duration-180 ease-tcc-standard",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "transition-transform duration-150",
                  isActive && "scale-110"
                )}>
                  {item.icon}
                </div>
                <span className={cn(
                  "text-xs font-medium",
                  isActive && "text-primary"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary shadow-glow" />
                )}
              </button>
            );
          })}
        </div>
      </div>
      {/* Safe area padding for phones */}
      <div className="h-safe-area-inset-bottom bg-tcc-bg1" />
    </nav>
  );
}
