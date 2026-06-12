"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GitPullRequest, Trophy, Users } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/prs", label: "Pull Requests", icon: GitPullRequest },
  { href: "/engineers", label: "Engineers", icon: Users },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-64 min-w-64 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <GitPullRequest className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold leading-tight text-foreground">
            PR Intelligence
          </p>
          <p className="truncate text-xs text-muted-foreground">
            Developer Dashboard
          </p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] transition-colors",
                isActive
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-5 shrink-0" />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
