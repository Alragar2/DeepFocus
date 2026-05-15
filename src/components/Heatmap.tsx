"use client";

import { useStore } from "@/store/useStore";
import { format, subDays, startOfDay, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function Heatmap() {
  const { sessions, settings } = useStore();
  const t = useTranslation(settings.language);
  const today = startOfDay(new Date());

  // Generate last 60 days
  const days = Array.from({ length: 60 }).map((_, i) => {
    const date = subDays(today, 59 - i);
    
    const daySessions = sessions.filter((s) => isSameDay(new Date(s.createdAt), date));
    const totalDuration = daySessions.reduce((acc, s) => acc + s.duration, 0); // in seconds
    const minutes = totalDuration / 60;
    
    let intensity = 0;
    if (minutes > 0) intensity = 1;
    if (minutes > 30) intensity = 2;
    if (minutes > 60) intensity = 3;
    if (minutes > 120) intensity = 4;

    return {
      date,
      minutes,
      intensity,
    };
  });

  return (
    <div className="bg-card border border-card-border rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">{t("focusHistory")}</h3>
      <div className="flex gap-2 flex-wrap">
        {days.map((day, i) => (
          <div
            key={i}
            title={`${format(day.date, "MMM d")}: ${Math.round(day.minutes)} mins`}
            className={cn(
              "w-6 h-6 rounded-md transition-colors duration-200",
              day.intensity === 0 && "bg-muted",
              day.intensity === 1 && "bg-primary/20",
              day.intensity === 2 && "bg-primary/50",
              day.intensity === 3 && "bg-primary/80",
              day.intensity === 4 && "bg-primary"
            )}
          />
        ))}
      </div>
    </div>
  );
}
