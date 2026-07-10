import { Tv } from "lucide-react";
import type { CompanySettings } from "@/services/settings/company-settings";
import { longDate, money } from "@/lib/format";

export type ContractService = {
  name: string;
  detail: string;
  monthlyPrice: number;
};

export type ContractClient = {
  fullName: string;
  documentNumber: string;
  documentType?: string;
  address?: string;
  district?: string;
  phone?: string;
  email?: string;
};

type ContractDocumentProps = {
  company: CompanySettings;
  client: ContractClient;
  services: ContractService[];
  monthlyTotal: number;
  oneTimeTotal?: number;
  date?: Date;
  number?: string;
};

/**
 * Contrato de servicio en HTML, diagramado para UNA pagina A4 (ver @page en
 * globals.css). Fuente unica para vista previa, impresion/PDF y envio.
 * Ver docs/decisions/ADR-002-contract-generation.md.
 */
export function ContractDocument({ company, client, services, monthlyTotal, oneTimeTotal = 0, date = new Date(), number = "—" }: ContractDocumentProps) {
  const documentLabel = client.documentType || "DNI";

  return (
    <article className="contract-print mx-auto max-w-[794px] bg-white p-10 text-[13px] leading-relaxed text-slate-900 shadow-sm print:p-0 print:text-[11px] print:shadow-none">
      {/* Encabezado */}
      <header className="flex items-start justify-between gap-6 border-b-2 border-slate-900 pb-3">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-lg bg-primary text-white">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.companyName} className="h-full w-full object-cover" />
            ) : (
              <Tv className="h-7 w-7" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">{company.companyName}</h1>
            {company.ruc ? <p className="text-xs text-slate-600">RUC: {company.ruc}</p> : null}
            {company.address ? <p className="text-xs text-slate-600">{company.address}</p> : null}
            {(company.phone || company.email) ? (
              <p className="text-xs text-slate-600">{[company.phone, company.email].filter(Boolean).join(" · ")}</p>
            ) : null}
          </div>
        </div>
        <div className="text-right text-xs text-slate-600">
          <p className="text-sm font-semibold text-slate-900">Contrato de prestacion de servicios</p>
          <p>N° {number}</p>
          <p>{longDate(date)}</p>
        </div>
      </header>

      {/* Partes */}
      <section className="mt-4">
        <p className="text-justify text-slate-700">
          Conste por el presente documento el contrato de prestacion de servicios que celebran, de una parte{" "}
          <strong>{company.companyName}</strong>{company.ruc ? ` con RUC ${company.ruc}` : ""}
          {company.address ? `, con domicilio en ${company.address}` : ""}, en adelante <strong>EL PROVEEDOR</strong>; y de la otra parte{" "}
          <strong>{client.fullName}</strong>, identificado(a) con {documentLabel} N° <strong>{client.documentNumber}</strong>
          {client.address ? `, con domicilio en ${client.address}${client.district ? `, ${client.district}` : ""}` : ""}, en adelante{" "}
          <strong>EL CLIENTE</strong>; en los terminos y condiciones siguientes:
        </p>
      </section>

      {/* Datos del cliente */}
      <section className="mt-4">
        <h2 className="mb-1.5 border-b border-slate-300 pb-1 text-xs font-bold uppercase tracking-wide text-slate-700">Datos del cliente</h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
          <p><span className="text-slate-500">Nombre completo:</span> <strong>{client.fullName}</strong></p>
          <p><span className="text-slate-500">{documentLabel}:</span> <strong>{client.documentNumber}</strong></p>
          <p><span className="text-slate-500">Telefono:</span> {client.phone || "—"}</p>
          <p><span className="text-slate-500">Correo:</span> {client.email || "—"}</p>
          <p className="col-span-2"><span className="text-slate-500">Direccion de instalacion:</span> {[client.address, client.district].filter(Boolean).join(", ") || "—"}</p>
        </div>
      </section>

      {/* Servicios */}
      <section className="mt-4">
        <h2 className="mb-1.5 border-b border-slate-300 pb-1 text-xs font-bold uppercase tracking-wide text-slate-700">Servicios contratados</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-300 text-left text-xs uppercase text-slate-500">
              <th className="py-1.5">Servicio</th>
              <th className="py-1.5">Detalle</th>
              <th className="py-1.5 text-right">Tarifa mensual</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service, index) => (
              <tr key={index} className="border-b border-slate-200">
                <td className="py-1.5 font-medium">{service.name}</td>
                <td className="py-1.5 text-slate-600">{service.detail}</td>
                <td className="py-1.5 text-right">{money(service.monthlyPrice)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="py-1.5 font-semibold" colSpan={2}>Total mensual</td>
              <td className="py-1.5 text-right font-semibold">{money(monthlyTotal)}</td>
            </tr>
            {oneTimeTotal > 0 ? (
              <tr>
                <td className="text-slate-600" colSpan={2}>Cobro inicial unico (instalacion y materiales)</td>
                <td className="text-right text-slate-600">{money(oneTimeTotal)}</td>
              </tr>
            ) : null}
          </tfoot>
        </table>
      </section>

      {/* Clausulas */}
      <section className="mt-4 space-y-1.5 text-justify text-xs leading-relaxed text-slate-700">
        <h2 className="mb-1.5 border-b border-slate-300 pb-1 text-xs font-bold uppercase tracking-wide text-slate-700">Condiciones del servicio</h2>
        <p><strong>Primera — Objeto.</strong> EL PROVEEDOR se obliga a prestar a EL CLIENTE los servicios detallados en la tabla anterior, en la direccion de instalacion indicada.</p>
        <p><strong>Segunda — Vigencia.</strong> El contrato rige desde la fecha de activacion del servicio y se renueva automaticamente de forma mensual, salvo solicitud expresa de baja por cualquiera de las partes.</p>
        <p><strong>Tercera — Tarifa y pago.</strong> EL CLIENTE pagara la tarifa mensual pactada por ciclo de facturacion anclado a su fecha de activacion. El pago puede realizarse en efectivo, Yape, Plin, transferencia u otro medio habilitado por EL PROVEEDOR.</p>
        <p><strong>Cuarta — Suspension por falta de pago.</strong> El atraso en el pago de la mensualidad faculta a EL PROVEEDOR a suspender el servicio hasta su regularizacion. La reconexion no genera costo adicional salvo retiro de equipos.</p>
        <p><strong>Quinta — Equipos e instalacion.</strong> Los equipos instalados en comodato (router, caja, cableado) son propiedad de EL PROVEEDOR salvo pacto en contrario; EL CLIENTE responde por su cuidado y debera devolverlos al termino del contrato. Los costos iniciales de instalacion y materiales se detallan como cobro unico.</p>
        <p><strong>Sexta — Soporte tecnico.</strong> EL PROVEEDOR brinda soporte por los canales indicados en este documento. Las visitas tecnicas por fallas imputables al servicio no tienen costo; las ocasionadas por mal uso podran facturarse.</p>
        <p><strong>Septima — Uso del servicio.</strong> El servicio es de uso residencial y personal. Queda prohibida su reventa o redistribucion sin autorizacion escrita de EL PROVEEDOR.</p>
        <p><strong>Octava — Datos personales.</strong> Los datos de EL CLIENTE se utilizan exclusivamente para la gestion del servicio, facturacion y comunicaciones operativas, conforme a la normativa de proteccion de datos vigente.</p>
        <p><strong>Novena — Cambios de plan y baja.</strong> EL CLIENTE puede solicitar cambio de plan o baja del servicio comunicandose con EL PROVEEDOR; el cambio se aplica al ciclo de facturacion siguiente.</p>
      </section>

      {/* Firmas */}
      <section className="mt-10 grid grid-cols-2 gap-10 text-center">
        <div className="border-t border-slate-400 pt-2">
          <p className="font-semibold">{company.companyName}</p>
          <p className="text-xs text-slate-500">EL PROVEEDOR</p>
        </div>
        <div className="border-t border-slate-400 pt-2">
          <p className="font-semibold">{client.fullName || "El cliente"}</p>
          <p className="text-xs text-slate-500">EL CLIENTE — {documentLabel} {client.documentNumber}</p>
        </div>
      </section>

      {/* Pie */}
      <footer className="mt-6 border-t border-slate-200 pt-2 text-center text-[10px] text-slate-400">
        {company.companyName}
        {company.ruc ? ` · RUC ${company.ruc}` : ""}
        {company.phone ? ` · ${company.phone}` : ""}
        {company.email ? ` · ${company.email}` : ""}
        {" · "}Contrato N° {number}
      </footer>
    </article>
  );
}
