import { Pencil, Power, Tv, Wifi } from "lucide-react";
import { IconAction } from "@/components/ui/IconAction";
import { cn } from "@/components/ui/cn";
import type { PlanType, ServicePlan } from "../types/service-plans.types";
import { money } from "@/lib/format";

type PlansSectionProps = {
  title: string;
  type: PlanType;
  plans: ServicePlan[];
  editingPlanId?: string | null;
  busyPlanId?: string | null;
  onEdit: (plan: ServicePlan) => void;
  onToggleActive: (plan: ServicePlan) => void;
};

function planDetail(plan: ServicePlan) {
  if (plan.type === "INTERNET") {
    return `${plan.downloadMbps ?? 0}/${plan.uploadMbps ?? 0} Mbps`;
  }
  return `${plan.maxScreens ?? 1} pantalla${(plan.maxScreens ?? 1) > 1 ? "s" : ""}`;
}

export function PlansSection({ title, type, plans, editingPlanId, busyPlanId, onEdit, onToggleActive }: PlansSectionProps) {
  const Icon = type === "INTERNET" ? Wifi : Tv;

  return (
    <section className="flex max-h-[calc(100vh-13rem)] min-h-0 flex-col overflow-hidden rounded-lg border bg-background">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <Icon className="h-4 w-4 text-primary" />
        <div>
          <h2 className="text-sm font-medium text-slate-800">Servicios {title}</h2>
          <p className="text-xs text-slate-500">{plans.length} servicio(s)</p>
        </div>
      </div>

      {plans.length === 0 ? <div className="p-6 text-sm text-slate-500">No hay servicios registrados.</div> : null}
      <div className="scrollbar-thin min-h-0 flex-1 divide-y overflow-y-auto">
        {plans.map((plan) => {
          const isEditing = editingPlanId === plan.id;
          const isBusy = busyPlanId === plan.id;
          const actionLabel = plan.isActive ? "Desactivar" : "Activar";
          return (
            <article key={plan.id} className={cn("flex items-start justify-between gap-3 px-4 py-3 transition", isEditing && "bg-primary/5")}>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-medium text-slate-900">{plan.name}</span>
                  <span className={plan.isActive ? "rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700" : "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"}>
                    {plan.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{planDetail(plan)}{plan.description ? ` - ${plan.description}` : ""}</p>
                <span className="mt-1.5 block text-sm font-medium text-slate-900">{money(plan.monthlyPrice)}</span>
              </div>

              <div className="flex shrink-0 gap-1.5">
                <IconAction
                  label="Editar"
                  icon={<Pencil />}
                  tone="edit"
                  variant="soft"
                  disabled={isBusy}
                  aria-label={`Editar ${plan.name}`}
                  onClick={() => onEdit(plan)}
                />
                <IconAction
                  label={isBusy ? "Actualizando" : actionLabel}
                  icon={<Power />}
                  tone={plan.isActive ? "danger" : "success"}
                  variant="soft"
                  disabled={isBusy}
                  aria-label={`${actionLabel} ${plan.name}`}
                  onClick={() => onToggleActive(plan)}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}



