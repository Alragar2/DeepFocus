"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Settings, Save, AlertTriangle, Globe } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function SettingsPage() {
  const { settings, updateSettings } = useStore();
  const t = useTranslation(settings.language);
  
  const [focusMins, setFocusMins] = useState(Math.floor(settings.focusDuration / 60));
  const [breakMins, setBreakMins] = useState(Math.floor(settings.shortBreakDuration / 60));
  const [language, setLanguage] = useState<"en" | "es">(settings.language);

  const handleSave = () => {
    updateSettings({
      focusDuration: focusMins * 60,
      shortBreakDuration: breakMins * 60,
      language,
    });
    alert(language === "en" ? "Settings saved successfully." : "Ajustes guardados correctamente.");
  };

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      localStorage.removeItem("pomodoro-storage");
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">{t("settings")}</h1>
        <p className="text-muted-foreground">{t("settingsDesc")}</p>
      </div>

      <div className="bg-card border border-card-border p-6 rounded-xl space-y-6">
        <div className="flex items-center gap-2 mb-6 text-primary">
          <Settings className="w-5 h-5" />
          <h2 className="text-lg font-semibold">{t("timerPrefs")}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t("focusDuration")}
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={focusMins}
              onChange={(e) => setFocusMins(parseInt(e.target.value) || 25)}
              className="w-full bg-background border border-card-border rounded-md px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t("breakDuration")}
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={breakMins}
              onChange={(e) => setBreakMins(parseInt(e.target.value) || 5)}
              className="w-full bg-background border border-card-border rounded-md px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="border-t border-card-border pt-6 mt-6">
          <div className="flex items-center gap-2 mb-4 text-primary">
            <Globe className="w-5 h-5" />
            <h2 className="text-lg font-semibold">{t("language")}</h2>
          </div>
          <div className="max-w-xs">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "en" | "es")}
              className="w-full bg-background border border-card-border rounded-md px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            {t("saveChanges")}
          </button>
        </div>
      </div>

      <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-xl space-y-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="text-lg font-semibold">{t("dangerZone")}</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("dangerDesc")}
        </p>
        <button
          onClick={handleClearData}
          className="bg-destructive hover:bg-destructive/90 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          {t("clearData")}
        </button>
      </div>
    </div>
  );
}
