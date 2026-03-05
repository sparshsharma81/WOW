import { z } from "zod";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";

import { getMember } from "@/features/members/utils";
import { Project } from "@/features/projects/types";

import { createAdminClient } from "@/lib/appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, MEMBERS_ID, PROJECTS_ID, TASKS_ID } from "@/config";

import { Task, TaskStatus } from "../types";
import { createTaskSchema } from "../schemas";

const PROJECT_FIELDS = ["projectID", "projectId"] as const;
const ASSIGNEE_FIELDS = ["assignedID", "assigneeId", "assigneeid"] as const;

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return String(error);
};

const isAttributeNotInSchemaError = (error: unknown, attribute: string) => {
  const message = getErrorMessage(error);
  return message.includes(`Attribute not found in schema: ${attribute}`);
};

const isUnknownAttributeError = (error: unknown, attribute: string) => {
  const message = getErrorMessage(error);
  return message.includes(`Unknown attribute: ${attribute}`);
};

const isMissingRequiredAttributeError = (error: unknown, attribute: string) => {
  const message = getErrorMessage(error);
  return message.includes(`Missing required attribute "${attribute}"`);
};

const getTaskProjectId = (task: any) => task.projectID ?? task.projectId;
const getTaskAssigneeId = (task: any) => task.assigneeId ?? task.assigneeid ?? task.assignedID;
const getTaskDescription = (task: any) => task.Description ?? task.description;

