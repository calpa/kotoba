import { Hono } from "hono";
import { z } from "zod";
import { createNotionRecord } from "./functions/createNotionRecord";
import { submitSchema } from "./types/submitSchema";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/", (c) => {
  return c.json({ message: "Hello, world!" });
});

app.post("/submit", async (c) => {
  console.log("[/submit] Incoming request");

  let body: unknown;
  try {
    body = await c.req.json();
    console.log("[/submit] Parsed body:", body);
  } catch (err) {
    console.error("[/submit] Failed to parse JSON body:", err);
    return c.json({ success: false, error: "Invalid JSON" }, 400);
  }

  let name: string, email: string;
  try {
    ({ name, email } = submitSchema.parse(body));
  } catch (err) {
    console.error("[/submit] Validation error:", err);
    return c.json(
      {
        success: false,
        error: "Validation failed",
        details: err instanceof z.ZodError ? err.flatten() : undefined,
      },
      400
    );
  }

  let notionRes;
  try {
    notionRes = await createNotionRecord({
      notionApiKey: c.env.NOTION_API_KEY,
      database_id: c.env.NOTION_DATABASE_ID,
      name,
      email,
    });
    console.log("[/submit] Notion API status:", notionRes.status);
  } catch (err) {
    console.error("[/submit] Failed to call Notion API:", err);
    return c.json({ success: false, error: "Failed to call Notion API" }, 502);
  }

  if (!notionRes.ok) {
    const errorText = await notionRes.json();
    console.error("[/submit] Notion API error:");
    console.error(errorText);
    return c.json({ success: false, error: errorText }, 500);
  }

  console.log("[/submit] Notion page created successfully");
  return c.json({ success: true });
});

export default app;
