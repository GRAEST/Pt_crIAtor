"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

function computeElapsed(createdAt: Date) {
  const diff = Date.now() - createdAt.getTime();
  if (diff < 0) return { days: 0, hours: 0, minutes: 0 };

  const totalMinutes = Math.floor(diff / 60_000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  return { days, hours, minutes };
}

function formatElapsed({ days, hours, minutes }: { days: number; hours: number; minutes: number }) {
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${String(hours).padStart(2, "0")}h`);
  parts.push(`${String(minutes).padStart(2, "0")}m`);
  return parts.join(" ");
}

export function ElapsedTimer({ createdAt }: { createdAt: Date }) {
  const [elapsed, setElapsed] = useState(() => computeElapsed(createdAt));

  useEffect(() => {
    setElapsed(computeElapsed(createdAt));
    const interval = setInterval(() => {
      setElapsed(computeElapsed(createdAt));
    }, 60_000);
    return () => clearInterval(interval);
  }, [createdAt]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-850 px-3 py-2 shadow-lg">
      <Clock size={14} className="text-primary-500 dark:text-primary-400" />
      <span className="text-xs font-medium text-gray-600 dark:text-gray-300 tabular-nums">
        {formatElapsed(elapsed)}
      </span>
    </div>
  );
}
