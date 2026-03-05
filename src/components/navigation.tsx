"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SettingsIcon, UsersIcon } from "lucide-react";
import { GoCheckCircle, GoCheckCircleFill, GoHome, GoHomeFill } from "react-icons/go";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

import { cn } from "@/lib/utils";

const routes = [
  {
    label: "Home",
    href: "",
    icon: GoHome,
    activeIcon: GoHomeFill,
  },
  {
    label: "My Tasks",
    href: "/tasks",
    icon: GoCheckCircle,
    activeIcon: GoCheckCircleFill,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: SettingsIcon,
    activeIcon: SettingsIcon,
  },
  {
    label: "Members",
    href: "/members",
    icon: UsersIcon,
    activeIcon: UsersIcon,
  },
];

export const Navigation = () => {
  const workspaceId = useWorkspaceId();
  const pathname = usePathname();

  if (!workspaceId || workspaceId === "undefined") {
    return null;
  }

  return (
    <ul className="flex flex-col gap-1">
      {routes.map((item) => {
        const fullHref = `/workspaces/${workspaceId}${item.href}`
        const isActive = pathname === fullHref;
        const Icon = isActive ? item.activeIcon : item.icon;
        
        return (
          <Link key={item.href} href={fullHref}>
            <div className={cn(
              "flex items-center gap-2.5 p-2.5 rounded-lg font-medium hover:bg-accent/10 dark:hover:bg-blue-500/10 transition-all duration-200 text-neutral-600 dark:text-neutral-400 hover:text-foreground cursor-pointer smooth-transition",
              isActive && "bg-accent/10 dark:bg-blue-500/15 shadow-sm text-accent dark:text-blue-400 border-l-2 border-accent dark:border-blue-400"
            )}>
              <Icon className={cn("size-5", isActive ? "text-accent dark:text-blue-400" : "text-neutral-600 dark:text-neutral-400")} />
              {item.label}
            </div>
          </Link>
        )
      })}
    </ul>
  );
};
