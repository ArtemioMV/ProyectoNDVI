import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Download, FileText, Mail, MessageCircle, Printer, ReceiptText, RotateCcw } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { paymentMethodLabels } from "@/constants/payment-methods";
import { emptyPayments, paidTotal, paymentEvidences, PaymentSplit, type PaymentsState, primaryMethod } from "@/components/pos/PaymentSplit";
import { TextareaField } from "@/components/ui/FormControls";
import { fetchCustomerPaymentHistory, fetchPaymentTicket, registerPayment, voidPayment } from "../api/payments.api";
import type { MonthlyFee, Payment, PaymentTicket } from "../types/payments.types";
import { money } from "@/lib/format";

type CustomerFinancePanelProps = { customerId: string; showContractButton?: boolean };
type VoidState = { payment: Payment; fee: MonthlyFee } | null;

const statusLabels: Record<MonthlyFee["status"], string> = {
  PENDING: "Pendiente",
  PARTIAL: "Parcial",
  PAID: "Pagado",
  VOID: "Anulado"
};


function dateTime(value: string) {
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function statusBadge(status: MonthlyFee["status"]) {
  const styles: Record<MonthlyFee["status"], string> = {
    PENDING: "bg-yellow-50 text-yellow-700",
    PARTIAL: "bg-blue-50 text-blue-700",
    PAID: "bg-green-50 text-green-700",
    VOID: "bg-slate-100 text-slate-600"
  };
  return <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", styles[status])}>{statusLabels[status]}</span>;
}

function paymentStatusBadge(status: Payment["status"]) {
  return <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", status === "VALID" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600")}>{status === "VALID" ? "Valido" : "Anulado"}</span>;
}

function ticketText(ticket: PaymentTicket) {
  return [
    `Ticket ${ticket.receiptCode}`,
    `Cliente: ${ticket.customer.fullName}`,
    `Periodo: ${ticket.monthlyFee.period} - ${ticket.service.plan.name}`,
    `Importe: ${money(ticket.amount)}`,
    `Metodo: ${paymentMethodLabels[ticket.method]}`,
    `Saldo pendiente: ${money(ticket.monthlyFee.balance)}`,
    `Estado: ${ticket.status === "VALID" ? "Valido" : "Anulado"}`
  ].join("\n");
}

