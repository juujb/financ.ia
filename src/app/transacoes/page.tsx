import { getTransactions } from "@/app/actions/transactions";
import { getBankAccounts } from "@/app/actions/bank-accounts";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { TransactionDialog } from "@/components/transactions/transaction-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, ArrowUpCircle, ArrowDownCircle, Scale } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "Transações — financ.ia",
  description: "Histórico completo de receitas e despesas.",
};

export default async function TransacoesPage() {
  const [transactions, accounts] = await Promise.all([
    getTransactions(),
    getBankAccounts(),
  ]);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const balance = totalIncome - totalExpense;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  // Map accounts for the dialog selector
  const accountOptions = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    bank: a.bank,
  }));

  // Map transactions to include bankAccount relation
  const mappedTransactions = transactions.map((t) => ({
    id: t.id,
    description: t.description,
    amount: t.amount,
    type: t.type,
    date: t.date,
    bankAccount: t.bankAccount ?? null,
  }));

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className="container px-4 py-6 md:px-8 md:py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Transações</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {transactions.length === 0
                ? "Nenhuma transação registrada ainda."
                : `${transactions.length} transação${transactions.length > 1 ? "ões" : ""} encontrada${transactions.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <TransactionDialog
            accounts={accountOptions}
            trigger={
              <Button className="gap-2" id="btn-nova-transacao">
                <Plus className="h-4 w-4" />
                Nova Transação
              </Button>
            }
          />
        </div>

        {/* Summary */}
        {transactions.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                    <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total de Receitas</p>
                    <p className="text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(totalIncome)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
                    <ArrowDownCircle className="h-4 w-4 text-destructive" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total de Despesas</p>
                    <p className="text-xl font-bold tabular-nums text-destructive">
                      {formatCurrency(totalExpense)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${balance >= 0 ? "bg-primary/10" : "bg-destructive/10"}`}>
                    <Scale className={`h-4 w-4 ${balance >= 0 ? "text-primary" : "text-destructive"}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Saldo do Período</p>
                    <p className={`text-xl font-bold tabular-nums ${balance >= 0 ? "" : "text-destructive"}`}>
                      {formatCurrency(balance)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Transaction list */}
        <TransactionTable transactions={mappedTransactions} />
      </div>
    </>
  );
}
