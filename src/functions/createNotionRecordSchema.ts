import { z } from "zod";

/**
 * Input schema for creating a Notion record.
 */
export const createNotionRecordSchema = z.object({
  notionApiKey: z.string().min(1, "API key is required"),
  database_id: z.string().min(1, "Database ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});
