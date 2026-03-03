import { Query } from "node-appwrite";

import { createSessionClient } from "@/lib/appwrite";
import { DATABASE_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";

interface GetWorkspacesOptions {
  userId?: string;
}

export const getWorkspaces = async ({ userId }: GetWorkspacesOptions = {}) => {
  const { databases, account } = await createSessionClient();
  const currentUserId = userId ?? (await account.get()).$id;

  const members = await databases.listDocuments(
    DATABASE_ID,
    MEMBERS_ID,
    [Query.equal("userId", currentUserId)]
  );

  if (members.total === 0) {
    return { documents: [], total: 0 };
  }

  const workspaceIds = members.documents.map((member) => member.workspaceId);

  const workspaces = await databases.listDocuments(
    DATABASE_ID,
    WORKSPACES_ID,
    [
      Query.orderDesc("$createdAt"),
      Query.contains("$id", workspaceIds)
    ],
  );

  return workspaces;
};
