import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Project = {
  id: string;
  name: string;
  color: string;
  description?: string;
  notes?: string;
  createdAt: number;
};

export type Task = {
  id: string;
  projectId: string;
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  accumulatedTime: number; // in seconds
  createdAt: number;
};

export type Session = {
  id: string;
  taskId: string;
  duration: number; // in seconds
  createdAt: number;
};

type AppState = {
  projects: Project[];
  tasks: Task[];
  sessions: Session[];
  settings: {
    focusDuration: number;
    shortBreakDuration: number;
    language: "en" | "es";
  };
  addProject: (project: Omit<Project, "id" | "createdAt" | "notes">) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addTask: (task: Omit<Task, "id" | "createdAt" | "completed" | "accumulatedTime">) => void;
  toggleTaskCompletion: (id: string) => void;
  deleteTask: (id: string) => void;
  addSession: (taskId: string, duration: number) => void;
  updateSettings: (settings: Partial<AppState["settings"]>) => void;
};

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      projects: [],
      tasks: [],
      sessions: [],
      settings: {
        focusDuration: 25 * 60,
        shortBreakDuration: 5 * 60,
        language: "en",
      },

      addProject: (project) =>
        set((state) => ({
          projects: [
            ...state.projects,
            { ...project, id: generateId(), createdAt: Date.now(), notes: "" },
          ],
        })),

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          tasks: state.tasks.filter((t) => t.projectId !== id), // cascade delete tasks
        })),

      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id: generateId(),
              createdAt: Date.now(),
              completed: false,
              accumulatedTime: 0,
            },
          ],
        })),

      toggleTaskCompletion: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),

      addSession: (taskId, duration) =>
        set((state) => {
          const newSession: Session = {
            id: generateId(),
            taskId,
            duration,
            createdAt: Date.now(),
          };

          return {
            sessions: [...state.sessions, newSession],
            tasks: state.tasks.map((t) =>
              t.id === taskId
                ? { ...t, accumulatedTime: t.accumulatedTime + duration }
                : t
            ),
          };
        }),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
    }),
    {
      name: "pomodoro-storage",
    }
  )
);
