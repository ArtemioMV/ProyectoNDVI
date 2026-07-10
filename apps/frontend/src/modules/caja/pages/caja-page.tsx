import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Banknote, History, LockKeyhole, Plus, WalletCards } from "lucide-react";
import { useState } from "react";
import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/Button";
import { DataLoader } from "@/components/ui/DataLoader";
import { DisclosurePanel, MetricCard } from "@/components/ui/Panels";
import { closeCashRegister, createCashMovement, fetchCashRegisterHistory, fetchCurrentCashRegister, openCashRegister, reopenCashRegister } from "../api/cash-register.api";
import { CashMovementForm } from "../components/CashMovementForm";
import { CloseCashRegisterForm } from "../components/CloseCashRegisterForm";
import { OpenCashRegisterForm } from "../components/OpenCashRegisterForm";
import { CashHistoryList, CashMovementList, CashRegisterSummary } from "../components/CashRegisterViews";
import type { CashRegister, CloseCashRegisterPayload, CreateCashMovementPayload, OpenCashRegisterPayload } from "../types/cash-register.types";
import { money } from "@/lib/format";


export function CajaPage() {
  const queryClient = useQueryClient();
  const [openPanel, setOpenPanel] = useState(false);
  const [movementPanel, setMovementPanel] = useState(false);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [reopenTarget, setReopenTarget] = useState<CashRegister | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const currentQuery = useQuery({ queryKey: ["cash-register", "current"], queryFn: fetchCurrentCashRegister });
  const historyQuery = useQuery({ queryKey: ["cash-register", "history"], queryFn: fetchCashRegisterHistory });
  const currentCash = currentQuery.data ?? null;

  function refreshCash() {
    void queryClient.invalidateQueries({ queryKey: ["cash-register"] });
  }

  const openMutation = useMutation({
    mutationFn: (payload: OpenCashRegisterPayload) => openCashRegister(payload),
    onSuccess: () => {
      setFeedback("Caja abierta correctamente.");
      setOpenPanel(false);
      refreshCash();
    },
    onError: () => setFeedback("No se pudo abrir caja. Verifica si ya existe una caja abierta.")
  });

  const movementMutation = useMutation({
    mutationFn: (payload: CreateCashMovementPayload) => createCashMovement(currentCash!.id, payload),
    onSuccess: () => {
      setFeedback("Movimiento de caja registrado.");
      setMovementPanel(false);
      refreshCash();
    },
    onError: () => setFeedback("No se pudo registrar el movimiento. Revisa monto y descripcion.")
  });

  const closeMutation = useMutation({
    mutationFn: (payload: CloseCashRegisterPayload) => closeCashRegister(currentCash!.id, payload),
    onSuccess: () => {
      setFeedback("Caja cerrada correctamente.");
      setCloseModalOpen(false);
      refreshCash();
    },
    onError: () => setFeedback("No se pudo cerrar caja. Verifica que siga abierta.")
  });

  const reopenMutation = useMutation({
    mutationFn: (cashRegister: CashRegister) => reopenCashRegister(cashRegister.id),
    onSuccess: () => {
      setFeedback("Caja reabierta para correcciones.");
      setReopenTarget(null);
      refreshCash();
    },
    onError: () => setFeedback("No se pudo reabrir: cierra primero la caja abierta actual.")
  });

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Caja</h1>
          <p className="text-sm text-slate-500">Control de apertura, ingresos, egresos, pagos recibidos y cierre diario.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!currentCash ? <Button type="button" icon={<WalletCards className="h-4 w-4" />} onClick={() => setOpenPanel((value) => !value)}>Abrir caja</Button> : null}
          {currentCash ? <Button type="button" variant="secondary" icon={<Plus className="h-4 w-4" />} onClick={() => setMovementPanel((value) => !value)}>Movimiento</Button> : null}
          {currentCash ? <Button type="button" variant="danger" icon={<LockKeyhole className="h-4 w-4" />} onClick={() => setCloseModalOpen(true)}>Cerrar caja</Button> : null}
        </div>
      </div>

      {feedback ? <div className="rounded-md border bg-background px-3 py-2 text-sm text-slate-700">{feedback}</div> : null}

      {currentQuery.isLoading ? <DataLoader className="rounded-lg border bg-background" /> : null}

      {!currentQuery.isLoading && currentCash ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard label="Inicial" value={money(currentCash.initialAmount)} icon={<WalletCards className="h-4 w-4" />} />
            <MetricCard label="Esperado" value={money(currentCash.expectedAmount)} icon={<Banknote className="h-4 w-4" />} tone="success" />
            <MetricCard label="Movimientos" value={currentCash.movements.length} icon={<History className="h-4 w-4" />} />
          </div>
          <CashRegisterSummary cashRegister={currentCash} />
        </>
      ) : null}

      {!currentQuery.isLoading && !currentCash ? (
        <DisclosurePanel title="Abrir caja" description="No hay caja abierta. Abre caja para registrar pagos y movimientos." open={openPanel || !currentCash} onToggle={() => setOpenPanel((value) => !value)}>
          <OpenCashRegisterForm isSubmitting={openMutation.isPending} onSubmit={(payload) => openMutation.mutate(payload)} />
        </DisclosurePanel>
      ) : null}

      {currentCash ? (
        <div className="space-y-4">
          <DisclosurePanel title="Registrar movimiento" description="Ingreso o egreso manual, independiente de pagos automaticos." open={movementPanel} onToggle={() => setMovementPanel((value) => !value)}>
            <CashMovementForm isSubmitting={movementMutation.isPending} onSubmit={(payload) => movementMutation.mutate(payload)} />
          </DisclosurePanel>
          <CashMovementList movements={currentCash.movements} />
        </div>
      ) : null}

      {historyQuery.isLoading ? <DataLoader label="Cargando historial..." className="rounded-lg border bg-background" /> : (
        <CashHistoryList
          cashRegisters={historyQuery.data ?? []}
          onReopen={currentCash ? undefined : (cashRegister) => setReopenTarget(cashRegister)}
          reopeningId={reopenMutation.isPending ? reopenTarget?.id ?? null : null}
        />
      )}

      <AppModal
        open={closeModalOpen && Boolean(currentCash)}
        size="sm"
        title="Cerrar caja"
        description="Accion irreversible desde este panel: cuenta el efectivo fisico antes de confirmar."
        onClose={() => setCloseModalOpen(false)}
      >
        {currentCash ? (
          <CloseCashRegisterForm expectedAmount={currentCash.expectedAmount} isSubmitting={closeMutation.isPending} onSubmit={(payload) => closeMutation.mutate(payload)} />
        ) : null}
      </AppModal>

      <AppModal
        open={reopenTarget !== null}
        size="sm"
        title="Reabrir caja"
        description={reopenTarget ? `Cerrada el ${reopenTarget.closedAt ? new Intl.DateTimeFormat("es-PE", { dateStyle: "short", timeStyle: "short" }).format(new Date(reopenTarget.closedAt)) : "-"}` : undefined}
        onClose={() => setReopenTarget(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" disabled={reopenMutation.isPending} onClick={() => setReopenTarget(null)}>Volver</Button>
            <Button type="button" disabled={reopenMutation.isPending} onClick={() => reopenTarget && reopenMutation.mutate(reopenTarget)}>
              {reopenMutation.isPending ? "Reabriendo..." : "Reabrir caja"}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          La caja volvera a estado abierto para correcciones: se borra el conteo y la diferencia registrados y tendras que volver a cerrarla. Solo es posible si no hay otra caja abierta.
        </p>
      </AppModal>
    </section>
  );
}
