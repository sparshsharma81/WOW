"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiAddCircleFill } from "react-icons/ri";

import { cn } from "@/lib/utils";

import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";

export const Projects = () => {
  const pathname = usePathname();
  const { open } = useCreateProjectModal();
  const workspaceId = useWorkspaceId();
  const { data } = useGetProjects({
    workspaceId,
  });

  if (!workspaceId || workspaceId === "undefined") {
    return null;
  }

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between px-2">
        <p className="text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">Projects</p>
        <RiAddCircleFill onClick={open} className="size-5 text-accent cursor-pointer hover:text-blue-500 dark:text-accent dark:hover:text-blue-400 transition-colors duration-200" />
      </div>
      {data?.documents.map((project) => {
        const href = `/workspaces/${workspaceId}/projects/${project.$id}`;
        const isActive = pathname === href;

        return (
          <Link href={href} key={project.$id}>
            <div
              className={cn(
                "flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-accent/10 dark:hover:bg-blue-500/10 transition-all duration-200 cursor-pointer text-neutral-600 dark:text-neutral-400 hover:text-foreground smooth-transition",
                isActive && "bg-accent/10 dark:bg-blue-500/15 shadow-sm font-semibold text-accent dark:text-blue-400 border-l-2 border-accent dark:border-blue-400"
              )}
            >
              <ProjectAvatar image={project.imageUrl} name={project.name} />
              <span className="truncate">{project.name}</span>
            </div>
          </Link>
        )
      })}
    </div>
  );
};
