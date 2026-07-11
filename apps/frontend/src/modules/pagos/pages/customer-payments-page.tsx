import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, ReceiptText, RotateCcw, Wallet } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useParams } from "react-router";
import { AppModal } from "@/components/ui/AppModal";
import { paymentMethodLabels } from "@/constants/payment-methods";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { emptyPayments, paidTotal, paymentEvidences, PaymentSplit, type PaymentsState, primaryMethod } from "@/components/pos/PaymentSplit";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { SelectField, TextareaField } from "@/components/ui/FormControls";
import { fetchCustomerContract, fetchCustomerPaymentHistory, fetchPaymentTicket, registerPayment, voidPayment } from "../api/payments.api";
import type { CustomerContract, MonthlyFee, Payment, PaymentTicket } from "../types/payments.types";
import { money, tableDate } from "@/lib/format";

type PayModalState = { fee: MonthlyFee; amount: number } | null;
type VoidModalState = { payment: Payment; fee: MonthlyFee } | null;

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
  const styles = {
    PENDING: "bg-yellow-50 text-yellow-700",
    PARTIAL: "bg-blue-50 text-blue-700",
    PAID: "bg-green-50 text-green-700",
    VOID: "bg-slate-100 text-slate-600"
  };
  return <span className={["rounded-full px-2 py-0.5 text-xs font-medium", styles[status]].join(" ")}>{statusLabels[status]}</span>;
}

function ContractPreview({ contract }: { contract: CustomerContract }) {
  return (
    <div className="space-y-3 rounded-lg border bg-background p-4 text-sm">
      <div className="flex items-center gap-2 font-semibold"><FileText className="h-4 w-4" /> {contract.contractCode}</div>
      <p>Cliente: {contract.customer.fullName} - Doc. {contract.customer.documentNumber}</p>
      <p>Total mensual: {money(contract.monthlyTotal)}</p>
      <div className="space-y-1">
        {contract.services.map((service) => <p key={service.id}>- {service.plan.name}: {money(service.plan.monthlyPrice)}</p>)}
      </div>
      <ol className="list-decimal space-y-1 pl-5">
        {contract.clauses.map((clause) => <li key={clause}>{clause}</li>)}
      </ol>
    </div>
  );
}

function TicketPreview({ ticket }: { ticket: PaymentTicket }) {
  return (
    <div className="space-y-2 rounded-lg border bg-background p-4 text-sm">
      <div className="flex items-center gap-2 font-semibold"><ReceiptText className="h-4 w-4" /> Ticket {ticket.receiptCode}</div>
      <p>Cliente: {ticket.customer.fullName}</p>
      <p>Periodo: {ticket.monthlyFee.period} - {ticket.service.plan.name}</p>
      <p>Importe: {money(ticket.amount)} - Metodo: {paymentMethodLabels[ticket.method]}</p>
      <p>Saldo pendiente: {money(ticket.monthlyFee.balance)}</p>
      <p>Estado: {ticket.status === "VALID" ? "Valido" : "Anulado"}</p>
      {ticket.notes ? <p>Notas: {ticket.notes}</p> : null}
    </div>
  );
}

