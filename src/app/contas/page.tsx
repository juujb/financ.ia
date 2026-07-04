import { getBankAccounts } from "@/app/actions/bank-accounts";
import { AccountCard } from "@/components/accounts/account-card";
import { BankAccountDialog } from "@/components/accounts/bank-account-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Landmark, TrendingUp, TrendingDown } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "Contas Bancárias — financ.ia",
  description: "Gerencie suas contas bancárias e acompanhe seus saldos.",
};

export default async function ContasPage() {
  const accounts = await getBankAccounts();

  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
  const positiveAccounts = accounts.filter((a) => parseFloat(a.balance) >= 0);
  const negativeAccounts = accounts.filter((a) => parseFloat(a.balance) < 0);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className="container px-4 py-6 md:px-8 md:py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Contas Bancárias</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {accounts.length === 0
                ? "Nenhuma conta cadastrada ainda."
                : `${accounts.length} conta${accounts.length > 1 ? "s" : ""} cadastrada${accounts.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <BankAccountDialog
            trigger={
              <Button className="gap-2" id="btn-nova-conta">
                <Plus className="h-4 w-4" />
                Nova Conta
              </Button>
            }
          />
        </div>

        {/* Summary cards */}
        {accounts.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Landmark className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Saldo Consolidado</p>
                    <p className={`text-xl font-bold tabular-nums ${totalBalance < 0 ? "text-destructive" : ""}`}>
                      {formatCurrency(totalBalance)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Contas Positivas</p>
                    <p className="text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(
                        positiveAccounts.reduce((s, a) => s + parseFloat(a.balance), 0)
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Contas Negativas</p>
                    <p className="text-xl font-bold tabular-nums text-destructive">
                      {negativeAccounts.length > 0
                        ? formatCurrency(
                            negativeAccounts.reduce((s, a) => s + parseFloat(a.balance), 0)
                          )
                        : "R$ 0,00"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Accounts grid */}
        {accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted mb-4">
              <Landmark className="h-7 w-7 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold">Nenhuma conta ainda</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-xs">
              Adicione suas contas bancárias para acompanhar seus saldos e movimentações.
            </p>
            <BankAccountDialog
              trigger={
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Criar primeira conta
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={{
                  id: account.id,
                  name: account.name,
                  bank: account.bank,
                  type: account.type,
                  balance: account.balance,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
