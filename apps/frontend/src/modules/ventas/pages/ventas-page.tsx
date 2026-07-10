import { useQuery } from "@tanstack/react-query";
import { CircleDollarSign, Plus, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";
import { MetricCard } from "@/components/ui/Panels";
import { fetchMaterialSales, fetchSaleMaterials } from "../api/sales.api";
import { SalesList } from "../components/SalesList";
import { money } from "@/lib/format";


export function VentasPage() {
  const navigate = useNavigate();
  const materialsQuery = useQuery({ queryKey: ["materials", "ventas"], queryFn: fetchSaleMaterials });
  const salesQuery = useQuery({ queryKey: ["material-sales"], queryFn: fetchMaterialSales });
  const sales = salesQuery.data ?? [];
  const totalListed = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Ventas</h1>
          <p className="text-sm text-slate-500">Venta de productos, salida automatica de stock e ingreso a caja.</p>
        </div>
        <Button type="button" icon={<Plus className="h-4 w-4" />} onClick={() => navigate("/ventas/nueva")}>
          Nueva venta
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Ventas listadas" value={sales.length} icon={<ShoppingCart className="h-4 w-4" />} />
        <MetricCard label="Total listado" value={money(totalListed)} icon={<CircleDollarSign className="h-4 w-4" />} tone="success" />
        <MetricCard
          label="Productos disponibles"
          value={(materialsQuery.data ?? []).filter((material) => material.isActive && material.stock > 0).length}
          icon={<ShoppingCart className="h-4 w-4" />}
        />
      </div>

      <SalesList sales={sales} isLoading={salesQuery.isLoading} />
    </section>
  );
}
