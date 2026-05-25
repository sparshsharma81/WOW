import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";
import { GeminiChat } from "@/features/gemini/components/gemini-chat";

const AiChatPage = async () => {
  const user = await getCurrent();

  if (!user) {
    redirect("/sign-in");
  }

  return <GeminiChat storageKey={`wow-gemini-chat-${user.$id}`} />;
};

export default AiChatPage;