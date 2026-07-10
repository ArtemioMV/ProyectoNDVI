import { formatPaymentReceiptCode } from "./receipt-code";

describe("formatPaymentReceiptCode", () => {
  it("formats payment receipt codes with year and padded sequence", () => {
    expect(formatPaymentReceiptCode(7, new Date("2026-07-08T00:00:00.000Z"))).toBe("T-2026-000007");
  });

  it("does not truncate larger sequences", () => {
    expect(formatPaymentReceiptCode(1234567, new Date("2026-07-08T00:00:00.000Z"))).toBe("T-2026-1234567");
  });
});
