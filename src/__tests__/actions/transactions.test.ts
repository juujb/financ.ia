import { createTransaction, getTransactions, deleteTransaction } from "@/app/actions/transactions";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

jest.mock("@/lib/db", () => ({
  db: {
    insert: jest.fn(),
    query: {
      transactions: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
      bankAccounts: {
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
  name: "Conta Corrente",
  bank: "Nubank",
  type: "checking",
  balance: "5000.00",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const MOCK_TRANSACTION = {
  id: "uuid-tx-1",
  userId: "user-clerk-123",
  bankAccountId: "uuid-acc-1",
  categoryId: null,
  amount: "150.00",
  date: new Date("2026-07-01"),
  description: "Supermercado Extra",
  type: "expense" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Transaction Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (requireUser as jest.Mock).mockResolvedValue(MOCK_USER);
  });

  // Journey 4: Criar transação
  describe("createTransaction", () => {
    it("should create a transaction with valid data", async () => {
      (db.query.bankAccounts.findFirst as jest.Mock).mockResolvedValue(MOCK_ACCOUNT);
      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([MOCK_TRANSACTION]),
      };
      (db.insert as jest.Mock).mockReturnValue(mockInsert);

      const result = await createTransaction({
        bankAccountId: "uuid-acc-1",
        amount: "150.00",
        date: new Date("2026-07-01"),
        description: "Supermercado Extra",
        type: "expense",
      });

      expect(result.description).toBe("Supermercado Extra");
      expect(result.type).toBe("expense");
    });

    it("should throw when bank account does not belong to user", async () => {
      (db.query.bankAccounts.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        createTransaction({
          bankAccountId: "other-user-account",
          amount: "100.00",
          date: new Date(),
          description: "Test",
          type: "income",
        })
      ).rejects.toThrow("Conta bancária inválida ou não encontrada.");
    });

    it("should throw when description is empty", async () => {
      (db.query.bankAccounts.findFirst as jest.Mock).mockResolvedValue(MOCK_ACCOUNT);

      await expect(
        createTransaction({
          bankAccountId: "uuid-acc-1",
          amount: "100.00",
          date: new Date(),
          description: "",
          type: "income",
        })
      ).rejects.toThrow();
    });

    it("should accept income type", async () => {
      const incomeTransaction = { ...MOCK_TRANSACTION, type: "income" as const, amount: "3000.00" };
      (db.query.bankAccounts.findFirst as jest.Mock).mockResolvedValue(MOCK_ACCOUNT);
      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([incomeTransaction]),
      };
      (db.insert as jest.Mock).mockReturnValue(mockInsert);

      const result = await createTransaction({
        bankAccountId: "uuid-acc-1",
        amount: "3000.00",
        date: new Date("2026-07-01"),
        description: "Salário",
        type: "income",
      });

      expect(result.type).toBe("income");
    });

    it("should use userId from authenticated user", async () => {
      (db.query.bankAccounts.findFirst as jest.Mock).mockResolvedValue(MOCK_ACCOUNT);
      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([MOCK_TRANSACTION]),
      };
      (db.insert as jest.Mock).mockReturnValue(mockInsert);

      await createTransaction({
        bankAccountId: "uuid-acc-1",
        amount: "150.00",
        date: new Date("2026-07-01"),
        description: "Test",
        type: "expense",
      });

      const insertValues = (db.insert as jest.Mock).mock.results[0].value.values.mock.calls[0][0];
      expect(insertValues.userId).toBe(MOCK_USER.id);
    });
  });

  // Journey 5: Listar transações
  describe("getTransactions", () => {
    it("should return transactions for authenticated user", async () => {
      (db.query.transactions.findMany as jest.Mock).mockResolvedValue([MOCK_TRANSACTION]);

      const result = await getTransactions();

      expect(result).toHaveLength(1);
      expect(result[0].description).toBe("Supermercado Extra");
    });

    it("should return empty array when user has no transactions", async () => {
      (db.query.transactions.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getTransactions();

      expect(result).toEqual([]);
    });

    it("should filter by bankAccountId when provided", async () => {
      (db.query.transactions.findMany as jest.Mock).mockResolvedValue([MOCK_TRANSACTION]);

      const result = await getTransactions({ bankAccountId: "uuid-acc-1" });

      expect(result).toHaveLength(1);
      expect(db.query.transactions.findMany).toHaveBeenCalled();
    });
  });

  // Journey 5: Excluir transação
  describe("deleteTransaction", () => {
    it("should delete a transaction and return the record", async () => {
      const mockDelete = {
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([MOCK_TRANSACTION]),
      };
      (db.delete as jest.Mock).mockReturnValue(mockDelete);

      const result = await deleteTransaction("uuid-tx-1");

      expect(result.id).toBe("uuid-tx-1");
    });

    it("should throw when transaction to delete is not found", async () => {
      const mockDelete = {
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      };
      (db.delete as jest.Mock).mockReturnValue(mockDelete);

      await expect(deleteTransaction("ghost-id")).rejects.toThrow("Transação não encontrada.");
    });
  });
});
