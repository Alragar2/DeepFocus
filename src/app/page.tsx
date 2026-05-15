"use client";

import { useStore } from "@/store/useStore";
import Heatmap from "@/components/Heatmap";
import { formatTime } from "@/lib/utils";
import { Timer, CheckCircle, Target } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export default function Dashboard() {
  const { sessions, tasks, projects, settings } = useStore();
  const t = useTranslation(settings.language);

  const totalFocusTime = sessions.reduce((acc, s) => acc + s.duration, 0);
  const completedTasksCount = tasks.filter((t) => t.completed).length;

  // Simple stats
  const stats = [
    {
      title: t("totalFocusTime"),
      value: formatTime(totalFocusTime),
      icon: Timer,
      color: "text-blue-500",
    },
    {
      title: t("completedTasks"),
      value: completedTasksCount,
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      title: t("activeProjects"),
      value: projects.length,
      icon: Target,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">{t("dashboard")}</h1>
        <p className="text-muted-foreground">{t("welcome")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-card border border-card-border p-6 rounded-xl flex items-center gap-4"
            >
              <div className={`p-3 rounded-lg bg-background ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Heatmap />
        
        <div className="bg-card border border-card-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">{t("recentTasks")}</h3>
            <Link href="/projects" className="text-sm text-primary hover:underline">
              {t("viewAll")}
            </Link>
          </div>
          
          <div className="space-y-3">
            {tasks.slice(-5).reverse().map((task) => {
              const project = projects.find((p) => p.id === task.projectId);
              return (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-card-border">
                  <div>
                    <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {project && (
                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: project.color }} />
                      )}
                      {project?.name || "No Project"}
                    </p>
                  </div>
                  <Link
                    href={`/focus/${task.id}`}
                    className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors"
                  >
                    {t("focus")}
                  </Link>
                </div>
              );
            })}
            
            {tasks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">{t("noTasks")}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
