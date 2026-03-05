"use client";

import { usePathname } from "next/navigation";

import { UserButton } from "@/features/auth/components/user-button";

import { MobileSidebar } from "./mobile-sidebar";

const pathnameMap = {
  "tasks": {
    title: "My Tasks",
    description: "View all of your tasks here",
  },
  "projects": {
    title: "My Project",
    description: "View tasks of your project here"
  },
};

const defaultMap = {
  title: "Home",
  description: "Monitor all of your projects and tasks here",
};

export const Navbar = () => {
  const pathname = usePathname();
  const pathnameParts = pathname.split("/");
  const pathnameKey = pathnameParts[3] as keyof typeof pathnameMap;

  const { title, description } = pathnameMap[pathnameKey] || defaultMap;

  return (
    <nav className="border-b border-neutral-200 dark:border-slate-700 pt-4 px-6 py-4 flex items-center justify-between bg-white dark:bg-slate-900">
      <div className="flex-col hidden lg:flex">
        <h1 className="text-3xl font-bold text-foreground">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {description}
        </p>
      </div>
      <MobileSidebar />
      <UserButton />
    </nav>
  );
};
