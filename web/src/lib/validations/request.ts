import { z } from "zod";

export const createRequestSchema = z.object({
  title: z
    .string()
    .min(1, "書籍タイトルを入力してください")
    .max(200, "タイトルは200文字以内で入力してください"),
  token: z
    .string()
    .min(1, "トークンを入力してください"),
});

export const updateRequestStatusSchema = z.object({
  status: z.enum(["REQUESTED", "PURCHASED", "SENT", "RETURNED"]),
  returnDueDate: z.string().optional(),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestStatusInput = z.infer<typeof updateRequestStatusSchema>;
