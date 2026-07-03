import { z } from "zod";

export const transactionSchema = z.object({
  bankAccountId: z.string().uuid("Conta bancária inválida"),
  categoryId: z.string().uuid("Categoria inválida").nullable().optional(),
  amount: z.union([z.string(), z.number()]).transform(val => val.toString()),
  date: z.coerce.date(),
  description: z.string().min(1, "A descrição é obrigatória").max(500),
  type: z.enum(["income", "expense"]),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
