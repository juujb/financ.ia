"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { bankAccounts } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth";
import { bankAccountSchema, BankAccountInput } from "@/lib/validations/bank-account";

export async function createBankAccount(data: BankAccountInput) {
  const user = await requireUser();
  const parsed = bankAccountSchema.parse(data);

  const [newAccount] = await db.insert(bankAccounts).values({
    userId: user.id,
    name: parsed.name,
    balance: parsed.balance,
  }).returning();

  revalidatePath("/");
  return newAccount;
}

export async function getBankAccounts() {
  const user = await requireUser();

  return await db.query.bankAccounts.findMany({
    where: eq(bankAccounts.userId, user.id),
    orderBy: (accounts, { desc }) => [desc(accounts.createdAt)],
  });
}

export async function getBankAccountById(id: string) {
  const user = await requireUser();

  const account = await db.query.bankAccounts.findFirst({
    where: and(eq(bankAccounts.id, id), eq(bankAccounts.userId, user.id)),
  });

  if (!account) throw new Error("Conta bancária não encontrada.");
  return account;
}

export async function updateBankAccount(id: string, data: BankAccountInput) {
  const user = await requireUser();
  const parsed = bankAccountSchema.parse(data);

  const [updatedAccount] = await db.update(bankAccounts)
    .set({
      name: parsed.name,
      balance: parsed.balance,
      updatedAt: new Date(),
    })
    .where(and(eq(bankAccounts.id, id), eq(bankAccounts.userId, user.id)))
    .returning();

  if (!updatedAccount) throw new Error("Conta bancária não encontrada.");

  revalidatePath("/");
  return updatedAccount;
}

export async function deleteBankAccount(id: string) {
  const user = await requireUser();

  const [deletedAccount] = await db.delete(bankAccounts)
    .where(and(eq(bankAccounts.id, id), eq(bankAccounts.userId, user.id)))
    .returning();

  if (!deletedAccount) throw new Error("Conta bancária não encontrada.");

  revalidatePath("/");
  return deletedAccount;
}
