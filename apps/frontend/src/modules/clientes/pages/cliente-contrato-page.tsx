import { useQuery } from "@tanstack/react-query";
import { Mail, Printer } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { useParams } from "react-router";
import { ContractDocument, type ContractService } from "@/components/documents/ContractDocument";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { DataLoader } from "@/components/ui/DataLoader";
import { useToast } from "@/components/ui/Toast";
import { money } from "@/lib/format";
import { httpClient } from "@/services/api/http-client";
import { useCompanySettings } from "@/services/settings/company-settings";

type PlanType = "INTERNET" | "TV";
type ApiResponse<T> = { success: boolean; data: T; message?: string };

type ServicePlan = { id: string; type: PlanType; name: string; monthlyPrice: number; downloadMbps?: number | null; uploadMbps?: number | null; maxScreens?: number | null };
type CustomerService = { id: string; screenCount?: number | null; plan: ServicePlan };
type Customer = {
  id: string;
  documentType?: string | null;
  documentNumber: string;
  fullName: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  district?: string | null;
  services: CustomerService[];
};

async function fetchCustomers() {
  const response = await httpClient.get<ApiResponse<Customer[]>>("/customers");
  return response.data.data;
}

function planDetail(plan: ServicePlan) {
  if (plan.type === "INTERNET") return `${plan.downloadMbps ?? 0}/${plan.uploadMbps ?? 0} Mbps`;
  return `${plan.maxScreens ?? 1} pantalla${(plan.maxScreens ?? 1) > 1 ? "s" : ""}`;
}

/** Numero peruano a formato wa.me: solo digitos y prefijo 51 si es celular local. */
function whatsappNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 9 ? `51${digits}` : digits;
}

export function ClienteContratoPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const company = useCompanySettings();
  const toast = useToast();
  const customersQuery = useQuery({ queryKey: ["customers"], queryFn: fetchCustomers });
  const customer = (customersQuery.data ?? []).find((item) => item.id === customerId);

  if (customersQuery.isLoading) return <DataLoader />;
  if (!customer) {
    return (
      <section className="space-y-4">
        <BackButton to="/clientes" label="Volver a clientes" />
        <div className="rounded-lg border bg-background p-6 text-sm text-slate-500">Cliente no encontrado.</div>
      </section>
    );
  }

  const services: ContractService[] = customer.services.map((service) => ({
    name: service.plan.name,
    detail: service.plan.type === "TV" ? `${planDetail(service.plan)} - ${service.screenCount ?? 1} pantalla(s)` : planDetail(service.plan),
    monthlyPrice: service.plan.monthlyPrice
  }));
  const monthly = customer.services.reduce((sum, service) => sum + service.plan.monthlyPrice, 0);
  const contractNumber = customer.id.slice(0, 8).toUpperCase();
  const serviceLines = services.map((service) => `- ${service.name} (${service.detail}): ${money(service.monthlyPrice)}/mes`).join("\n");
  const contractLink = `${window.location.origin}/clientes/${customer.id}/contrato`;

  function sendByEmail() {
    if (!customer?.email) {
      toast({ tone: "error", message: "El cliente no tiene correo registrado." });
      return;
    }
    const subject = `Contrato de servicio N° ${contractNumber} - ${company.companyName}`;
    const body = [
      `Estimado(a) ${customer.fullName}:`,
      "",
      `Le saludamos de ${company.companyName}. Adjuntamos su contrato de servicio N° ${contractNumber} con el siguiente detalle:`,
      "",
      serviceLines,
      "",
      `Total mensual: ${money(monthly)}`,
      "",
      "Para completar el envio: use Imprimir > Guardar como PDF en esta pagina y adjunte el archivo a este correo.",
      "",
      "Cualquier consulta, estamos a su disposicion.",
      "",
      `${company.companyName}${company.phone ? ` · ${company.phone}` : ""}`
    ].join("\n");
    window.location.href = `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function sendByWhatsApp() {
    if (!customer?.phone) {
      toast({ tone: "error", message: "El cliente no tiene telefono registrado." });
      return;
    }
    const text = [
      `Hola ${customer.fullName}, le saludamos de ${company.companyName}.`,
      "",
      `Su contrato de servicio N° ${contractNumber}:`,
      serviceLines,
      "",
      `Total mensual: ${money(monthly)}`,
      "",
      `Puede ver su contrato aqui: ${contractLink}`
    ].join("\n");
    window.open(`https://wa.me/${whatsappNumber(customer.phone)}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 no-print">
        <BackButton to={`/clientes/${customer.id}`} label="Volver a la ficha" />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={<Mail className="h-4 w-4" />} onClick={sendByEmail}>
            Enviar por correo
          </Button>
          <Button variant="secondary" icon={<WhatsAppIcon className="h-4 w-4 text-[#25D366]" />} onClick={sendByWhatsApp}>
            Enviar por WhatsApp
          </Button>
          <Button icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>
            Imprimir / PDF
          </Button>
        </div>
      </div>

      <ContractDocument
        company={company}
        client={{
          fullName: customer.fullName,
          documentType: customer.documentType ?? undefined,
          documentNumber: customer.documentNumber,
          address: customer.address ?? undefined,
          district: customer.district ?? undefined,
          phone: customer.phone ?? undefined,
          email: customer.email ?? undefined
        }}
        services={services}
        monthlyTotal={monthly}
        number={contractNumber}
      />
    </section>
  );
}
