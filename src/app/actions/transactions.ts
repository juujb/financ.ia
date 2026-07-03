"use server";

import { revalidatePath } from "next/cache";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { transactions, bankAccounts } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth";
import { transactionSchema, TransactionInput } from "@/lib/validations/transaction";

export async function createTransaction(data: TransactionInput) {
  const user = await requireUser();
  const parsed = transactionSchema.parse(data);

  // Validate that the bank account belongs to the user
  const account = await db.query.bankAccounts.findFirst({
    where: and(eq(bankAccounts.id, parsed.bankAccountId), eq(bankAccounts.userId, user.id)),
  });

  if (!account) {
    throw new Error("Conta bancária inválida ou não encontrada.");
  }

  // TODO: Em um cenário real, você atualizaria o saldo da conta aqui 
  // usando uma transação do banco de dados (transaction no Postgres).
  
  const [newTransaction] = await db.insert(transactions).values({
    userId: user.id,
    bankAccountId: parsed.bankAccountId,
    categoryId: parsed.categoryId || null,
    amount: parsed.amount,
    date: parsed.date,
    description: parsed.description,
    type: parsed.type,
  }).returning();

  revalidatePath("/");
  return newTransaction;
}

export async function getTransactions(filters?: { 
  bankAccountId?: string; 
  startDate?: Date; 
  endDate?: Date 
}) {
  const user = await requireUser();

  const conditions = [eq(transactions.userId, user.id)];

  if (filters?.bankAccountId) {
    conditions.push(eq(transactions.bankAccountId, filters.bankAccountId));
  }
  
  if (filters?.startDate) {
    conditions.push(gte(transactions.date, filters.startDate));
  }

  if (filters?.endDate) {
    conditions.push(lte(transactions.date, filters.endDate));
  }

  return await db.query.transactions.findMany({
    where: and(...conditions),
    orderBy: (t) => [desc(t.date), desc(t.createdAt)],
    with: {
      // Assuming relations are defined in schema, if not, we omit 'with' or add relations
      // This will fail typecheck if relations are not exported in schema.
      // Let's omit `with` for now to avoid typescript errors since we didn't add Drizzle relations() block
    }
  });
}

export async function getTransactionById(id: string) {
  const user = await requireUser();

  const transaction = await db.query.transactions.findFirst({
    where: and(eq(transactions.id, id), eq(transactions.userId, user.id)),
  });

  if (!transaction) throw new Error("Transação não encontrada.");
  return transaction;
}

export async function updateTransaction(id: string, data: TransactionInput) {
  const user = await requireUser();
  const parsed = transactionSchema.parse(data);

  // Validate that the bank account belongs to the user
  const account = await db.query.bankAccounts.findFirst({
    where: and(eq(bankAccounts.id, parsed.bankAccountId), eq(bankAccounts.userId, user.id)),
  });

  if (!account) {
    throw new Error("Conta bancária inválida ou não encontrada.");
  }

  const [updatedTransaction] = await db.update(transactions)
    .set({
      bankAccountId: parsed.bankAccountId,
      categoryId: parsed.categoryId || null,
      amount: parsed.amount,
      date: parsed.date,
      description: parsed.description,
      type: parsed.type,
      updatedAt: new Date(),
    })
    .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)))
    .returning();

  if (!updatedTransaction) throw new Error("Transação não encontrada.");

  revalidatePath("/");
  return updatedTransaction;
}

export async function deleteTransaction(id: string) {
  const user = await requireUser();

  const [deletedTransaction] = await db.delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)))
    .returning();

  if (!deletedTransaction) throw new Error("Transação não encontrada.");

  revalidatePath("/");
  return deletedTransaction;
}
