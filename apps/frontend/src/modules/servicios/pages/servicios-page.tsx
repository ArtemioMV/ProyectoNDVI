import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Tv, Wifi } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/components/ui/cn";
import { DataLoader } from "@/components/ui/DataLoader";
import { useToast } from "@/components/ui/Toast";
import { createServicePlan, fetchServicePlans, updateServicePlan } from "../api/service-plans.api";
import { PlanForm } from "../components/PlanForm";
import { PlansSection } from "../components/PlansSection";
import type { CreateServicePlanPayload, PlanType, ServicePlan } from "../types/service-plans.types";

const serviceOptions: Array<{ value: PlanType; label: string; icon: typeof Wifi }> = [
  { value: "INTERNET", label: "Internet", icon: Wifi },
  { value: "TV", label: "IPTV", icon: Tv }
];

export function ServiciosPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [planType, setPlanType] = useState<PlanType>("INTERNET");
  const [editingPlan, setEditingPlan] = useState<ServicePlan | null>(null);
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null);
  const plansQuery = useQuery({ queryKey: ["service-plans"], queryFn: () => fetchServicePlans() });

  const { internetPlans, tvPlans } = useMemo(() => {
    const plans = plansQuery.data ?? [];
    return {
      internetPlans: plans.filter((plan) => plan.type === "INTERNET"),
      tvPlans: plans.filter((plan) => plan.type === "TV")
    };
  }, [plansQuery.data]);

  const refreshPlans = () => queryClient.invalidateQueries({ queryKey: ["service-plans"] });

  const createPlanMutation = useMutation({
    mutationFn: (payload: CreateServicePlanPayload) => createServicePlan(payload),
    onSuccess: () => {
      toast({ tone: "success", message: "Plan creado correctamente." });
      void refreshPlans();
    },
    onError: () => toast({ tone: "error", message: "No se pudo crear el plan. Revisa nombre, tipo o precio." })
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateServicePlanPayload }) => updateServicePlan(id, payload),
    onSuccess: () => {
      toast({ tone: "success", message: "Plan actualizado correctamente." });
      setEditingPlan(null);
      void refreshPlans();
    },
    onError: () => toast({ tone: "error", message: "No se pudo actualizar el plan." })
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (plan: ServicePlan) => updateServicePlan(plan.id, { isActive: !plan.isActive }),
    onMutate: (plan) => setBusyPlanId(plan.id),
    onSuccess: (updatedPlan, plan) => {
      queryClient.setQueryData<ServicePlan[]>(["service-plans"], (current) =>
        current?.map((item) => (item.id === updatedPlan.id ? updatedPlan : item)) ?? current
      );
      toast({ tone: "success", message: plan.isActive ? "Plan desactivado." : "Plan activado." });
      void refreshPlans();
    },
    onError: () => toast({ tone: "error", message: "No se pudo cambiar el estado del plan." }),
    onSettled: () => setBusyPlanId(null)
  });

  function startEdit(plan: ServicePlan) {
    setEditingPlan(plan);
    setPlanType(plan.type);
  }

  function cancelEdit() {
    setEditingPlan(null);
  }

  function handleSubmit(payload: CreateServicePlanPayload) {
    if (editingPlan) {
      updatePlanMutation.mutate({ id: editingPlan.id, payload });
    } else {
      createPlanMutation.mutate(payload);
    }
  }

  const editingInitial = editingPlan
    ? {
        name: editingPlan.name,
        description: editingPlan.description ?? "",
        monthlyPrice: editingPlan.monthlyPrice,
        downloadMbps: editingPlan.downloadMbps ?? 50,
        uploadMbps: editingPlan.uploadMbps ?? 20,
        maxScreens: editingPlan.maxScreens ?? 1
      }
    : undefined;

  const isSubmitting = createPlanMutation.isPending || updatePlanMutation.isPending;

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-xl font-medium text-slate-900">Servicios</h1>
        <p className="text-sm text-slate-500">Servicios comerciales de internet e IPTV. Los clientes solo los contratan desde su registro.</p>
      </div>

      {plansQuery.isLoading ? <DataLoader className="rounded-lg border bg-background" /> : null}

      <div className="grid gap-5 lg:grid-cols-3 lg:items-start">
        <section className="overflow-hidden rounded-lg border bg-background">
          <div className="flex items-center gap-2 border-b p-4">
            <PlusCircle className="h-4 w-4 text-primary" />
            <div>
              <h2 className="text-sm font-medium text-slate-800">{editingPlan ? "Editar plan" : "Crear plan"}</h2>
              <p className="text-xs text-slate-500">
                {editingPlan ? `Modificando: ${editingPlan.name}` : "Registra un nuevo servicio de internet o IPTV."}
              </p>
            </div>
          </div>
          <div className="space-y-4 p-4">
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Servicio</legend>
              <div className="grid grid-cols-2 gap-2 rounded-md border bg-background p-1.5">
                {serviceOptions.map((option) => {
                  const Icon = option.icon;
                  const selected = planType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={cn(
                        "inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition",
                        selected ? "bg-primary text-white" : "text-slate-600 hover:bg-muted"
                      )}
                      aria-pressed={selected}
                      aria-label={option.label}
                      title={option.label}
                      onClick={() => setPlanType(option.value)}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <PlanForm
              key={editingPlan ? `edit-${editingPlan.id}` : `create-${planType}`}
              type={planType}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              initialValues={editingInitial}
              submitLabel={editingPlan ? "Actualizar plan" : "Guardar plan"}
              onCancel={editingPlan ? cancelEdit : undefined}
            />
          </div>
        </section>

        <PlansSection
          title="Internet"
          type="INTERNET"
          plans={internetPlans}
          editingPlanId={editingPlan?.id ?? null}
          busyPlanId={busyPlanId}
          onEdit={startEdit}
          onToggleActive={(plan) => toggleActiveMutation.mutate(plan)}
        />
        <PlansSection
          title="IPTV"
          type="TV"
          plans={tvPlans}
          editingPlanId={editingPlan?.id ?? null}
          busyPlanId={busyPlanId}
          onEdit={startEdit}
          onToggleActive={(plan) => toggleActiveMutation.mutate(plan)}
        />
      </div>
    </section>
  );
}
