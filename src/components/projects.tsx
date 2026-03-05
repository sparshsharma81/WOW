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
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Projects</p>
        <RiAddCircleFill onClick={open} className="size-5 cursor-pointer text-accent transition-opacity hover:opacity-80" />
      </div>
      {data?.documents.map((project) => {
        const href = `/workspaces/${workspaceId}/projects/${project.$id}`;
        const isActive = pathname === href;

        return (
          <Link href={href} key={project.$id}>
            <div
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground",
                isActive && "bg-accent/10 font-medium text-accent"
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
