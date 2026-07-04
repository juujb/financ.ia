import { z } from "zod";

export const bankAccountTypeEnum = z.enum(["checking", "savings", "digital_wallet"], {
  error: "Tipo de conta inválido",
});

export const bankAccountSchema = z.object({
  name: z.string().min(1, "O nome da conta é obrigatório").max(255),
  bank: z.string().max(100).optional(),
  type: bankAccountTypeEnum.default("checking"),
  balance: z.union([z.string(), z.number()]).transform(val => val.toString()).default("0"),
});

export type BankAccountInput = z.infer<typeof bankAccountSchema>;
export type BankAccountType = z.infer<typeof bankAccountTypeEnum>;
