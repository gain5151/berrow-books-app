import { z } from "zod";

export const createRoomSchema = z.object({
  name: z
    .string()
    .min(1, "ルーム名を入力してください")
    .max(100, "ルーム名は100文字以内で入力してください"),
  tokenExpiresAt: z
    .string()
    .min(1, "有効期限を設定してください")
    .refine((val) => {
      const date = new Date(val);
      return date > new Date();
    }, "有効期限は現在より後の日時を設定してください"),
});

export type CreateRoomFormData = z.infer<typeof createRoomSchema>;
