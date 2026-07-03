"use server";

import { db } from "@/lib/db";
import { bankAccounts, transactions } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth";
import { eq, and, gte, sum } from "drizzle-orm";

export async function getDashboardSummary() {
  const user = await requireUser();
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 1. Saldo atual (soma das contas bancárias)
  const [balanceResult] = await db
    .select({ value: sum(bankAccounts.balance) })
    .from(bankAccounts)
    .where(eq(bankAccounts.userId, user.id));

  const totalBalance = balanceResult?.value ? Number(balanceResult.value) : 0;

  // 2. Receitas do mês
  const [incomeResult] = await db
    .select({ value: sum(transactions.amount) })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, user.id),
        eq(transactions.type, "income"),
        gte(transactions.date, firstDayOfMonth)
      )
    );

  const monthlyIncome = incomeResult?.value ? Number(incomeResult.value) : 0;

  // 3. Despesas do mês
  const [expenseResult] = await db
    .select({ value: sum(transactions.amount) })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, user.id),
        eq(transactions.type, "expense"),
        gte(transactions.date, firstDayOfMonth)
      )
    );

  const monthlyExpense = expenseResult?.value ? Number(expenseResult.value) : 0;

  return {
    balance: totalBalance,
    monthlyIncome,
    monthlyExpense,
  };
}
