import { z } from "zod";

export const requestSchema = z.object({
    title: z
        .string()
        .min(1, "書籍タイトルを入力してください")
        .max(200, "タイトルは200文字以内で入力してください"),
    token: z.string().min(1, "トークンを入力してください"),
});

export type RequestFormData = z.infer<typeof requestSchema>;
