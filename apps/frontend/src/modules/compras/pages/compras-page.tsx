import { useQuery } from "@tanstack/react-query";
import { PackagePlus, Truck } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";
import { MetricCard } from "@/components/ui/Panels";
import { fetchPurchases, fetchSuppliers } from "../api/purchases.api";
import { PurchasesList } from "../components/PurchasesList";
import { money } from "@/lib/format";


export function ComprasPage() {
  const navigate = useNavigate();
  const suppliersQuery = useQuery({ queryKey: ["suppliers"], queryFn: fetchSuppliers });
  const purchasesQuery = useQuery({ queryKey: ["material-purchases"], queryFn: fetchPurchases });
  const purchases = purchasesQuery.data ?? [];
  const monthTotal = purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Compras</h1>
          <p className="text-sm text-slate-500">Compras de materiales, ingreso a stock y egreso de caja. Los proveedores se administran aparte.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" icon={<PackagePlus className="h-4 w-4" />} onClick={() => navigate("/compras/nueva")}>
            Nueva compra
          </Button>
          <Button type="button" variant="secondary" icon={<Truck className="h-4 w-4" />} onClick={() => navigate("/proveedores")}>
            Proveedores
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Compras listadas" value={purchases.length} icon={<PackagePlus className="h-4 w-4" />} />
        <MetricCard label="Total listado" value={money(monthTotal)} icon={<Truck className="h-4 w-4" />} />
        <MetricCard label="Proveedores" value={suppliersQuery.data?.length ?? 0} icon={<Truck className="h-4 w-4" />} />
      </div>

      <PurchasesList purchases={purchases} isLoading={purchasesQuery.isLoading} />
    </section>
  );
}
