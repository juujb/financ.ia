"use client";

import { ArrowUpCircle, ArrowDownCircle, Trash2, Calendar, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { deleteTransaction } from "@/app/actions/transactions";
import { toast } from "sonner";

interface Transaction {
  id: string;
  description: string;
  amount: string;
  type: "income" | "expense";
  date: Date;
  bankAccount: { name: string; bank: string | null } | null;
}

interface TransactionTableProps {
  transactions: Transaction[];
}

const formatCurrency = (value: string | number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    parseFloat(value.toString())
  );

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(date)
  );

export function TransactionTable({ transactions }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-3">
          <ArrowDownCircle className="h-6 w-6 text-muted-foreground" />
        </div>
        <h2 className="font-semibold">Nenhuma transação</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Registre sua primeira receita ou despesa.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b bg-muted/30 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span>Descrição</span>
        <span className="hidden sm:block text-center">Data</span>
        <span className="text-center">Tipo</span>
        <span className="text-right">Valor</span>
      </div>

      {/* Rows */}
      <ul role="list" className="divide-y">
        {transactions.map((tx) => {
          const isIncome = tx.type === "income";

          return (
            <li key={tx.id} className="group grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-4 py-3.5 hover:bg-muted/20 transition-colors">
              {/* Description + account */}
              <div className="min-w-0">
                <p className="font-medium truncate text-sm">{tx.description}</p>
                {tx.bankAccount && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Building2 className="h-3 w-3 shrink-0" />
                    <span className="truncate">
                      {tx.bankAccount.name}
                      {tx.bankAccount.bank ? ` · ${tx.bankAccount.bank}` : ""}
                    </span>
                  </p>
                )}
              </div>

              {/* Date */}
              <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                <Calendar className="h-3 w-3 shrink-0" />
                {formatDate(tx.date)}
              </div>

              {/* Type badge */}
              <div className="flex justify-center">
                {isIncome ? (
                  <Badge className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">
                    <ArrowUpCircle className="h-3 w-3" />
                    Receita
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1 bg-red-500/10 text-destructive border-destructive/20 hover:bg-red-500/20">
                    <ArrowDownCircle className="h-3 w-3" />
                    Despesa
                  </Badge>
                )}
              </div>

              {/* Amount + delete */}
              <div className="flex items-center gap-2 justify-end">
                <span className={`text-sm font-semibold tabular-nums ${
                  isIncome
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-destructive"
                }`}>
                  {isIncome ? "+" : "-"}
                  {formatCurrency(tx.amount)}
                </span>
                <ConfirmDeleteDialog
                  title="Excluir transação?"
                  description={`A transação "${tx.description}" será excluída permanentemente.`}
                  onConfirm={async () => {
                    await deleteTransaction(tx.id);
                    toast.success("Transação excluída!");
                  }}
                  trigger={
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      aria-label={`Excluir transação ${tx.description}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  }
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
