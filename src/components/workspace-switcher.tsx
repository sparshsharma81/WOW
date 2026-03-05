"use client";

import { useRouter } from "next/navigation";
import { RiAddCircleFill } from "react-icons/ri";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { WorkspaceAvatar } from "@/features/workspaces/components/workspace-avatar";
import { useCreateWorkspaceModal } from "@/features/workspaces/hooks/use-create-workspace-modal";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const WorkspaceSwitcher = () => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();
  const { data: workspaces } = useGetWorkspaces();
  const { open } = useCreateWorkspaceModal();
  const isWorkspaceIdValid = Boolean(workspaceId && workspaceId !== "undefined");

  const onSelect = (id: string) => {
    router.push(`/workspaces/${id}`);
  };

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between px-2">
        <p className="text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">Workspaces</p>
        <RiAddCircleFill onClick={open} className="size-5 text-accent cursor-pointer hover:text-blue-500 dark:text-accent dark:hover:text-blue-400 transition-colors duration-200" />
      </div>
      <Select onValueChange={onSelect} value={isWorkspaceIdValid ? workspaceId : undefined}>
        <SelectTrigger className="w-full bg-accent/10 dark:bg-blue-950/40 dark:border-blue-400/30 font-medium p-2 border-accent/30 dark:border-blue-400/20 hover:border-accent/50 dark:hover:border-blue-400/40 transition-colors duration-200 smooth-transition">
          <SelectValue placeholder="No workspace selected" />
        </SelectTrigger>
        <SelectContent>
          {workspaces?.documents.map((workspace) => (
            <SelectItem key={workspace.$id} value={workspace.$id}>
              <div className="flex justify-start items-center gap-3 font-medium">
                <WorkspaceAvatar name={workspace.name} image={workspace.imageUrl} />
                <span className="truncate">{workspace.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
