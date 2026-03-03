import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetProjectsProps {
  workspaceId: string;
};

export const useGetProjects = ({
  workspaceId,
}: UseGetProjectsProps) => {
  const isValidWorkspaceId = Boolean(workspaceId && workspaceId !== "undefined");

  const query = useQuery({
    queryKey: ["projects", workspaceId],
    enabled: isValidWorkspaceId,
    queryFn: async () => {
      const response = await client.api.projects.$get({
        query: { workspaceId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const { data } = await response.json();

      return data;
    },
  });

  return query;
};
