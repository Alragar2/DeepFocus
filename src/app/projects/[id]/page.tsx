"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Plus, ArrowLeft, CheckCircle2, Circle, Clock, MoreVertical, Trash2, LayoutDashboard, ListTodo, StickyNote, Timer } from "lucide-react";
import Link from "next/link";
import { formatTime, cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import ProjectNotes from "@/components/ProjectNotes";

type Tab = "overview" | "tasks" | "notes" | "sessions";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const { projects, tasks, sessions, addTask, toggleTaskCompletion, deleteTask, settings } = useStore();
  const t = useTranslation(settings.language);
  const project = projects.find((p) => p.id === projectId);
  
  const [activeTab, setActiveTab] = useState<Tab>("tasks");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground mb-4">{t("projectNotFound")}</p>
        <button onClick={() => router.push("/projects")} className="text-primary hover:underline">
          {t("goBack")}
        </button>
      </div>
    );
  }

  const projectTasks = tasks.filter((t) => t.projectId === projectId);
  const incompleteTasks = projectTasks.filter((t) => !t.completed);
  const completedTasks = projectTasks.filter((t) => t.completed);
  
  const projectSessions = sessions.filter((s) => projectTasks.some((t) => t.id === s.taskId));
  const totalFocusTime = projectSessions.reduce((acc, s) => acc + s.duration, 0);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      projectId,
      title: newTaskTitle,
      priority: newTaskPriority,
    });
    setNewTaskTitle("");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-500 bg-red-500/10";
      case "medium": return "text-yellow-500 bg-yellow-500/10";
      case "low": return "text-green-500 bg-green-500/10";
      default: return "text-muted-foreground bg-muted";
    }
  };

  const tabs = [
    { id: "overview", label: t("overview"), icon: LayoutDashboard },
    { id: "tasks", label: t("tasksTab"), icon: ListTodo },
    { id: "notes", label: t("notes"), icon: StickyNote },
    { id: "sessions", label: "Sessions", icon: Timer },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Link href="/projects" className="p-2 hover:bg-card rounded-md transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color }} />
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          </div>
        </div>

        <div className="flex border-b border-card-border overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-card-border"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-2">
          <div className="bg-card border border-card-border p-6 rounded-xl md:col-span-2">
            <h3 className="text-lg font-semibold mb-2">About Project</h3>
            <p className="text-muted-foreground">{project.description || "No description provided."}</p>
          </div>
          <div className="bg-card border border-card-border p-6 rounded-xl flex flex-col items-center justify-center text-center">
             <div className="text-muted-foreground text-sm font-medium mb-1">Total Focus Time</div>
             <div className="text-3xl font-bold text-primary">{formatTime(totalFocusTime)}</div>
          </div>
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2">
          <div className="bg-card border border-card-border p-6 rounded-xl">
            <form onSubmit={handleAddTask} className="flex gap-3">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder={t("addTask")}
                className="flex-1 bg-background border border-card-border rounded-md px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="bg-background border border-card-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="low">{t("low")}</option>
                <option value="medium">{t("medium")}</option>
                <option value="high">{t("high")}</option>
              </select>
              <button
                type="submit"
                className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                {t("add")}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                {t("todo")} ({incompleteTasks.length})
              </h3>
              <div className="space-y-2">
                {incompleteTasks.map((task) => (
                  <div key={task.id} className="group flex items-center justify-between p-4 bg-card border border-card-border rounded-xl hover:border-primary/50 transition-all">
                    <div className="flex items-center gap-3 flex-1">
                      <button onClick={() => toggleTaskCompletion(task.id)} className="text-muted-foreground hover:text-primary transition-colors">
                        <Circle className="w-5 h-5" />
                      </button>
                      <span className="font-medium">{task.title}</span>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider", getPriorityColor(task.priority))}>
                        {task.priority}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-background px-2 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTime(task.accumulatedTime)}
                      </div>
                      
                      <Link
                        href={`/focus/${task.id}`}
                        className="px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-md transition-colors"
                      >
                        {t("focus")}
                      </Link>

                      <button onClick={() => deleteTask(task.id)} className="text-muted-foreground hover:text-red-500 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {incompleteTasks.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center border border-dashed border-card-border rounded-xl">
                    {t("allDone")}
                  </p>
                )}
              </div>
            </div>

            {completedTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                  {t("completed")} ({completedTasks.length})
                </h3>
                <div className="space-y-2">
                  {completedTasks.map((task) => (
                    <div key={task.id} className="group flex items-center justify-between p-4 bg-background border border-card-border rounded-xl opacity-60 hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleTaskCompletion(task.id)} className="text-primary">
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <span className="font-medium line-through text-muted-foreground">{task.title}</span>
                      </div>
                      <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-xs text-muted-foreground font-medium">
                          {formatTime(task.accumulatedTime)} {t("focused")}
                        </span>
                        <button onClick={() => deleteTask(task.id)} className="text-muted-foreground hover:text-red-500 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "notes" && (
        <div className="bg-card border border-card-border p-6 rounded-xl animate-in slide-in-from-bottom-2">
          <ProjectNotes projectId={projectId} />
        </div>
      )}

      {activeTab === "sessions" && (
        <div className="bg-card border border-card-border p-6 rounded-xl animate-in slide-in-from-bottom-2">
           <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Sessions</h3>
           {projectSessions.length === 0 ? (
             <p className="text-muted-foreground text-sm">No sessions recorded yet.</p>
           ) : (
             <div className="space-y-3">
               {projectSessions.slice(-10).reverse().map((session) => {
                 const task = tasks.find(t => t.id === session.taskId);
                 return (
                   <div key={session.id} className="flex items-center justify-between p-3 border border-card-border rounded-lg bg-background/50">
                     <div>
                       <div className="font-medium">{task?.title || "Unknown Task"}</div>
                       <div className="text-xs text-muted-foreground">{new Date(session.createdAt).toLocaleString()}</div>
                     </div>
                     <div className="text-sm font-medium text-primary">
                       +{formatTime(session.duration)}
                     </div>
                   </div>
                 );
               })}
             </div>
           )}
        </div>
      )}
    </div>
  );
}
