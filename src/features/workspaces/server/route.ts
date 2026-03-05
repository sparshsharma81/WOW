import { z } from "zod";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";

import { MemberRole } from "@/features/members/types";
import { TaskStatus } from "@/features/tasks/types";
import { getMember } from "@/features/members/utils";

import { generateInviteCode } from "@/lib/utils";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, MEMBERS_ID, TASKS_ID, WORKSPACES_ID } from "@/config";

import { Workspace } from "../types";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../schemas";

const getWorkspaceImageUrl = (workspace: any) => workspace.imageUrl ?? workspace.ImageURL;
const TASK_ASSIGNEE_FIELDS = ["assignedID", "assigneeId", "assigneeid"] as const;

const toImageDataUrl = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const mimeType = file.type || "image/png";
  return `data:${mimeType};base64,${Buffer.from(arrayBuffer).toString("base64")}`;
};

const app = new Hono()
  .get("/", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");

    const members = await databases.listDocuments(
      DATABASE_ID,
      MEMBERS_ID,
      [Query.equal("userId", user.$id)]
    );

    if (members.total === 0) {
      return c.json({ data: { documents: [], total: 0 } });
    }

    const workspaceIds = members.documents.map((member) => member.workspaceId);

    const workspaces = await databases.listDocuments<Workspace>(
      DATABASE_ID,
      WORKSPACES_ID,
      [
        Query.orderDesc("$createdAt"),
        Query.contains("$id", workspaceIds)
      ],
    );

    return c.json({
      data: {
        ...workspaces,
        documents: workspaces.documents.map((workspace) => ({
          ...workspace,
          imageUrl: getWorkspaceImageUrl(workspace),
        })),
      },
    });
  })
  .get(
    "/:workspaceId",
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { workspaceId } = c.req.param();

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const workspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
      );

      return c.json({
        data: {
          ...workspace,
          imageUrl: getWorkspaceImageUrl(workspace),
        },
      });
    }
  )
  .get(
    "/:workspaceId/info",
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const { workspaceId } = c.req.param();

      const workspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
      );

      return c.json({ 
        data: { 
          $id: workspace.$id, 
          name: workspace.name, 
          imageUrl: getWorkspaceImageUrl(workspace)
        } 
      });
    }
  )
  .post(
    "/",
    zValidator("form", createWorkspaceSchema),
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");

      const { name, image } = c.req.valid("form");

      let uploadedImageUrl: string | undefined;

      if (image instanceof File) {
        try {
          uploadedImageUrl = await toImageDataUrl(image);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unable to upload workspace image";
          return c.json({ error: message }, 400);
        }
      }

      const workspace = await databases.createDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        ID.unique(),
        {
          name,
          userid: user.$id,
          ImageURL: uploadedImageUrl,
          inviteCode: generateInviteCode(6),
        },
      );

      await databases.createDocument(
        DATABASE_ID,
        MEMBERS_ID,
        ID.unique(),
        {
          userId: user.$id,
          workspaceId: workspace.$id,
          role: MemberRole.ADMIN,
        },
      );

      return c.json({
        data: {
          ...workspace,
          imageUrl: getWorkspaceImageUrl(workspace),
        },
      });
    }
  )
  .patch(
    "/:workspaceId",
    sessionMiddleware,
    zValidator("form", updateWorkspaceSchema),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");

      const { workspaceId } = c.req.param();
      const { name, image } = c.req.valid("form");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member || member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      let uploadedImageUrl: string | undefined;

      if (image instanceof File) {
        try {
          uploadedImageUrl = await toImageDataUrl(image);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unable to upload workspace image";
          return c.json({ error: message }, 400);
        }
      } else {
        uploadedImageUrl = image;
      } 

      const workspace = await databases.updateDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
        {
          name,
          ImageURL: uploadedImageUrl
        }
      );

      return c.json({
        data: {
          ...workspace,
          imageUrl: getWorkspaceImageUrl(workspace),
        },
      });
    }
  )
  .delete(
    "/:workspaceId",
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");

      const { workspaceId } = c.req.param();

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member || member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // TODO: Delete members, projects, and tasks

      await databases.deleteDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
      );

      return c.json({ data: { $id: workspaceId } });
    }
  )
  .post(
    "/:workspaceId/reset-invite-code",
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");

      const { workspaceId } = c.req.param();

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member || member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const workspace = await databases.updateDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
        {
          inviteCode: generateInviteCode(6),
        },
      );

      return c.json({ data: workspace });
    }
  )
  .post(
    "/:workspaceId/join",
    sessionMiddleware,
    zValidator("json", z.object({ code: z.string() })),
    async (c) => {
      const { workspaceId } = c.req.param();
      const { code } = c.req.valid("json");

      const databases = c.get("databases");
      const user = c.get("user");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (member) {
        return c.json({ error: "Already a member" }, 400);
      }

      const workspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId
      );

      if (workspace.inviteCode !== code) {
        return c.json({ error: "Invalid invite code" }, 400);
      }

      await databases.createDocument(
        DATABASE_ID,
        MEMBERS_ID,
        ID.unique(),
        {
          workspaceId,
          userId: user.$id,
          role: MemberRole.MEMBER,
        },
      );

      return c.json({ data: workspace });
    }
  )
  .get(
    "/:workspaceId/analytics",
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { workspaceId } = c.req.param();

      const member = await getMember({
        databases,
        workspaceId,
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
          Query.equal("workspaceId", workspaceId),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
        ]
      );

      const lastMonthTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("workspaceId", workspaceId),
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
                  Query.equal("workspaceId", workspaceId),
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
          Query.equal("workspaceId", workspaceId),
          Query.notEqual("status", TaskStatus.DONE),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
        ]
      );

      const lastMonthIncompleteTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("workspaceId", workspaceId),
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
          Query.equal("workspaceId", workspaceId),
          Query.equal("status", TaskStatus.DONE),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
        ]
      );

      const lastMonthCompletedTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("workspaceId", workspaceId),
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
          Query.equal("workspaceId", workspaceId),
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
          Query.equal("workspaceId", workspaceId),
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
