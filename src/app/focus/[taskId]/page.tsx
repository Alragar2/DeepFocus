"use client";

import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import PomodoroTimer from "@/components/PomodoroTimer";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { formatTime } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function FocusPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params?.taskId as string;

  const { tasks, projects, toggleTaskCompletion, settings } = useStore();
  const t = useTranslation(settings.language);
  
  const task = tasks.find((t) => t.id === taskId);
  const project = task ? projects.find((p) => p.id === task.projectId) : null;

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <p className="text-muted-foreground mb-4">{t("taskNotFound")}</p>
        <button onClick={() => router.push("/projects")} className="text-primary hover:underline">
          {t("goBack")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 animate-in fade-in duration-700">
      <Link
        href={`/projects/${task.projectId}`}
        className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">{t("backTo")} {project?.name || "Project"}</span>
      </Link>

      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center justify-center gap-2">
            {project && (
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: project.color }} />
            )}
            {project?.name || "Inbox"}
          </p>
          <h1 className={`text-4xl md:text-5xl font-bold tracking-tight mb-6 ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {task.title}
          </h1>
          
          <div className="flex items-center justify-center gap-4">
             <button
              onClick={() => toggleTaskCompletion(task.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-card-border bg-card hover:bg-card-border hover:text-primary transition-colors text-sm font-medium"
            >
              <CheckCircle2 className={`w-4 h-4 ${task.completed ? 'text-primary' : ''}`} />
              {task.completed ? t("completed") : t("markAsDone")}
            </button>
            <div className="px-4 py-2 rounded-full border border-card-border bg-card text-sm font-medium text-muted-foreground">
              {t("totalFocus")}: {formatTime(task.accumulatedTime)}
            </div>
          </div>
        </div>

        <PomodoroTimer taskId={task.id} />
      </div>
    </div>
  );
}