export function CustomerPaymentsPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const queryClient = useQueryClient();
  const [contractOpen, setContractOpen] = useState(false);
  const [payModal, setPayModal] = useState<PayModalState>(null);
  const [voidModal, setVoidModal] = useState<VoidModalState>(null);
  const [payments, setPayments] = useState<PaymentsState>(emptyPayments);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [voidReason, setVoidReason] = useState("");
  const [ticket, setTicket] = useState<PaymentTicket | null>(null);

  const historyQuery = useQuery({
    queryKey: ["customer-payment-history", customerId],
    queryFn: () => fetchCustomerPaymentHistory(customerId!),
    enabled: Boolean(customerId)
  });

  const contractQuery = useQuery({
    queryKey: ["customer-contract", customerId],
    queryFn: () => fetchCustomerContract(customerId!),
    enabled: Boolean(customerId) && contractOpen
  });

  const paymentMutation = useMutation({
    mutationFn: () => registerPayment({ monthlyFeeId: payModal!.fee.id, amount: paidTotal(payments), method: primaryMethod(payments), notes: paymentNotes || undefined, evidences: paymentEvidences(payments) }),
    onSuccess: (createdTicket) => {
      setTicket(createdTicket);
      setPayModal(null);
      setPaymentNotes("");
      setPayments(emptyPayments);
      void queryClient.invalidateQueries({ queryKey: ["customer-payment-history", customerId] });
      void queryClient.invalidateQueries({ queryKey: ["cash-register"] });
    }
  });

  const ticketMutation = useMutation({ mutationFn: (paymentId: string) => fetchPaymentTicket(paymentId), onSuccess: setTicket });

  const voidMutation = useMutation({
    mutationFn: () => voidPayment(voidModal!.payment.id, { reason: voidReason || undefined }),
    onSuccess: (voidedTicket) => {
      setTicket(voidedTicket);
      setVoidModal(null);
      setVoidReason("");
      void queryClient.invalidateQueries({ queryKey: ["customer-payment-history", customerId] });
      void queryClient.invalidateQueries({ queryKey: ["cash-register"] });
    }
  });

  const columns = useMemo<Array<DataTableColumn<MonthlyFee>>>(() => [
    {
      id: "period",
      header: "Periodo",
      pinnedByDefault: true,
      cell: (fee) => (
        <div>
          <strong className="block">{fee.period}</strong>
          <span className="text-xs text-slate-500">{fee.service.plan.name}</span>
        </div>
      )
    },
    { id: "dueDate", header: "Vence", visibleByDefault: false, cell: (fee) => (fee.dueDate ? tableDate(fee.dueDate) : "Sin vencimiento") },
    { id: "amount", header: "Monto", cell: (fee) => money(fee.amount) },
    { id: "paid", header: "Pagado", cell: (fee) => money(fee.paidAmount) },
    { id: "balance", header: "Saldo", className: "font-semibold", cell: (fee) => money(fee.balance) },
    { id: "status", header: "Estado", cell: (fee) => statusBadge(fee.status) },
    {
      id: "actions",
      header: "Acciones",
      minWidth: 160,
      cell: (fee) => (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={fee.balance <= 0 || fee.status === "VOID"} onClick={() => { setPayModal({ fee, amount: fee.balance }); setPayments({ ...emptyPayments, CASH: { enabled: true, amount: fee.balance } }); }}>Abonar</Button>
        </div>
      )
    }
  ], []);

  function submitPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!payModal || paidTotal(payments) <= 0) return;
    paymentMutation.mutate();
  }

  function submitVoid(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!voidModal) return;
    voidMutation.mutate();
  }

  const history = historyQuery.data;

  return (
    <section className="space-y-5">
      <BackButton to="/clientes" label="Volver a clientes" />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Pagos del cliente</h1>
          <p className="text-sm text-slate-500">Mensualidades mes a mes, abonos, tickets, contrato y anulaciones.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={<FileText className="h-4 w-4" />} onClick={() => setContractOpen(true)}>Contrato</Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border bg-background p-4">
          <span className="text-xs text-slate-500">Cliente</span>
          <strong className="block">{history?.customer.fullName ?? "Cargando..."}</strong>
          <p className="text-sm text-slate-500">Doc. {history?.customer.documentNumber ?? "-"}</p>
        </div>
        <div className="rounded-lg border bg-background p-4">
          <span className="text-xs text-slate-500">Deuda total</span>
          <strong className="block text-xl text-red-700">{money(history?.totalDebt ?? 0)}</strong>
        </div>
        <div className="rounded-lg border bg-background p-4">
          <span className="text-xs text-slate-500">Mensualidades</span>
          <strong className="block text-xl">{history?.fees.length ?? 0}</strong>
        </div>
      </div>

      <DataTable
        storageKey="novalink.customer.payments.table"
        title="Estado de cuenta mes a mes"
        description="Cada periodo muestra sus abonos, tickets y evidencias disponibles."
        data={history?.fees ?? []}
        columns={columns}
        getRowId={(fee) => fee.id}
        isLoading={historyQuery.isLoading}
        emptyMessage="No hay mensualidades generadas para este cliente."
        minWidth={820}
        renderExpandedRow={(fee) => (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold"><Wallet className="h-4 w-4" /> Pagos y recibos</div>
            {fee.payments.length === 0 ? <p className="text-sm text-slate-500">Este periodo aun no tiene abonos.</p> : null}
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {fee.payments.map((payment) => (
                <div key={payment.id} className="rounded-md border bg-background p-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <strong className="block">{payment.receiptCode}</strong>
                      <span className="text-xs text-slate-500">{dateTime(payment.paidAt)} - {paymentMethodLabels[payment.method]}</span>
                    </div>
                    <span className={payment.status === "VALID" ? "rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700" : "rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"}>{payment.status === "VALID" ? "Valido" : "Anulado"}</span>
                  </div>
                  <p className="mt-2 font-semibold">{money(payment.amount)}</p>
                  <p className="mt-1 text-xs text-slate-500">Evidencia: sin archivo adjunto</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" icon={<ReceiptText className="h-4 w-4" />} onClick={() => ticketMutation.mutate(payment.id)}>Ticket</Button>
                    <Button size="sm" variant="danger" disabled={payment.status === "VOID"} icon={<RotateCcw className="h-4 w-4" />} onClick={() => setVoidModal({ payment, fee })}>Anular</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      />

      <AppModal open={Boolean(payModal)} title="Abonar mensualidad" description={payModal ? `${payModal.fee.period} - saldo ${money(payModal.fee.balance)}` : undefined} onClose={() => setPayModal(null)} size="lg">
        {payModal ? (
          <form className="space-y-4" onSubmit={submitPayment}>
            <SelectField label="Mensualidad" value={payModal.fee.id} onChange={() => undefined} disabled>
              <option value={payModal.fee.id}>{payModal.fee.period} - {payModal.fee.service.plan.name}</option>
            </SelectField>
            <PaymentSplit payments={payments} onChange={setPayments} total={payModal.fee.balance} />
            <TextareaField label="Nota" value={paymentNotes} onChange={(event) => setPaymentNotes(event.target.value)} />
            <div className="flex justify-end">
              <Button disabled={paymentMutation.isPending} type="submit">Registrar abono</Button>
            </div>
          </form>
        ) : null}
      </AppModal>

      <AppModal open={Boolean(voidModal)} title="Anular pago" description={voidModal ? `Ticket ${voidModal.payment.receiptCode}` : undefined} onClose={() => setVoidModal(null)}>
        {voidModal ? (
          <form className="space-y-4" onSubmit={submitVoid}>
            <p className="text-sm text-slate-600">Se marcara el pago como anulado, se recalculara el saldo del periodo y se registrara el reverso en caja abierta.</p>
            <TextareaField label="Motivo" value={voidReason} onChange={(event) => setVoidReason(event.target.value)} placeholder="Motivo de anulacion" />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setVoidModal(null)}>Cancelar</Button>
              <Button type="submit" variant="danger" disabled={voidMutation.isPending}>Anular pago</Button>
            </div>
          </form>
        ) : null}
      </AppModal>

      <AppModal open={contractOpen} title="Contrato del cliente" description="Contrato simple con servicios activos." onClose={() => setContractOpen(false)} size="lg">
        {contractQuery.isLoading ? <div className="text-sm text-slate-500">Generando contrato...</div> : null}
        {contractQuery.data ? <ContractPreview contract={contractQuery.data} /> : null}
      </AppModal>

      <AppModal open={Boolean(ticket)} title="Ticket de pago" description="Recibo generado por el sistema." size="sm" onClose={() => setTicket(null)}>
        {ticket ? <TicketPreview ticket={ticket} /> : null}
      </AppModal>
    </section>
  );
}







