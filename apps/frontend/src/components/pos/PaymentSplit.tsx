import { useQuery } from "@tanstack/react-query";
import { Paperclip } from "lucide-react";
import { activePaymentMethods, type PaymentMethodConfig, type PaymentMethodKey } from "@/constants/payment-methods";
import { fetchPaymentMethodSettings } from "@/modules/configuracion/api/payment-methods.api";
import { TextField } from "@/components/ui/FormControls";
import { SwitchField } from "@/components/ui/ToggleControls";
import { money } from "@/lib/format";

/**
 * Pago dividido reutilizable (Ventas, Compras y Cobranza): cada metodo con apagador,
 * monto y evidencia cuando el metodo administrado lo exige.
 */
export type { PaymentMethodKey };
export type PayState = { enabled: boolean; amount: number; evidenceName?: string };
export type PaymentsState = Record<PaymentMethodKey, PayState>;

export const PAYMENT_METHODS = activePaymentMethods();

export const emptyPayments: PaymentsState = {
  CASH: { enabled: true, amount: 0 },
  YAPE: { enabled: false, amount: 0 },
  PLIN: { enabled: false, amount: 0 },
  TRANSFER: { enabled: false, amount: 0 },
  CARD: { enabled: false, amount: 0 },
  OTHER: { enabled: false, amount: 0 }
};


export function paidTotal(payments: PaymentsState) {
  return PAYMENT_METHODS.reduce((sum, method) => sum + (payments[method.value].enabled ? payments[method.value].amount : 0), 0);
}

export function primaryMethod(payments: PaymentsState): PaymentMethodKey {
  return (
    PAYMENT_METHODS.filter((method) => payments[method.value].enabled).sort((a, b) => payments[b.value].amount - payments[a.value].amount)[0]?.value ?? "CASH"
  );
}

export function isCashPayment(payments: PaymentsState) {
  return primaryMethod(payments) === "CASH";
}

export function paymentEvidences(payments: PaymentsState) {
  return PAYMENT_METHODS
    .filter((method) => payments[method.value].enabled && payments[method.value].evidenceName)
    .map((method) => ({
      fileName: payments[method.value].evidenceName!,
      url: `local://${payments[method.value].evidenceName}`
    }));
}

export function PaymentSplit({ payments, onChange, total }: { payments: PaymentsState; onChange: (payments: PaymentsState) => void; total: number }) {
  const methodsQuery = useQuery({ queryKey: ["payment-method-settings"], queryFn: fetchPaymentMethodSettings, staleTime: 30000 });
  const configuredMethods: PaymentMethodConfig[] = methodsQuery.data
    ? methodsQuery.data
        .filter((method) => method.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((method) => ({
          value: method.method,
          label: method.label,
          description: method.description ?? "",
          evidence: method.requiresEvidence,
          active: method.isActive,
          order: method.sortOrder
        }))
    : PAYMENT_METHODS;
  const paid = configuredMethods.reduce((sum, method) => sum + (payments[method.value].enabled ? payments[method.value].amount : 0), 0);

  function update(method: PaymentMethodKey, patch: Partial<PayState>) {
    onChange({ ...payments, [method]: { ...payments[method], ...patch } });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
        <span className="font-medium">Pago</span>
        <span className={paid === total && total > 0 ? "font-medium text-green-600" : "text-slate-500"}>
          Pagado {money(paid)} <span className="px-1 text-slate-300">|</span> Total {money(total)}
        </span>
      </div>

      <div className="grid gap-1.5 md:grid-cols-2">
        {configuredMethods.map((method) => {
          const pay = payments[method.value];
          return (
            <div key={method.value} className="min-w-0 rounded-md border bg-background px-2 py-1.5">
              <SwitchField
                className="border-0 bg-transparent px-0 py-0 text-sm"
                label={method.label}
                checked={pay.enabled}
                onChange={(event) => update(method.value, { enabled: event.target.checked })}
              />
              {pay.enabled ? (
                <div className="mt-1.5 grid min-w-0 grid-cols-[minmax(0,1fr)_2rem] items-end gap-1.5">
                  <label className="min-w-0 text-xs font-medium text-slate-600">
                    Monto S/
                    <input
                      className="mt-1 h-9 w-full rounded-md border px-2 text-sm font-normal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      type="number"
                      min={0}
                      step="0.01"
                      value={pay.amount}
                      onChange={(event) => update(method.value, { amount: Math.max(0, Number(event.target.value)) })}
                    />
                  </label>
                  {method.evidence ? (
                    <label
                      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-600 transition hover:bg-muted hover:text-primary"
                      title={pay.evidenceName ? `Cambiar evidencia: ${pay.evidenceName}` : "Adjuntar evidencia"}
                      aria-label={pay.evidenceName ? `Cambiar evidencia de ${method.label}` : `Adjuntar evidencia de ${method.label}`}
                    >
                      <Paperclip className="h-4 w-4" />
                      <input type="file" accept="image/*" className="sr-only" onChange={(event) => update(method.value, { evidenceName: event.target.files?.[0]?.name })} />
                    </label>
                  ) : (
                    <span aria-hidden="true" />
                  )}
                </div>
              ) : null}
              {pay.enabled && pay.evidenceName ? <p className="mt-1 truncate text-xs text-slate-500">Adjunto: {pay.evidenceName}</p> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

