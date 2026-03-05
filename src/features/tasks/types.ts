import { Models } from "node-appwrite";

import { Project } from "@/features/projects/types";

export enum TaskStatus {
  BACKLOG = "BACKLOG",
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  DONE = "DONE"
};

export type TaskAssignee = Models.Document & {
  name: string;
  email: string;
  workspaceId?: string;
  userId?: string;
  role?: string;
};

export type Task = Models.Document & {
  name: string;
  status: TaskStatus;
  workspaceId: string;
  assigneeId: string;
  assigneeid?: string;
  assignedID?: string;
  projectId: string;
  projectID?: string;
  position: number;
  dueDate: string;
  description?: string;
  Description?: string;
  project?: Project;
  assignee?: TaskAssignee;
};