function TicketModal({ ticket, onClose }: { ticket: PaymentTicket | null; onClose: () => void }) {
  function downloadTicket() {
    if (!ticket) return;
    const blob = new Blob([ticketText(ticket)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${ticket.receiptCode}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function sendEmail() {
    if (!ticket) return;
    window.location.href = `mailto:?subject=${encodeURIComponent(`Ticket ${ticket.receiptCode}`)}&body=${encodeURIComponent(ticketText(ticket))}`;
  }

  function sendWhatsapp() {
    if (!ticket) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(ticketText(ticket))}`, "_blank", "noopener,noreferrer");
  }

  return (
    <AppModal open={Boolean(ticket)} title="Ticket de pago" description={ticket ? ticket.receiptCode : undefined} onClose={onClose} size="sm">
      {ticket ? (
        <div className="space-y-4">
          <div className="rounded-md border bg-background p-4 text-sm">
            <div className="mb-3 flex items-center gap-2 font-medium"><ReceiptText className="h-4 w-4" /> Ticket {ticket.receiptCode}</div>
            <div className="grid gap-2 text-slate-600">
              <p>Cliente: <span className="text-slate-900">{ticket.customer.fullName}</span></p>
              <p>Periodo: <span className="text-slate-900">{ticket.monthlyFee.period} - {ticket.service.plan.name}</span></p>
              <p>Importe: <span className="text-slate-900">{money(ticket.amount)}</span></p>
              <p>Metodo: <span className="text-slate-900">{paymentMethodLabels[ticket.method]}</span></p>
              <p>Saldo pendiente: <span className="text-slate-900">{money(ticket.monthlyFee.balance)}</span></p>
              <p>Estado: {paymentStatusBadge(ticket.status)}</p>
              {ticket.notes ? <p>Notas: <span className="text-slate-900">{ticket.notes}</span></p> : null}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Button type="button" variant="secondary" icon={<Download className="h-4 w-4" />} onClick={downloadTicket}>Descargar</Button>
            <Button type="button" variant="secondary" icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>Imprimir</Button>
            <Button type="button" variant="secondary" icon={<Mail className="h-4 w-4" />} onClick={sendEmail}>Correo</Button>
            <Button type="button" variant="secondary" icon={<MessageCircle className="h-4 w-4" />} onClick={sendWhatsapp}>WhatsApp</Button>
          </div>
        </div>
      ) : null}
    </AppModal>
  );
}

export function CustomerFinancePanel({ customerId, showContractButton = true }: CustomerFinancePanelProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [openFeeId, setOpenFeeId] = useState<string | null>(null);
  const [monthlyFeeId, setMonthlyFeeId] = useState("");
  const [payments, setPayments] = useState<PaymentsState>(emptyPayments);
  const [notes, setNotes] = useState("");
  const [ticket, setTicket] = useState<PaymentTicket | null>(null);
  const [voidState, setVoidState] = useState<VoidState>(null);
  const [voidReason, setVoidReason] = useState("");

  const historyQuery = useQuery({
    queryKey: ["customer-payment-history", customerId],
    queryFn: () => fetchCustomerPaymentHistory(customerId)
  });

  const pendingFees = useMemo(() => (historyQuery.data?.fees ?? []).filter((fee) => fee.balance > 0), [historyQuery.data?.fees]);
  const selectedFee = pendingFees.find((fee) => fee.id === monthlyFeeId);

  const paymentMutation = useMutation({
    mutationFn: () => registerPayment({ monthlyFeeId, amount: paidTotal(payments), method: primaryMethod(payments), notes: notes || undefined, evidences: paymentEvidences(payments) }),
    onSuccess: (createdTicket) => {
      setTicket(createdTicket);
      setMonthlyFeeId("");
      setPayments(emptyPayments);
      setNotes("");
      void queryClient.invalidateQueries({ queryKey: ["customer-payment-history", customerId] });
      void queryClient.invalidateQueries({ queryKey: ["cash-register"] });
    }
  });

  const ticketMutation = useMutation({ mutationFn: (paymentId: string) => fetchPaymentTicket(paymentId), onSuccess: setTicket });

  const voidMutation = useMutation({
    mutationFn: () => voidPayment(voidState!.payment.id, { reason: voidReason || undefined }),
    onSuccess: (voidedTicket) => {
      setTicket(voidedTicket);
      setVoidState(null);
      setVoidReason("");
      void queryClient.invalidateQueries({ queryKey: ["customer-payment-history", customerId] });
      void queryClient.invalidateQueries({ queryKey: ["cash-register"] });
    }
  });

  function toggleFee(fee: MonthlyFee) {
    const nextOpen = openFeeId === fee.id ? null : fee.id;
    setOpenFeeId(nextOpen);
    if (nextOpen && fee.balance > 0) {
      setMonthlyFeeId(fee.id);
      setPayments({ ...emptyPayments, CASH: { enabled: true, amount: fee.balance } });
      setNotes("");
    }
  }

  function submitPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!monthlyFeeId || paidTotal(payments) <= 0) return;
    paymentMutation.mutate();
  }

  function submitVoid(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!voidState) return;
    voidMutation.mutate();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-sm">
        <span className="text-slate-500">Deuda total</span>
        <span className="font-medium">{money(historyQuery.data?.totalDebt ?? 0)}</span>
        {showContractButton ? (
          <Button type="button" size="sm" variant="secondary" icon={<FileText className="h-4 w-4" />} onClick={() => navigate(`/clientes/${customerId}/contrato`)}>
            Ver contrato
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-md border bg-background">
        {historyQuery.isLoading ? <div className="p-3 text-sm text-slate-500">Cargando mensualidades...</div> : null}
        {!historyQuery.isLoading && (historyQuery.data?.fees.length ?? 0) === 0 ? <div className="p-3 text-sm text-slate-500">No hay mensualidades generadas.</div> : null}
        <div className="divide-y">
          {(historyQuery.data?.fees ?? []).map((fee) => {
            const open = openFeeId === fee.id;
            return (
              <article key={fee.id}>
                <button type="button" className="flex w-full items-start justify-between gap-3 px-3 py-2.5 text-left hover:bg-muted/40" onClick={() => toggleFee(fee)}>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{fee.period}</p>
                    <p className="text-sm text-slate-500">{fee.service.plan.name}</p>
                    <p className="mt-1 text-sm text-slate-600">Monto {money(fee.amount)} | Pagado {money(fee.paidAmount)} | Saldo {money(fee.balance)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {statusBadge(fee.status)}
                    <ChevronDown className={cn("h-4 w-4 text-slate-400 transition", open && "rotate-180")} />
                  </div>
                </button>

                {open ? (
                  <div className="space-y-2 border-t bg-muted/20 p-2.5">
                    {fee.balance > 0 && selectedFee?.id === fee.id ? (
                      <form className="space-y-2 rounded-md border bg-background p-2.5" onSubmit={submitPayment}>
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="text-slate-500">Saldo a pagar</span>
                          <span className="font-medium">{money(selectedFee.balance)}</span>
                        </div>
                        <PaymentSplit payments={payments} onChange={setPayments} total={selectedFee.balance} />
                        <TextareaField label="Nota" value={notes} onChange={(event) => setNotes(event.target.value)} />
                        <div className="flex justify-end">
                          <Button disabled={paymentMutation.isPending} type="submit">Confirmar pago</Button>
                        </div>
                      </form>
                    ) : null}

                    {fee.payments.length === 0 ? <p className="text-sm text-slate-500">Este periodo aun no tiene abonos.</p> : null}
                    {fee.payments.length > 0 ? (
                      <div className="grid gap-2">
                        {fee.payments.map((payment) => (
                          <div key={payment.id} className="rounded-md border bg-background p-2.5 text-sm">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-medium">{payment.receiptCode}</p>
                                <p className="text-xs text-slate-500">{dateTime(payment.paidAt)} - {paymentMethodLabels[payment.method]}</p>
                                <p className="mt-1 text-slate-700">{money(payment.amount)}</p>
                              </div>
                              {paymentStatusBadge(payment.status)}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Button size="sm" variant="secondary" icon={<ReceiptText className="h-4 w-4" />} onClick={() => ticketMutation.mutate(payment.id)}>Ticket</Button>
                              <Button size="sm" variant="danger" disabled={payment.status === "VOID"} icon={<RotateCcw className="h-4 w-4" />} onClick={() => setVoidState({ payment, fee })}>Anular</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>

      <TicketModal ticket={ticket} onClose={() => setTicket(null)} />

      <AppModal open={Boolean(voidState)} title="Anular pago" description={voidState ? `Ticket ${voidState.payment.receiptCode}` : undefined} onClose={() => setVoidState(null)} size="md">
        {voidState ? (
          <form className="space-y-4" onSubmit={submitVoid}>
            <p className="text-sm text-slate-600">Se recalculara el saldo del periodo y se registrara el reverso en caja abierta.</p>
            <TextareaField label="Motivo" value={voidReason} onChange={(event) => setVoidReason(event.target.value)} placeholder="Motivo de anulacion" />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setVoidState(null)}>Cancelar</Button>
              <Button type="submit" variant="danger" disabled={voidMutation.isPending}>Anular pago</Button>
            </div>
          </form>
        ) : null}
      </AppModal>
    </div>
  );
}
