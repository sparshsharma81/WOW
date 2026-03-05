import { z } from "zod";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";

import { TaskStatus } from "@/features/tasks/types";
import { getMember } from "@/features/members/utils";

import { DATABASE_ID, PROJECTS_ID, TASKS_ID } from "@/config";
import { sessionMiddleware } from "@/lib/session-middleware";

import { createProjectSchema, updateProjectSchema } from "../schemas";

import { Project } from "../types";

const getProjectImageUrl = (project: any) => project.imageUrl ?? project.ImageURL;
const TASK_ASSIGNEE_FIELDS = ["assignedID", "assigneeId", "assigneeid"] as const;

const toImageDataUrl = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const mimeType = file.type || "image/png";
  return `data:${mimeType};base64,${Buffer.from(arrayBuffer).toString("base64")}`;
};

const assertProjectsCollectionId = () => {
  if (!PROJECTS_ID) {
    throw new Error("Projects collection ID is missing. Set NEXT_PUBLIC_APPWRITE_PROJECTS_ID (or NEXT_PUBLIC_APPWRITE_PROJECT_ID).");
  }
};

const app = new Hono()
  .post(
    "/",
    sessionMiddleware,
    zValidator("form", createProjectSchema),
    async (c) => {
      assertProjectsCollectionId();
      const databases = c.get("databases");
      const user = c.get("user");

      const { name, image, workspaceId } = c.req.valid("form");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id
      });

      if (!member) {
        return c.json({ error: "Unathorized" }, 401);
      }

      let uploadedImageUrl: string | undefined;

      if (image instanceof File) {
        uploadedImageUrl = await toImageDataUrl(image);
      }

      const project = await databases.createDocument(
        DATABASE_ID,
        PROJECTS_ID,
        ID.unique(),
        {
          name,
          ImageURL: uploadedImageUrl,
          workspaceId
        },
      );

      return c.json({
        data: {
          ...project,
          imageUrl: getProjectImageUrl(project),
        },
      });
    }
  )
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", z.object({ workspaceId: z.string() })),
    async (c) => {
      assertProjectsCollectionId();
      const user = c.get("user");
      const databases = c.get("databases");

      const { workspaceId } = c.req.valid("query");

      if (!workspaceId) {
        return c.json({ error: "Missing workspaceId" }, 400);
      }

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const projects = await databases.listDocuments<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.orderDesc("$createdAt"),
        ],
      );

      return c.json({
        data: {
          ...projects,
          documents: projects.documents.map((project) => ({
            ...project,
            imageUrl: getProjectImageUrl(project),
          })),
        },
      });
    }
  )
  .get(
    "/:projectId",
    sessionMiddleware,
    async (c) => {
      assertProjectsCollectionId();
      const user = c.get("user");
      const databases = c.get("databases");
      const { projectId } = c.req.param();

      const project = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectId,
      );

      const member = await getMember({
        databases,
        workspaceId: project.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      return c.json({
        data: {
          ...project,
          imageUrl: getProjectImageUrl(project),
        },
      });
    }
  )
  .patch(
    "/:projectId",
    sessionMiddleware,
    zValidator("form", updateProjectSchema),
    async (c) => {
      assertProjectsCollectionId();
      const databases = c.get("databases");
      const user = c.get("user");

      const { projectId } = c.req.param();
      const { name, image } = c.req.valid("form");

      const existingProject = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectId,
      );

      const member = await getMember({
        databases,
        workspaceId: existingProject.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      let uploadedImageUrl: string | undefined;

      if (image instanceof File) {
        uploadedImageUrl = await toImageDataUrl(image);
      } else {
        uploadedImageUrl = image;
      } 

      const project = await databases.updateDocument(
        DATABASE_ID,
        PROJECTS_ID,
        projectId,
        {
          name,
          ImageURL: uploadedImageUrl
        }
      );

      return c.json({
        data: {
          ...project,
          imageUrl: getProjectImageUrl(project),
        },
      });
    }
  )
  .delete(
    "/:projectId",
    sessionMiddleware,
    async (c) => {
      assertProjectsCollectionId();
      const databases = c.get("databases");
      const user = c.get("user");

      const { projectId } = c.req.param();

      const existingProject = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectId,
      );

      const member = await getMember({
        databases,
        workspaceId: existingProject.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // TODO: Delete tasks

      await databases.deleteDocument(
        DATABASE_ID,
        PROJECTS_ID,
        projectId,
      );

      return c.json({ data: { $id: existingProject.$id } });
    }
  )
  .get(
    "/:projectId/analytics",
    sessionMiddleware,
    async (c) => {
      assertProjectsCollectionId();
      const databases = c.get("databases");
      const user = c.get("user");
      const { projectId } = c.req.param();

      const project = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectId
      );

      const member = await getMember({
        databases,
        workspaceId: project.workspaceId,
        userId: user.$id,
      });


      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const now = new Date();
      const thisMonthStart = startOfMonth(now);
      const thisMonthEnd = endOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));

      const thisMonthTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectID", projectId),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
        ]
      );

      const lastMonthTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectID", projectId),
          Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
        ]
      );

      const taskCount = thisMonthTasks.total;
      const taskDifference = taskCount - lastMonthTasks.total;

      let assignedTaskCount = 0;
      let assignedTaskDifference = 0;

      try {
        const getAssignedTasksForRange = async (start: Date, end: Date) => {
          let lastError: unknown = null;

          for (const assigneeField of TASK_ASSIGNEE_FIELDS) {
            try {
              return await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                  Query.equal("projectID", projectId),
                  Query.equal(assigneeField, member.$id),
                  Query.greaterThanEqual("$createdAt", start.toISOString()),
                  Query.lessThanEqual("$createdAt", end.toISOString())
                ]
              );
            } catch (error) {
              lastError = error;
              const message = error instanceof Error ? error.message : String(error);
              if (message.includes("Attribute not found in schema") || message.includes("Unknown attribute")) {
                continue;
              }
              throw error;
            }
          }

          throw lastError ?? new Error("Unable to query assigned tasks");
        };

        const thisMonthAssignedTasks = await getAssignedTasksForRange(thisMonthStart, thisMonthEnd);
        const lastMonthAssignedTasks = await getAssignedTasksForRange(lastMonthStart, lastMonthEnd);

        assignedTaskCount = thisMonthAssignedTasks.total;
        assignedTaskDifference = assignedTaskCount - lastMonthAssignedTasks.total;
      } catch {
        assignedTaskCount = 0;
        assignedTaskDifference = 0;
      }

      const thisMonthIncompleteTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectID", projectId),
          Query.notEqual("status", TaskStatus.DONE),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
        ]
      );

      const lastMonthIncompleteTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectID", projectId),
          Query.notEqual("status", TaskStatus.DONE),
          Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
        ]
      );

      const incompleteTaskCount = thisMonthIncompleteTasks.total;
      const incompleteTaskDifference =
        incompleteTaskCount - lastMonthIncompleteTasks.total;

      const thisMonthCompletedTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectID", projectId),
          Query.equal("status", TaskStatus.DONE),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
        ]
      );

      const lastMonthCompletedTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectID", projectId),
          Query.equal("status", TaskStatus.DONE),
          Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
        ]
      );

      const completedTaskCount = thisMonthCompletedTasks.total;
      const completedTaskDifference =
        completedTaskCount - lastMonthCompletedTasks.total;

      const thisMonthOverdueTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectID", projectId),
          Query.notEqual("status", TaskStatus.DONE),
          Query.lessThan("dueDate", now.toISOString()),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
        ]
      );

      const lastMonthOverdueTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectID", projectId),
          Query.notEqual("status", TaskStatus.DONE),
          Query.lessThan("dueDate", now.toISOString()),
          Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
        ]
      );

      const overdueTaskCount = thisMonthOverdueTasks.total;
      const overdueTaskDifference =
        overdueTaskCount - lastMonthOverdueTasks.total;

      return c.json({
        data: {
          taskCount,
          taskDifference,
          assignedTaskCount,
          assignedTaskDifference,
          completedTaskCount,
          completedTaskDifference,
          incompleteTaskCount,
          incompleteTaskDifference,
          overdueTaskCount,
          overdueTaskDifference,
        },
      });
    }
  )

export default app;
