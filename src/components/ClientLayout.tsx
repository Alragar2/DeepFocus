"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFocusMode = pathname?.startsWith("/focus");

  if (isFocusMode) {
    return <main className="h-screen w-full">{children}</main>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background p-8">
        <div className="max-w-5xl mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
