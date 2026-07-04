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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createBankAccount, updateBankAccount } from "@/app/actions/bank-accounts";
import { toast } from "sonner";

interface BankAccountDialogProps {
  trigger: React.ReactNode;
  account?: {
    id: string;
    name: string;
    bank: string | null;
    type: "checking" | "savings" | "digital_wallet";
    balance: string;
  };
}

export function BankAccountDialog({ trigger, account }: BankAccountDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(account?.name ?? "");
  const [bank, setBank] = useState(account?.bank ?? "");
  const [type, setType] = useState<"checking" | "savings" | "digital_wallet">(
    account?.type ?? "checking"
  );
  const [balance, setBalance] = useState(
    account?.balance ? parseFloat(account.balance).toFixed(2) : "0.00"
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!account;

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "O nome da conta é obrigatório";
    if (isNaN(parseFloat(balance))) errs.balance = "Saldo inválido";
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
      if (isEditing) {
        await updateBankAccount(account.id, { name, bank: bank || undefined, type, balance });
        toast.success("Conta atualizada com sucesso!");
      } else {
        await createBankAccount({ name, bank: bank || undefined, type, balance });
        toast.success("Conta criada com sucesso!");
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ocorreu um erro.");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (!val && !isEditing) {
      setName(""); setBank(""); setType("checking"); setBalance("0.00"); setErrors({});
    }
  }

  return (
    <>
      {/* Wrapper div to capture click and open dialog */}
      <span onClick={() => setOpen(true)} style={{ display: "contents" }}>
        {trigger}
      </span>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Conta" : "Nova Conta Bancária"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Atualize as informações da sua conta bancária."
                : "Adicione uma conta bancária para registrar suas movimentações."}
            </DialogDescription>
          </DialogHeader>

          <form id="bank-account-form" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-4 py-4">
              <div className="grid gap-1.5">
                <Label htmlFor="account-name">Nome da conta *</Label>
                <Input
                  id="account-name"
                  placeholder="Ex: Conta Corrente Nubank"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-xs text-destructive" role="alert">{errors.name}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="account-bank">Banco</Label>
                <Input
                  id="account-bank"
                  placeholder="Ex: Nubank, Itaú..."
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="account-type-trigger">Tipo de conta</Label>
                <Select
                  value={type}
                  onValueChange={(v) => { if (v) setType(v as typeof type); }}
                >
                  <SelectTrigger id="account-type-trigger" aria-label="Tipo de conta">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Conta Corrente</SelectItem>
                    <SelectItem value="savings">Poupança</SelectItem>
                    <SelectItem value="digital_wallet">Carteira Digital</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="account-balance">
                  {isEditing ? "Saldo atual (R$)" : "Saldo inicial (R$)"}
                </Label>
                <Input
                  id="account-balance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  aria-invalid={!!errors.balance}
                />
                {errors.balance && <p className="text-xs text-destructive" role="alert">{errors.balance}</p>}
              </div>
            </div>
          </form>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="bank-account-form" disabled={loading}>
              {loading ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar conta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
