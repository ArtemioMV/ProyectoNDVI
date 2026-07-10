import { Download, Mail, Printer, ReceiptText } from "lucide-react";
import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { DocumentStatusBadge, type DocumentStatusValue } from "@/components/ui/StatusBadge";
import { useCompanySettings } from "@/services/settings/company-settings";
import { longDate, money } from "@/lib/format";

/**
 * Ticket generico para operaciones que mueven dinero (ventas, compras, gastos,
 * pagos, movimientos de caja). Diagramado tipo ticketera 80mm y usa la clase
 * `.contract-print` para que Imprimir muestre solo el documento.
 */
export type TicketItem = { label: string; detail?: string; amount: number };
export type TicketMeta = { label: string; value: string };

export type TicketData = {
  code: string;
  title: string;
  date: string | Date;
  items: TicketItem[];
  total: number;
  totalLabel?: string;
  meta?: TicketMeta[];
  status?: DocumentStatusValue;
};

function ticketText(ticket: TicketData, companyName: string) {
  return [
    companyName,
    `${ticket.title} ${ticket.code}`,
    `Fecha: ${longDate(ticket.date)}`,
    ...(ticket.meta ?? []).map((meta) => `${meta.label}: ${meta.value}`),
    "----------------------------",
    ...ticket.items.map((item) => `${item.label}${item.detail ? ` (${item.detail})` : ""}: ${money(item.amount)}`),
    "----------------------------",
    `${ticket.totalLabel ?? "Total"}: ${money(ticket.total)}`,
    ticket.status === "VOID" ? "** ANULADO **" : ""
  ].filter(Boolean).join("\n");
}

export function TicketDocument({ ticket }: { ticket: TicketData }) {
  const company = useCompanySettings();

  return (
    <article className="contract-print mx-auto w-full max-w-[320px] rounded-md border bg-white p-4 font-mono text-xs text-slate-900 print:max-w-none print:border-0 print:p-0">
      <header className="border-b border-dashed pb-2 text-center">
        <strong className="block text-sm">{company.companyName}</strong>
        {company.ruc ? <span className="block text-slate-600">RUC {company.ruc}</span> : null}
        {company.phone ? <span className="block text-slate-600">{company.phone}</span> : null}
      </header>

      <div className="border-b border-dashed py-2 text-center">
        <span className="block font-semibold uppercase">{ticket.title}</span>
        <span className="block text-sm font-bold tracking-wide">{ticket.code}</span>
        <span className="block text-slate-600">{longDate(ticket.date)}</span>
        {ticket.status ? <span className="mt-1 inline-block"><DocumentStatusBadge status={ticket.status} /></span> : null}
      </div>

      {ticket.meta && ticket.meta.length > 0 ? (
        <div className="space-y-0.5 border-b border-dashed py-2">
          {ticket.meta.map((meta) => (
            <p key={meta.label} className="flex justify-between gap-2">
              <span className="text-slate-500">{meta.label}</span>
              <span className="text-right">{meta.value}</span>
            </p>
          ))}
        </div>
      ) : null}

      <div className="space-y-1 border-b border-dashed py-2">
        {ticket.items.map((item, index) => (
          <div key={index} className="flex justify-between gap-2">
            <span className="min-w-0">
              {item.label}
              {item.detail ? <span className="block text-[10px] text-slate-500">{item.detail}</span> : null}
            </span>
            <span className="shrink-0">{money(item.amount)}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between py-2 text-sm font-bold">
        <span>{ticket.totalLabel ?? "Total"}</span>
        <span>{money(ticket.total)}</span>
      </div>

      <footer className="border-t border-dashed pt-2 text-center text-[10px] text-slate-500">
        Gracias por su preferencia · {company.companyName}
      </footer>
    </article>
  );
}

export function TicketModal({ ticket, onClose }: { ticket: TicketData | null; onClose: () => void }) {
  const company = useCompanySettings();

  function download() {
    if (!ticket) return;
    const blob = new Blob([ticketText(ticket, company.companyName)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${ticket.code}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function sendEmail() {
    if (!ticket) return;
    window.location.href = `mailto:?subject=${encodeURIComponent(`${ticket.title} ${ticket.code}`)}&body=${encodeURIComponent(ticketText(ticket, company.companyName))}`;
  }

  function sendWhatsapp() {
    if (!ticket) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(ticketText(ticket, company.companyName))}`, "_blank", "noopener,noreferrer");
  }

  return (
    <AppModal
      open={Boolean(ticket)}
      title={ticket?.title ?? "Ticket"}
      description={ticket?.code}
      onClose={onClose}
      size="sm"
      footer={
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Button type="button" variant="secondary" size="sm" icon={<Download className="h-4 w-4" />} onClick={download}>Descargar</Button>
          <Button type="button" variant="secondary" size="sm" icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>Imprimir</Button>
          <Button type="button" variant="secondary" size="sm" icon={<Mail className="h-4 w-4" />} onClick={sendEmail}>Correo</Button>
          <Button type="button" variant="secondary" size="sm" icon={<WhatsAppIcon className="h-4 w-4 text-[#25D366]" />} onClick={sendWhatsapp}>WhatsApp</Button>
        </div>
      }
    >
      {ticket ? <TicketDocument ticket={ticket} /> : <span className="flex items-center gap-2 text-sm text-slate-500"><ReceiptText className="h-4 w-4" /> Sin ticket</span>}
    </AppModal>
  );
}
