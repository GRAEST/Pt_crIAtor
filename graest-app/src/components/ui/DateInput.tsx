"use client";

import { cn } from "@/lib/utils";
import { forwardRef, useState, useEffect, useRef } from "react";

interface DateInputProps {
  id?: string;
  label?: string;
  value: string; // ISO format (YYYY-MM-DD)
  onChange: (isoDate: string) => void;
  error?: string;
  className?: string;
  placeholder?: string;
}

function isoToDisplay(iso: string): string {
  if (!iso) return "";
  const parts = iso.split("-");
  if (parts.length !== 3) return "";
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

function displayToIso(display: string): string {
  if (display.length !== 10) return "";
  const parts = display.split("/");
  if (parts.length !== 3) return "";
  const [day, month, year] = parts;

  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);

  if (isNaN(d) || isNaN(m) || isNaN(y)) return "";
  if (d < 1 || d > 31) return "";
  if (m < 1 || m > 12) return "";
  if (y < 1900 || y > 2100) return "";

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function applyMask(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const limited = digits.slice(0, 8);

  if (limited.length <= 2) return limited;
  if (limited.length <= 4) return `${limited.slice(0, 2)}/${limited.slice(2)}`;
  return `${limited.slice(0, 2)}/${limited.slice(2, 4)}/${limited.slice(4)}`;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, label, error, id, value, onChange, placeholder = "dd/mm/aaaa", ...rest }, ref) => {
    const [display, setDisplay] = useState(() => isoToDisplay(value));
    const inputRef = useRef<HTMLInputElement | null>(null);
    const cursorRef = useRef<number | null>(null);

    // Sync external value changes
    useEffect(() => {
      const converted = isoToDisplay(value);
      if (converted !== display && (converted !== "" || value === "")) {
        setDisplay(converted);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    // Restore cursor position after render
    useEffect(() => {
      if (cursorRef.current !== null && inputRef.current) {
        inputRef.current.setSelectionRange(cursorRef.current, cursorRef.current);
        cursorRef.current = null;
      }
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const rawValue = e.target.value;
      const cursorPos = e.target.selectionStart ?? 0;

      const masked = applyMask(rawValue);
      setDisplay(masked);

      // Calculate cursor position adjustment
      const digitsBefore = rawValue.slice(0, cursorPos).replace(/\D/g, "").length;
      let newCursor = 0;
      let digitCount = 0;
      for (let i = 0; i < masked.length; i++) {
        if (masked[i] !== "/") {
          digitCount++;
        }
        if (digitCount === digitsBefore) {
          newCursor = i + 1;
          break;
        }
      }
      if (digitsBefore === 0) newCursor = 0;
      cursorRef.current = newCursor;

      // Convert to ISO and notify parent when complete
      if (masked.length === 10) {
        const iso = displayToIso(masked);
        if (iso) {
          onChange(iso);
        }
      } else if (masked.length === 0) {
        onChange("");
      }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      // Allow: backspace, delete, tab, escape, enter, arrows
      const allowed = ["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
      if (allowed.includes(e.key)) return;

      // Allow Ctrl/Cmd combinations (copy, paste, select all, etc.)
      if (e.ctrlKey || e.metaKey) return;

      // Block non-digit characters
      if (!/^\d$/.test(e.key)) {
        e.preventDefault();
      }
    }

    function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text");
      const masked = applyMask(pasted);
      setDisplay(masked);

      if (masked.length === 10) {
        const iso = displayToIso(masked);
        if (iso) onChange(iso);
      }

      // Set cursor to end
      cursorRef.current = masked.length;
    }

    function setRef(el: HTMLInputElement | null) {
      inputRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    }

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <input
          ref={setRef}
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={display}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          {...rest}
        />
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);

DateInput.displayName = "DateInput";