const app = new Hono()
  .delete(
    "/:taskId",
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { taskId } = c.req.param();

      const task = await databases.getDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        taskId,
      );

      const member = await getMember({
        databases,
        workspaceId: task.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await databases.deleteDocument(
        DATABASE_ID,
        TASKS_ID,
        taskId,
      );

      return c.json({ data: { $id: task.$id } });
    }
  )
  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        workspaceId: z.string(),
        projectId: z.string().nullish(),
        assigneeId: z.string().nullish(),
        status: z.nativeEnum(TaskStatus).nullish(),
        search: z.string().nullish(),
        dueDate: z.string().nullish(),
      })
    ),
    async (c) => {
      const { users } = await createAdminClient();
      const databases = c.get("databases");
      const user = c.get("user");

      const {
        workspaceId,
        projectId,
        status,
        search,
        assigneeId,
        dueDate,
      } = c.req.valid("query");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const projectFields = projectId ? [...PROJECT_FIELDS] : [null];
      const assigneeFields = assigneeId ? [...ASSIGNEE_FIELDS] : [null];

      let tasks: Awaited<ReturnType<typeof databases.listDocuments<Task>>> | null = null;
      let lastError: unknown = null;

      for (const projectField of projectFields) {
        for (const assigneeField of assigneeFields) {
          const query = [
            Query.equal("workspaceId", workspaceId),
            Query.orderDesc("$createdAt")
          ];

          if (projectId && projectField) {
            query.push(Query.equal(projectField, projectId));
          }

          if (status) {
            query.push(Query.equal("status", status));
          }

          if (assigneeId && assigneeField) {
            query.push(Query.equal(assigneeField, assigneeId));
          }

          if (dueDate) {
            query.push(Query.equal("dueDate", dueDate));
          }

          if (search) {
            query.push(Query.search("name", search));
          }

          try {
            tasks = await databases.listDocuments<Task>(
              DATABASE_ID,
              TASKS_ID,
              query,
            );
            break;
          } catch (error) {
            lastError = error;

            if (
              (projectField && (isAttributeNotInSchemaError(error, projectField) || isUnknownAttributeError(error, projectField))) ||
              (assigneeField && (isAttributeNotInSchemaError(error, assigneeField) || isUnknownAttributeError(error, assigneeField)))
            ) {
              continue;
            }

            throw error;
          }
        }

        if (tasks) break;
      }

      if (!tasks) {
        throw lastError;
      }

      const projectIds = tasks.documents.map((task: any) => getTaskProjectId(task));
      const assigneeIds = tasks.documents.map((task: any) => getTaskAssigneeId(task));

      const projects = await databases.listDocuments<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectIds.length > 0 ? [Query.contains("$id", projectIds)] : [],
      );

      const members = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        assigneeIds.length > 0 ? [Query.contains("$id", assigneeIds)] : [],
      );

      const assignees = await Promise.all(
        members.documents.map(async (member) => {
          const user = await users.get(member.userId);

          return {
            ...member,
            name: user.name || user.email,
            email: user.email,
          }
        })
      );

      const populatedTasks = tasks.documents.map((task) => {
        const project = projects.documents.find(
          (project) => project.$id === getTaskProjectId(task),
        );
        const assignee = assignees.find(
          (assignee) => assignee.$id === getTaskAssigneeId(task),
        );

        return {
          ...task,
          projectId: getTaskProjectId(task),
          assigneeId: getTaskAssigneeId(task),
          description: getTaskDescription(task),
          project,
          assignee,
        };
      });

      return c.json({
        data: {
          ...tasks,
          documents: populatedTasks,
        },
      });
    }
  )
  .post(
    "/",
    sessionMiddleware,
    zValidator("json", createTaskSchema),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const {
        name,
        status,
        workspaceId,
        projectId,
        dueDate,
        assigneeId,
        description,
      } = c.req.valid("json");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const highestPositionTask = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("status", status),
          Query.equal("workspaceId", workspaceId),
          Query.orderAsc("position"),
          Query.limit(1),
        ],
      );

      const newPosition =
        highestPositionTask.documents.length > 0
        ? highestPositionTask.documents[0].position + 1000
        : 1000;

      const baseTaskPayload = {
        name,
        status,
        workspaceId,
        dueDate: dueDate.toISOString(),
        position: newPosition,
        ...(description ? { Description: description } : {}),
      };

      let task: any = null;
      let lastCreateError: unknown = null;

      for (const projectField of PROJECT_FIELDS) {
        for (const assigneeField of ASSIGNEE_FIELDS) {
          try {
            task = await databases.createDocument(
              DATABASE_ID,
              TASKS_ID,
              ID.unique(),
              {
                ...baseTaskPayload,
                [projectField]: projectId,
                [assigneeField]: assigneeId,
              },
            );
            break;
          } catch (error) {
            lastCreateError = error;

            if (
              isUnknownAttributeError(error, projectField) ||
              isUnknownAttributeError(error, assigneeField) ||
              isAttributeNotInSchemaError(error, projectField) ||
              isAttributeNotInSchemaError(error, assigneeField) ||
              isMissingRequiredAttributeError(error, projectField) ||
              isMissingRequiredAttributeError(error, assigneeField)
            ) {
              continue;
            }

            throw error;
          }
        }

        if (task) break;
      }

      if (!task) {
        throw lastCreateError;
      }

      return c.json({ data: task });
    }
  )
  .patch(
    "/:taskId",
    sessionMiddleware,
    zValidator("json", createTaskSchema.partial()),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const {
        name,
        status,
        description,
        projectId,
        dueDate,
        assigneeId
      } = c.req.valid("json");
      const { taskId } = c.req.param();

      const existingTask = await databases.getDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        taskId,
      );

      const member = await getMember({
        databases,
        workspaceId: existingTask.workspaceId,
        userId: user.$id
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const updatePayloadBase = {
        name,
        status,
        dueDate: dueDate?.toISOString(),
        ...(description === undefined ? {} : { Description: description }),
      };

      let task: Task | null = null;
      let lastUpdateError: unknown = null;

      for (const projectField of PROJECT_FIELDS) {
        for (const assigneeField of ASSIGNEE_FIELDS) {
          try {
            task = await databases.updateDocument<Task>(
              DATABASE_ID,
              TASKS_ID,
              taskId,
              {
                ...updatePayloadBase,
                ...(projectId ? { [projectField]: projectId } : {}),
                ...(assigneeId ? { [assigneeField]: assigneeId } : {}),
              },
            );
            break;
          } catch (error) {
            lastUpdateError = error;

            if (
              isUnknownAttributeError(error, projectField) ||
              isUnknownAttributeError(error, assigneeField) ||
              isAttributeNotInSchemaError(error, projectField) ||
              isAttributeNotInSchemaError(error, assigneeField)
            ) {
              continue;
            }

            throw error;
          }
        }

        if (task) break;
      }

      if (!task) {
        throw lastUpdateError;
      }

      return c.json({ data: task });
    }
  )
  .get(
    "/:taskId",
    sessionMiddleware,
    async (c) => {
      const currentUser = c.get("user");
      const databases = c.get("databases");
      const { users } = await createAdminClient();
      const { taskId } = c.req.param();

      const task = await databases.getDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        taskId,
      );

      const currentMember = await getMember({
        databases,
        workspaceId: task.workspaceId,
        userId: currentUser.$id,
      });

      if (!currentMember) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const project = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        getTaskProjectId(task)
      );

      const member = await databases.getDocument(
        DATABASE_ID,
        MEMBERS_ID,
        getTaskAssigneeId(task)
      );

      const user = await users.get(member.userId);

      const assignee = {
        ...member,
        name: user.name || user.email,
        email: user.email,
      };

      return c.json({
        data: {
          ...task,
          projectId: getTaskProjectId(task),
          assigneeId: getTaskAssigneeId(task),
          description: getTaskDescription(task),
          project,
          assignee,
        },
      });
    }
  )
  .post(
    "/bulk-update",
    sessionMiddleware,
    zValidator(
      "json",
      z.object({
        tasks: z.array(
          z.object({
            $id: z.string(),
            status: z.nativeEnum(TaskStatus),
            position: z.number().int().positive().min(1000).max(1_000_000),
          })
        )
      })
    ),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { tasks } = c.req.valid("json");

      const tasksToUpdate = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_ID,
        [Query.contains("$id", tasks.map((task) => task.$id))]
      );

      const workspaceIds = new Set(tasksToUpdate.documents.map(task => task.workspaceId));
      if (workspaceIds.size !== 1) {
        return c.json({ error: "All tasks must belong to the same workspace" })
      }

      const workspaceId = workspaceIds.values().next().value;

      if (!workspaceId) {
        return c.json({ error: "Workspace ID is required" }, 400);
      }

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const updatedTasks = await Promise.all(
        tasks.map(async (task) => {
          const { $id, status, position } = task;
          return databases.updateDocument<Task>(
            DATABASE_ID,
            TASKS_ID,
            $id,
            { status, position }
          );
        })
      );

      return c.json({ data: updatedTasks });
    }
  )

export default app;
