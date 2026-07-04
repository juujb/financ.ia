import { createBankAccount, getBankAccounts, updateBankAccount, deleteBankAccount } from "@/app/actions/bank-accounts";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

// Mock DB and auth
jest.mock("@/lib/db", () => ({
  db: {
    insert: jest.fn(),
    query: {
      bankAccounts: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
    },
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("@/lib/auth", () => ({
  requireUser: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

const MOCK_USER = { id: "user-clerk-123" };

const MOCK_ACCOUNT = {
  id: "uuid-acc-1",
  userId: "user-clerk-123",
  name: "Conta Corrente Nubank",
  bank: "Nubank",
  type: "checking" as const,
  balance: "5000.00",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Bank Account Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (requireUser as jest.Mock).mockResolvedValue(MOCK_USER);
  });

  // Journey 2: Criar conta bancária
  describe("createBankAccount", () => {
    it("should create a bank account with valid data", async () => {
      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([MOCK_ACCOUNT]),
      };
      (db.insert as jest.Mock).mockReturnValue(mockInsert);

      const result = await createBankAccount({
        name: "Conta Corrente Nubank",
        bank: "Nubank",
        type: "checking",
        balance: "5000.00",
      });

      expect(requireUser).toHaveBeenCalled();
      expect(db.insert).toHaveBeenCalled();
      expect(result).toEqual(MOCK_ACCOUNT);
    });

    it("should throw when name is empty", async () => {
      await expect(
        createBankAccount({ name: "", bank: "Nubank", type: "checking", balance: "0" })
      ).rejects.toThrow();
    });

    it("should use userId from authenticated user", async () => {
      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([MOCK_ACCOUNT]),
      };
      (db.insert as jest.Mock).mockReturnValue(mockInsert);

      await createBankAccount({ name: "Test", bank: "Bank", type: "savings", balance: "100" });

      const insertValues = (db.insert as jest.Mock).mock.results[0].value.values.mock.calls[0][0];
      expect(insertValues.userId).toBe(MOCK_USER.id);
    });
  });

  // Journey 2: Listar contas bancárias
  describe("getBankAccounts", () => {
    it("should return accounts for authenticated user", async () => {
      (db.query.bankAccounts.findMany as jest.Mock).mockResolvedValue([MOCK_ACCOUNT]);

      const result = await getBankAccounts();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Conta Corrente Nubank");
    });

    it("should return empty array when user has no accounts", async () => {
      (db.query.bankAccounts.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getBankAccounts();

      expect(result).toEqual([]);
    });
  });

  // Journey 3: Editar conta bancária
  describe("updateBankAccount", () => {
    it("should update account name and balance", async () => {
      const updatedAccount = { ...MOCK_ACCOUNT, name: "Poupança Nubank", balance: "6000.00" };
      const mockUpdate = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedAccount]),
      };
      (db.update as jest.Mock).mockReturnValue(mockUpdate);

      const result = await updateBankAccount("uuid-acc-1", {
        name: "Poupança Nubank",
        bank: "Nubank",
        type: "savings",
        balance: "6000.00",
      });

      expect(result.name).toBe("Poupança Nubank");
      expect(result.balance).toBe("6000.00");
    });

    it("should throw when account is not found", async () => {
      const mockUpdate = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      };
      (db.update as jest.Mock).mockReturnValue(mockUpdate);

      await expect(
        updateBankAccount("non-existent-id", { name: "Test", bank: "Bank", type: "checking", balance: "0" })
      ).rejects.toThrow("Conta bancária não encontrada.");
    });
  });

  // Journey 3: Excluir conta bancária
  describe("deleteBankAccount", () => {
    it("should delete account and return deleted record", async () => {
      const mockDelete = {
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([MOCK_ACCOUNT]),
      };
      (db.delete as jest.Mock).mockReturnValue(mockDelete);

      const result = await deleteBankAccount("uuid-acc-1");

      expect(result.id).toBe("uuid-acc-1");
    });

    it("should throw when account to delete is not found", async () => {
      const mockDelete = {
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      };
      (db.delete as jest.Mock).mockReturnValue(mockDelete);

      await expect(deleteBankAccount("ghost-id")).rejects.toThrow("Conta bancária não encontrada.");
    });
  });
});
