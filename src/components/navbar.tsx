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
    <nav className="h-[72px] border-b px-6 flex items-center justify-between bg-card">
      <div className="flex-col hidden lg:flex">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      <MobileSidebar />
      <UserButton />
    </nav>
  );
};
