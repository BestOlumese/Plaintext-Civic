"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
}

export function OTPInput({ value, onChange, length = 6, disabled }: OTPInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^0-9]/g, "").slice(0, length);
    onChange(newValue);
  };

  return (
    <div className="relative flex items-center justify-center gap-2" onClick={handleClick}>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="\d{6}"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="absolute inset-0 opacity-0 cursor-default"
        autoFocus
      />
      {Array.from({ length }).map((_, i) => {
        const char = value[i];
        const isFocused = value.length === i || (value.length === length && i === length - 1);

        return (
          <div
            key={i}
            className={cn(
              "flex h-12 w-10 items-center justify-center rounded-lg border-2 bg-white text-lg font-bold transition-all duration-200 sm:h-14 sm:w-12 sm:text-xl",
              isFocused && !disabled ? "border-blue-600 ring-2 ring-blue-100 shadow-sm" : "border-slate-200",
              char ? "text-slate-900" : "text-slate-400 font-normal",
              disabled && "opacity-50"
            )}
          >
            {char || (isFocused && !disabled ? <div className="h-4 w-[2px] animate-pulse bg-blue-600" /> : "•")}
          </div>
        );
      })}
    </div>
  );
}
