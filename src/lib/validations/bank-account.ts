import { z } from "zod";

export const bankAccountSchema = z.object({
  name: z.string().min(1, "O nome da conta é obrigatório").max(255),
  balance: z.union([z.string(), z.number()]).transform(val => val.toString()).default("0"),
});

export type BankAccountInput = z.infer<typeof bankAccountSchema>;
