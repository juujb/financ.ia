"use client";

import { Landmark, Wallet, PiggyBank, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BankAccountDialog } from "@/components/accounts/bank-account-dialog";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { deleteBankAccount } from "@/app/actions/bank-accounts";
import { toast } from "sonner";

const typeConfig = {
  checking: {
    label: "Corrente",
    icon: Landmark,
    badgeVariant: "default" as const,
    gradient: "from-blue-500/10 to-indigo-500/5",
    iconColor: "text-blue-500",
  },
  savings: {
    label: "Poupança",
    icon: PiggyBank,
    badgeVariant: "secondary" as const,
    gradient: "from-emerald-500/10 to-green-500/5",
    iconColor: "text-emerald-500",
  },
  digital_wallet: {
    label: "Carteira Digital",
    icon: Wallet,
    badgeVariant: "outline" as const,
    gradient: "from-purple-500/10 to-violet-500/5",
    iconColor: "text-purple-500",
  },
};

interface AccountCardProps {
  account: {
    id: string;
    name: string;
    bank: string | null;
    type: "checking" | "savings" | "digital_wallet";
    balance: string;
  };
}

export function AccountCard({ account }: AccountCardProps) {
  const config = typeConfig[account.type] ?? typeConfig.checking;
  const Icon = config.icon;
  const balance = parseFloat(account.balance);
  const isNegative = balance < 0;

  const formattedBalance = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(balance);

  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.01]">
      {/* Gradient accent */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />

      <CardHeader className="relative pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              <Icon className={`h-5 w-5 ${config.iconColor}`} />
            </div>
            <div>
              <p className="font-semibold leading-tight">{account.name}</p>
              {account.bank && (
                <p className="text-xs text-muted-foreground">{account.bank}</p>
              )}
            </div>
          </div>
          <Badge variant={config.badgeVariant} className="text-[11px]">
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Saldo disponível</p>
            <p className={`text-2xl font-bold tracking-tight tabular-nums ${
              isNegative ? "text-destructive" : "text-foreground"
            }`}>
              {formattedBalance}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <BankAccountDialog
              account={account}
              trigger={
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  aria-label={`Editar conta ${account.name}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              }
            />
            <ConfirmDeleteDialog
              title="Excluir conta bancária?"
              description={`A conta "${account.name}" e todas as suas transações serão excluídas permanentemente. Esta ação não pode ser desfeita.`}
              onConfirm={async () => {
                await deleteBankAccount(account.id);
                toast.success("Conta excluída com sucesso!");
              }}
              trigger={
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  aria-label={`Excluir conta ${account.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
