import { Hono } from "hono";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.post("/submit", async (c) => {
  console.log("[/submit] Incoming request");

  let body;
  try {
    body = await c.req.json();
    console.log("[/submit] Parsed body:", body);
  } catch (err) {
    console.error("[/submit] Failed to parse JSON body:", err);
    return c.json({ success: false, error: "Invalid JSON" }, 400);
  }

  const notionPayload = {
    parent: { database_id: c.env.NOTION_DATABASE_ID },
    properties: {
      姓名: {
        title: [
          {
            text: { content: body.name || "No Name" },
          },
        ],
      },
      電子郵件: {
        email: body.email || null,
      },
    },
  };

  console.log("[/submit] Notion payload:", notionPayload);

  let notionRes;
  try {
    notionRes = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${c.env.NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notionPayload),
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
