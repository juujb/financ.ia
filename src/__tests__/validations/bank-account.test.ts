import { bankAccountSchema } from "@/lib/validations/bank-account";

describe("bankAccountSchema", () => {
  // Journey 2: validação de cadastro
  it("should accept valid bank account with all fields", () => {
    const result = bankAccountSchema.parse({
      name: "Conta Corrente",
      bank: "Nubank",
      type: "checking",
      balance: "1500.50",
    });

    expect(result.name).toBe("Conta Corrente");
    expect(result.bank).toBe("Nubank");
    expect(result.type).toBe("checking");
    expect(result.balance).toBe("1500.50");
  });

  it("should accept savings type", () => {
    const result = bankAccountSchema.parse({
      name: "Poupança",
      bank: "Caixa",
      type: "savings",
      balance: "500",
    });
    expect(result.type).toBe("savings");
  });

  it("should accept digital_wallet type", () => {
    const result = bankAccountSchema.parse({
      name: "Carteira Digital",
      bank: "PicPay",
      type: "digital_wallet",
      balance: "50",
    });
    expect(result.type).toBe("digital_wallet");
  });

  it("should default balance to '0' when not provided", () => {
    const result = bankAccountSchema.parse({
      name: "Nova Conta",
      bank: "Banco do Brasil",
      type: "checking",
    });
    expect(result.balance).toBe("0");
  });

  it("should accept optional bank field", () => {
    const result = bankAccountSchema.parse({
      name: "Conta Sem Banco",
      type: "checking",
    });
    expect(result.name).toBe("Conta Sem Banco");
  });

  it("should reject empty name", () => {
    expect(() =>
      bankAccountSchema.parse({ name: "", bank: "Nubank", type: "checking" })
    ).toThrow("O nome da conta é obrigatório");
  });

  it("should reject invalid type", () => {
    expect(() =>
      bankAccountSchema.parse({ name: "Test", bank: "Banco", type: "invalid_type" })
    ).toThrow();
  });

  it("should convert numeric balance to string", () => {
    const result = bankAccountSchema.parse({
      name: "Test",
      bank: "Banco",
      type: "checking",
      balance: 1500,
    });
    expect(typeof result.balance).toBe("string");
    expect(result.balance).toBe("1500");
  });
});
