"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Settings, Plus, Timer } from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function Sidebar() {
  const pathname = usePathname();
  const { projects, settings } = useStore();
  const t = useTranslation(settings.language);

  const mainLinks = [
    { name: t("dashboard"), href: "/", icon: LayoutDashboard },
    { name: t("projects"), href: "/projects", icon: FolderKanban },
    { name: t("settings"), href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-card-border bg-background flex flex-col h-full shrink-0">
      <div className="p-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Timer className="w-6 h-6 text-primary" />
          DeepFocus
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <div className="mb-8">
          <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {t("overview")}
          </p>
          {mainLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-card text-foreground"
                    : "text-muted-foreground hover:bg-card/50 hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {link.name}
              </Link>
            );
          })}
        </div>

        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("projects")}
            </p>
            <Link
              href="/projects"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-1">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === `/projects/${project.id}`
                    ? "bg-card text-foreground"
                    : "text-muted-foreground hover:bg-card/50 hover:text-foreground"
                )}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <span className="truncate">{project.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}
