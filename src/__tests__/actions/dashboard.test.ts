import { getDashboardSummary } from "@/app/actions/dashboard";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

jest.mock("@/lib/db", () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  },
}));

jest.mock("@/lib/auth", () => ({
  requireUser: jest.fn(),
}));

describe("Dashboard Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should calculate the dashboard summary correctly", async () => {
    (requireUser as jest.Mock).mockResolvedValue({ id: "user-1" });
    
    // Mock for bank accounts total balance
    const dbMock = db as any;
    dbMock.where.mockResolvedValueOnce([{ value: "1000.50" }]); // balance
    dbMock.where.mockResolvedValueOnce([{ value: "5000.00" }]); // income
    dbMock.where.mockResolvedValueOnce([{ value: "2500.00" }]); // expense

    const summary = await getDashboardSummary();

    expect(requireUser).toHaveBeenCalled();
    expect(summary).toEqual({
      balance: 1000.5,
      monthlyIncome: 5000,
      monthlyExpense: 2500,
    });
  });
});
