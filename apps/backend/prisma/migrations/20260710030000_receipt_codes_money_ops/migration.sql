-- Codigos de ticket propios para operaciones que mueven dinero (V-/C-/G-/M-)
ALTER TABLE "MaterialSale" ADD COLUMN "receiptCode" TEXT;
CREATE UNIQUE INDEX "MaterialSale_receiptCode_key" ON "MaterialSale"("receiptCode");

ALTER TABLE "MaterialPurchase" ADD COLUMN "receiptCode" TEXT;
CREATE UNIQUE INDEX "MaterialPurchase_receiptCode_key" ON "MaterialPurchase"("receiptCode");

ALTER TABLE "Expense" ADD COLUMN "receiptCode" TEXT;
CREATE UNIQUE INDEX "Expense_receiptCode_key" ON "Expense"("receiptCode");

ALTER TABLE "CashMovement" ADD COLUMN "receiptCode" TEXT;
CREATE UNIQUE INDEX "CashMovement_receiptCode_key" ON "CashMovement"("receiptCode");
