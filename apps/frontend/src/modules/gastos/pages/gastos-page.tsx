import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileMinus2, Plus, Tags } from "lucide-react";
import { useMemo, useState } from "react";
import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/FormControls";
import { DisclosurePanel, MetricCard } from "@/components/ui/Panels";
import { createExpense, createExpenseCategory, fetchExpenseCategories, fetchExpenses } from "../api/expenses.api";
import { ExpenseCategoryForm } from "../components/ExpenseCategoryForm";
import { ExpenseForm } from "../components/ExpenseForm";
import { ExpensesList } from "../components/ExpensesList";
import type { CreateExpenseCategoryPayload, CreateExpensePayload } from "../types/expenses.types";
import { money } from "@/lib/format";


function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function GastosPage() {
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState(currentPeriod());
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const categoriesQuery = useQuery({ queryKey: ["expense-categories"], queryFn: fetchExpenseCategories });
  const expensesQuery = useQuery({ queryKey: ["expenses", period], queryFn: () => fetchExpenses(period) });
  const expenses = expensesQuery.data ?? [];

  const summary = useMemo(() => {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const cashTotal = expenses.filter((expense) => expense.paidFromCash).reduce((sum, expense) => sum + expense.amount, 0);
    return { total, cashTotal };
  }, [expenses]);

  const categoryMutation = useMutation({
    mutationFn: (payload: CreateExpenseCategoryPayload) => createExpenseCategory(payload),
    onSuccess: () => {
      setFeedback("Categoria creada correctamente.");
      setCategoryOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
    },
    onError: () => setFeedback("No se pudo crear la categoria. Revisa si ya existe.")
  });

  const expenseMutation = useMutation({
    mutationFn: (payload: CreateExpensePayload) => createExpense(payload),
    onSuccess: () => {
      setFeedback("Gasto registrado correctamente.");
      setExpenseOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["expenses"] });
      void queryClient.invalidateQueries({ queryKey: ["cash-register"] });
    },
    onError: () => setFeedback("No se pudo registrar el gasto. Si se paga desde caja, verifica que haya caja abierta.")
  });

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Gastos</h1>
          <p className="text-sm text-slate-500">Salidas operativas separadas de compras e inventario. Afectan caja y utilidad mensual.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" icon={<FileMinus2 className="h-4 w-4" />} onClick={() => setExpenseOpen(true)}>Nuevo gasto</Button>
          <Button type="button" variant="secondary" icon={<Plus className="h-4 w-4" />} onClick={() => setCategoryOpen(true)}>Categoria</Button>
        </div>
      </div>

      {feedback ? <div className="rounded-md border bg-background px-3 py-2 text-sm text-slate-700">{feedback}</div> : null}

      <div className="grid gap-4 md:grid-cols-4">
        <TextField label="Periodo" type="month" value={period} onChange={(event) => setPeriod(event.target.value)} />
        <MetricCard label="Gastos" value={expenses.length} icon={<FileMinus2 className="h-4 w-4" />} />
        <MetricCard label="Total periodo" value={money(summary.total)} icon={<FileMinus2 className="h-4 w-4" />} tone="warning" />
        <MetricCard label="Egreso caja" value={money(summary.cashTotal)} icon={<Tags className="h-4 w-4" />} tone="warning" />
      </div>

      <DisclosurePanel title="Registrar gasto" description="Alquileres, energia, movilidad, comisiones, utiles u otros gastos no inventariables." open={expenseOpen} onToggle={() => setExpenseOpen((value) => !value)}>
        <ExpenseForm categories={categoriesQuery.data ?? []} isSubmitting={expenseMutation.isPending} onSubmit={(payload) => expenseMutation.mutate(payload)} />
      </DisclosurePanel>

      <ExpensesList expenses={expenses} isLoading={expensesQuery.isLoading} />

      <AppModal
        open={categoryOpen}
        size="sm"
        title="Crear categoria de gasto"
        description="Ordena los gastos para reportes y utilidad mensual."
        onClose={() => setCategoryOpen(false)}
      >
        <ExpenseCategoryForm isSubmitting={categoryMutation.isPending} onSubmit={(payload) => categoryMutation.mutate(payload)} />
      </AppModal>
    </section>
  );
}

