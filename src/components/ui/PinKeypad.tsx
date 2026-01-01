import { useRef, useEffect } from "react";
import { Delete } from "lucide-react";
import { cn } from "@/lib/utils";

interface PinKeypadProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  disabled?: boolean;
}

export function PinKeypad({ value, onChange, maxLength = 6, disabled = false }: PinKeypadProps) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = (key: string) => {
    if (disabled) return;
    if (value.length < maxLength) {
      onChange(value + key);
    }
  };

  const handleDelete = () => {
    if (disabled) return;
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    if (disabled) return;
    onChange("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const newValue = e.target.value.replace(/\D/g, "").slice(0, maxLength);
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      handleDelete();
    }
  };

  const focusInput = () => {
    hiddenInputRef.current?.focus();
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "delete"];

  return (
    <div className="space-y-4">
      {/* Hidden input for direct typing */}
      <input
        ref={hiddenInputRef}
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="absolute opacity-0 pointer-events-none"
        autoComplete="off"
      />

      {/* PIN Display - clickable to focus input */}
      <button
        type="button"
        onClick={focusInput}
        className="flex justify-center gap-2 w-full focus:outline-none"
      >
        {Array.from({ length: maxLength }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-4 h-4 rounded-full border-2 transition-all duration-200",
              i < value.length
                ? "bg-primary border-primary scale-110"
                : "border-muted-foreground/30"
            )}
          />
        ))}
      </button>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3">
        {keys.map((key) => {
          if (key === "clear") {
            return (
              <button
                key={key}
                type="button"
                onClick={handleClear}
                disabled={disabled || value.length === 0}
                className="h-14 rounded-xl bg-secondary/50 text-muted-foreground text-sm font-medium transition-all duration-200 hover:bg-secondary active:scale-95 disabled:opacity-50"
              >
                Temizle
              </button>
            );
          }
          if (key === "delete") {
            return (
              <button
                key={key}
                type="button"
                onClick={handleDelete}
                disabled={disabled || value.length === 0}
                className="h-14 rounded-xl bg-secondary/50 text-muted-foreground flex items-center justify-center transition-all duration-200 hover:bg-secondary active:scale-95 disabled:opacity-50"
              >
                <Delete className="w-5 h-5" />
              </button>
            );
          }
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleKeyPress(key)}
              disabled={disabled}
              className="h-14 rounded-xl bg-card border border-border/50 text-foreground text-xl font-semibold transition-all duration-200 hover:bg-secondary active:scale-95 disabled:opacity-50"
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
