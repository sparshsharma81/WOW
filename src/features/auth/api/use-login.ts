import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.auth.login["$post"]>;
type RequestType = InferRequestType<typeof client.api.auth.login["$post"]>;

export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async ({ json }) => {
      const response = await client.api.auth.login["$post"]({ json });

      if (!response.ok) {
        let message = "Failed to login";
        try {
          const payload = await response.json();
          if (payload && typeof payload === "object" && "error" in payload) {
            const errorMessage = payload.error;
            if (typeof errorMessage === "string" && errorMessage.trim()) {
              message = errorMessage;
            }
          }
        } catch {
          message = "Failed to login";
        }
        throw new Error(message);
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Logged in");
      router.refresh();
      queryClient.invalidateQueries({ queryKey: ["current"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to log in");
    },
  });

  return mutation;
};
