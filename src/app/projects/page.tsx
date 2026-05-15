"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import { Plus, Folder, MoreVertical, Trash2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const PRESET_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

export default function ProjectsPage() {
  const { projects, tasks, addProject, deleteProject, settings } = useStore();
  const t = useTranslation(settings.language);
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", color: PRESET_COLORS[0], description: "" });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    
    addProject(newProject);
    setNewProject({ name: "", color: PRESET_COLORS[0], description: "" });
    setIsCreating(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t("projects")}</h1>
          <p className="text-muted-foreground">{t("manageSpaces")}</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t("newProject")}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-card border border-card-border p-6 rounded-xl animate-in slide-in-from-top-2">
          <h3 className="text-lg font-medium mb-4">{t("createProject")}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">{t("name")}</label>
              <input
                autoFocus
                type="text"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                className="w-full bg-background border border-card-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g., Learning Figma"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">{t("descriptionOpt")}</label>
              <input
                type="text"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="w-full bg-background border border-card-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="A short description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">{t("color")}</label>
              <div className="flex gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewProject({ ...newProject, color })}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      newProject.color === color ? "border-white scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium transition-colors"
              >
                {t("create")}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const projectTasks = tasks.filter((t) => t.projectId === project.id);
          const completedTasks = projectTasks.filter((t) => t.completed).length;
          const progress = projectTasks.length ? Math.round((completedTasks / projectTasks.length) * 100) : 0;

          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group bg-card border border-card-border rounded-xl p-6 hover:border-primary/50 transition-colors block relative"
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (confirm("Delete this project and all its tasks?")) {
                    deleteProject(project.id);
                  }
                }}
                className="absolute top-4 right-4 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${project.color}20`, color: project.color }}
                >
                  <Folder className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{project.description}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{completedTasks} / {projectTasks.length} {t("tasks")}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-background rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, backgroundColor: project.color }}
                  />
                </div>
              </div>
            </Link>
          );
        })}

        {projects.length === 0 && !isCreating && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-card-border rounded-xl">
            <h3 className="text-lg font-medium text-foreground mb-1">{t("noProjects")}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t("createFirstProject")}</p>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t("newProject")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
