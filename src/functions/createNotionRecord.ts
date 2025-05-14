import { z } from "zod";
import { createNotionRecordSchema } from "./createNotionRecordSchema";

/**
 * Creates a new page in the specified Notion database with the provided name and email.
 *
 * @param inputs - An object containing the Notion API key, database ID, name, and email.
 * @returns A Promise that resolves to the Response object from the Notion API.
 * @throws If input validation fails, a ZodError is thrown.
 */
export async function createNotionRecord(
  inputs: z.infer<typeof createNotionRecordSchema>
): Promise<Response> {
  const { notionApiKey, database_id, name, email } =
    createNotionRecordSchema.parse(inputs);

  const notionPayload = {
    parent: { database_id },
    properties: {
      Name: {
        title: [
          {
            text: { content: name },
          },
        ],
      },
      Email: {
        email,
      },
    },
  };

  return fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${notionApiKey}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(notionPayload),
  });
}
