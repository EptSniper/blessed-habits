import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CelebrationToastProps {
  show: boolean;
  onClose: () => void;
  message?: string;
}

export function CelebrationToast({
  show,
  onClose,
  message = "BarakAllahu Feek 🌙",
}: CelebrationToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);

  useEffect(() => {
    if (show) {
      // Generate gold particles
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: 10 + Math.random() * 80,
        y: 20 + Math.random() * 60,
        delay: i * 50,
      }));
      setParticles(newParticles);
      setIsVisible(true);

      // Auto-hide after animation
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 260);
      }, 1300); // 240ms in + 400ms hold + 260ms out

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show && !isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Gold particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={cn(
            "absolute w-2 h-2 rounded-full bg-accent",
            isVisible ? "animate-sparkle" : "opacity-0"
          )}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}ms`,
          }}
        />
      ))}

      {/* Toast message */}
      <div
        className={cn(
          "px-6 py-4 rounded-2xl bg-card/95 backdrop-blur-xl border border-accent/30",
          "shadow-glow-gold",
          "transition-all duration-240 ease-tcc-enter",
          isVisible
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95"
        )}
      >
        <p className="text-lg font-semibold text-center">
          <span className="text-gradient-gold">{message}</span>
        </p>
      </div>
    </div>
  );
}
