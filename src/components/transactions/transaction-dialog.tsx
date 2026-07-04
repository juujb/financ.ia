"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTransaction } from "@/app/actions/transactions";
import { toast } from "sonner";

interface Account {
  id: string;
  name: string;
  bank: string | null;
}

interface TransactionDialogProps {
  trigger: React.ReactNode;
  accounts: Account[];
}

export function TransactionDialog({ trigger, accounts }: TransactionDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [bankAccountId, setBankAccountId] = useState(accounts[0]?.id ?? "");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!description.trim()) errs.description = "A descrição é obrigatória";
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)
      errs.amount = "Informe um valor válido";
    if (!bankAccountId) errs.bankAccountId = "Selecione uma conta";
    if (!date) errs.date = "Informe a data";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      await createTransaction({
        description,
        amount,
        type,
        bankAccountId,
        date: new Date(date + "T12:00:00"),
      });
      toast.success("Transação registrada com sucesso!");
      setOpen(false);
      resetForm();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ocorreu um erro.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setDescription(""); setAmount(""); setType("expense");
    setBankAccountId(accounts[0]?.id ?? "");
    setDate(new Date().toISOString().split("T")[0]);
    setErrors({});
  }

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (!val) resetForm();
  }

  return (
    <>
      <span onClick={() => setOpen(true)} style={{ display: "contents" }}>
        {trigger}
      </span>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
            <DialogDescription>
              Registre uma receita ou despesa em uma de suas contas.
            </DialogDescription>
          </DialogHeader>

          <form id="transaction-form" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-4 py-4">
              {/* Type toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-all ${
                    type === "expense"
                      ? "border-destructive bg-destructive/10 text-destructive"
                      : "border-border hover:bg-muted"
                  }`}
                  aria-pressed={type === "expense"}
                >
                  <span className="text-base">↓</span>
                  Despesa
                </button>
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-all ${
                    type === "income"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-border hover:bg-muted"
                  }`}
                  aria-pressed={type === "income"}
                >
                  <span className="text-base">↑</span>
                  Receita
                </button>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="tx-description">Descrição *</Label>
                <Input
                  id="tx-description"
                  placeholder="Ex: Supermercado, Salário..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  aria-invalid={!!errors.description}
                />
                {errors.description && <p className="text-xs text-destructive" role="alert">{errors.description}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="tx-amount">Valor (R$) *</Label>
                <Input
                  id="tx-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  aria-invalid={!!errors.amount}
                />
                {errors.amount && <p className="text-xs text-destructive" role="alert">{errors.amount}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="tx-account-trigger">Conta *</Label>
                {accounts.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    Nenhuma conta cadastrada.{" "}
                    <a href="/contas" className="text-primary underline">Criar conta</a>
                  </p>
                ) : (
                  <Select
                    value={bankAccountId}
                    onValueChange={(v) => { if (v) setBankAccountId(v); }}
                  >
                    <SelectTrigger id="tx-account-trigger" aria-label="Selecionar conta">
                      <SelectValue placeholder="Selecione a conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name}{acc.bank ? ` — ${acc.bank}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.bankAccountId && <p className="text-xs text-destructive" role="alert">{errors.bankAccountId}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="tx-date">Data *</Label>
                <Input
                  id="tx-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  aria-invalid={!!errors.date}
                />
                {errors.date && <p className="text-xs text-destructive" role="alert">{errors.date}</p>}
              </div>
            </div>
          </form>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="transaction-form"
              disabled={loading || accounts.length === 0}
            >
              {loading ? "Salvando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
