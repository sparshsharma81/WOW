import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { sessionMiddleware } from "@/lib/session-middleware";

const messageSchema = z.object({
  role: z.enum(["user", "model"]),
  content: z.string().min(1),
});

const chatSchema = z.object({
  messages: z.array(messageSchema).min(1),
});

const GEMINI_MODEL = "gemini-2.0-flash";

const app = new Hono().post(
  "/chat",
  sessionMiddleware,
  zValidator("json", chatSchema),
  async (c) => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return c.json(
        { error: "GEMINI_API_KEY is missing. Add it to your environment variables." },
        500,
      );
    }

    const { messages } = c.req.valid("json");
    const contents = messages.map((message) => ({
      role: message.role,
      parts: [{ text: message.content }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      return c.json(
        { error: `Gemini request failed: ${errorText}` },
        response.status,
      );
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? "")
      .join("")
      .trim();

    if (!reply) {
      return c.json({ error: "Gemini returned an empty response." }, 502);
    }

    return c.json({ data: { reply } });
  },
);

export default app;