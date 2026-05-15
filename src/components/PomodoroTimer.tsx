"use client";

import { useState, useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";
import { Play, Pause, Square, RotateCcw, Coffee, BrainCircuit } from "lucide-react";
import { formatTime, cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface PomodoroTimerProps {
  taskId: string;
}

export default function PomodoroTimer({ taskId }: PomodoroTimerProps) {
  const { settings, addSession } = useStore();
  const t = useTranslation(settings.language);
  
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [timeLeft, setTimeLeft] = useState(settings.focusDuration);
  const [isActive, setIsActive] = useState(false);
  
  const initialTime = mode === "focus" ? settings.focusDuration : settings.shortBreakDuration;
  const progress = ((initialTime - timeLeft) / initialTime) * 100;
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const expectedEndTimeRef = useRef<number | null>(null);

  // Update time when mode changes
  useEffect(() => {
    setTimeLeft(mode === "focus" ? settings.focusDuration : settings.shortBreakDuration);
    setIsActive(false);
    expectedEndTimeRef.current = null;
  }, [mode, settings.focusDuration, settings.shortBreakDuration]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      if (!expectedEndTimeRef.current) {
        expectedEndTimeRef.current = Date.now() + timeLeft * 1000;
      }
      timerRef.current = setInterval(() => {
        if (expectedEndTimeRef.current) {
          const now = Date.now();
          const remaining = Math.max(0, Math.round((expectedEndTimeRef.current - now) / 1000));
          setTimeLeft(remaining);
        }
      }, 500);
    } else if (timeLeft <= 0 && isActive) {
      // Timer finished
      setIsActive(false);
      expectedEndTimeRef.current = null;
      if (mode === "focus") {
        // Save session
        addSession(taskId, settings.focusDuration);
        setMode("break");
      } else {
        setMode("focus");
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, mode, settings.focusDuration, addSession, taskId]);

  // Update document title
  useEffect(() => {
    if (isActive && mode === "focus") {
      document.title = `${formatTime(timeLeft)} - ${t("focus")}`;
    } else if (isActive && mode === "break") {
      document.title = `${formatTime(timeLeft)} - ${t("shortBreak")}`;
    } else {
      document.title = "Pomodoro Organizer";
    }
    
    return () => {
      document.title = "Pomodoro Organizer";
    };
  }, [timeLeft, isActive, mode, t]);

  const toggleTimer = () => {
    if (!isActive) {
      expectedEndTimeRef.current = Date.now() + timeLeft * 1000;
    } else {
      expectedEndTimeRef.current = null;
    }
    setIsActive(!isActive);
  };
  
  const stopTimer = () => {
    setIsActive(false);
    expectedEndTimeRef.current = null;
    setTimeLeft(initialTime);
  };

  const skipTimer = () => {
    setIsActive(false);
    expectedEndTimeRef.current = null;
    if (mode === "focus") {
      // If skipped, we only save the time elapsed
      const duration = settings.focusDuration - timeLeft;
      if (duration > 60) { // Only save if more than 1 minute
        addSession(taskId, duration);
      }
      setMode("break");
    } else {
      setMode("focus");
    }
  };

  const strokeDasharray = 283; // 2 * pi * r (where r = 45)
  const strokeDashoffset = strokeDasharray - (progress / 100) * strokeDasharray;

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 mb-12 bg-card border border-card-border p-1 rounded-lg">
        <button
          onClick={() => setMode("focus")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
            mode === "focus" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <BrainCircuit className="w-4 h-4" />
          {t("focus")}
        </button>
        <button
          onClick={() => setMode("break")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
            mode === "break" ? "bg-green-500 text-white" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Coffee className="w-4 h-4" />
          {t("shortBreak")}
        </button>
      </div>

      <div className="relative flex items-center justify-center mb-12 scale-110 md:scale-125 lg:scale-150 transition-transform">
        <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background Circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="var(--color-card-border)"
            strokeWidth="2"
          />
          {/* Progress Circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={mode === "focus" ? "var(--color-primary)" : "#10b981"}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-5xl font-bold font-mono tracking-tighter">
            {formatTime(timeLeft)}
          </span>
          <span className="text-xs font-medium text-muted-foreground mt-2 uppercase tracking-widest">
            {mode === "focus" ? t("deepWork") : t("rest")}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={stopTimer}
          className="w-12 h-12 rounded-full bg-card border border-card-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        
        <button
          onClick={toggleTimer}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-105 shadow-xl shadow-primary/20",
            mode === "focus" ? "bg-primary hover:bg-primary-hover" : "bg-green-500 hover:bg-green-600"
          )}
        >
          {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-2" />}
        </button>

        <button
          onClick={skipTimer}
          className="w-12 h-12 rounded-full bg-card border border-card-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors"
          title="Skip"
        >
          <Square className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
