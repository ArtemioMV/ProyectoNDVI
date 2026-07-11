import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router";
import { DataLoader } from "@/components/ui/DataLoader";
import { AdminLayout } from "../layouts/admin-layout";
import { isAuthenticated } from "@/services/auth/session";

const LoginPage = lazy(() => import("@/modules/auth/pages/login-page").then((module) => ({ default: module.LoginPage })));
const ForgotPasswordPage = lazy(() => import("@/modules/auth/pages/forgot-password-page").then((module) => ({ default: module.ForgotPasswordPage })));
const VerifyAccountPage = lazy(() => import("@/modules/auth/pages/verify-account-page").then((module) => ({ default: module.VerifyAccountPage })));
const CajaPage = lazy(() => import("@/modules/caja/pages/caja-page").then((module) => ({ default: module.CajaPage })));
const CobranzaPage = lazy(() => import("@/modules/cobranza/pages/cobranza-page").then((module) => ({ default: module.CobranzaPage })));
const ClienteContratoPage = lazy(() => import("@/modules/clientes/pages/cliente-contrato-page").then((module) => ({ default: module.ClienteContratoPage })));
const ClienteDetallePage = lazy(() => import("@/modules/clientes/pages/cliente-detalle-page").then((module) => ({ default: module.ClienteDetallePage })));
const ClienteNuevoPage = lazy(() => import("@/modules/clientes/pages/cliente-nuevo-page").then((module) => ({ default: module.ClienteNuevoPage })));
const ClientesPage = lazy(() => import("@/modules/clientes/pages/clientes-page").then((module) => ({ default: module.ClientesPage })));
const ClientesMapaPage = lazy(() => import("@/modules/mapa/pages/clientes-mapa-page").then((module) => ({ default: module.ClientesMapaPage })));
const CompraNuevaPage = lazy(() => import("@/modules/compras/pages/compra-nueva-page").then((module) => ({ default: module.CompraNuevaPage })));
const ComprasPage = lazy(() => import("@/modules/compras/pages/compras-page").then((module) => ({ default: module.ComprasPage })));
const ProveedoresPage = lazy(() => import("@/modules/compras/pages/proveedores-page").then((module) => ({ default: module.ProveedoresPage })));
const ConfiguracionPage = lazy(() => import("@/modules/configuracion/pages/configuracion-page").then((module) => ({ default: module.ConfiguracionPage })));
const AdministracionPage = lazy(() => import("@/modules/administracion/pages/administracion-page").then((module) => ({ default: module.AdministracionPage })));
const DashboardPage = lazy(() => import("@/modules/dashboard/pages/dashboard-page").then((module) => ({ default: module.DashboardPage })));
const GastosPage = lazy(() => import("@/modules/gastos/pages/gastos-page").then((module) => ({ default: module.GastosPage })));
const NotFoundPage = lazy(() => import("@/modules/errors/pages/not-found-page").then((module) => ({ default: module.NotFoundPage })));
const CustomerPaymentsPage = lazy(() => import("@/modules/pagos/pages/customer-payments-page").then((module) => ({ default: module.CustomerPaymentsPage })));
const ProductosPage = lazy(() => import("@/modules/productos/pages/productos-page").then((module) => ({ default: module.ProductosPage })));
const ReportesPage = lazy(() => import("@/modules/reportes/pages/reportes-page").then((module) => ({ default: module.ReportesPage })));
const ServiciosPage = lazy(() => import("@/modules/servicios/pages/servicios-page").then((module) => ({ default: module.ServiciosPage })));
const VentaNuevaPage = lazy(() => import("@/modules/ventas/pages/venta-nueva-page").then((module) => ({ default: module.VentaNuevaPage })));
const VentasPage = lazy(() => import("@/modules/ventas/pages/ventas-page").then((module) => ({ default: module.VentasPage })));

function RoutePreloader() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void Promise.all([
        import("@/modules/dashboard/pages/dashboard-page"),
        import("@/modules/clientes/pages/clientes-page"),
        import("@/modules/servicios/pages/servicios-page"),
        import("@/modules/productos/pages/productos-page"),
        import("@/modules/caja/pages/caja-page"),
        import("@/modules/cobranza/pages/cobranza-page"),
        import("@/modules/compras/pages/compras-page"),
        import("@/modules/gastos/pages/gastos-page"),
        import("@/modules/ventas/pages/ventas-page")
      ]);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
function ProtectedRoutes() {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
}

function RouteFallback() {
  return <DataLoader label="Cargando pantalla..." className="min-h-48" />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <RoutePreloader />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/recuperar-contrasena" element={<ForgotPasswordPage />} />
          <Route path="/verificar-cuenta" element={<VerifyAccountPage />} />

          <Route element={<ProtectedRoutes />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/clientes" element={<ClientesPage />} />
              <Route path="/clientes/nuevo" element={<ClienteNuevoPage />} />
              <Route path="/clientes/:customerId/editar" element={<ClienteNuevoPage />} />
              <Route path="/mapa-clientes" element={<ClientesMapaPage />} />
              <Route path="/clientes/:customerId" element={<ClienteDetallePage />} />
              <Route path="/clientes/:customerId/contrato" element={<ClienteContratoPage />} />
              <Route path="/clientes/:customerId/pagos" element={<CustomerPaymentsPage />} />
              <Route path="/servicios" element={<ServiciosPage />} />
              <Route path="/productos" element={<ProductosPage />} />
              <Route path="/inventario" element={<Navigate to="/productos" replace />} />
              <Route path="/caja" element={<CajaPage />} />
              <Route path="/mensualidades" element={<CobranzaPage />} />
              <Route path="/cobranza" element={<Navigate to="/mensualidades" replace />} />
              <Route path="/compras" element={<ComprasPage />} />
              <Route path="/compras/nueva" element={<CompraNuevaPage />} />
              <Route path="/proveedores" element={<ProveedoresPage />} />
              <Route path="/compras/proveedores" element={<Navigate to="/proveedores" replace />} />
              <Route path="/gastos" element={<GastosPage />} />
              <Route path="/ventas" element={<VentasPage />} />
              <Route path="/ventas/nueva" element={<VentaNuevaPage />} />
              <Route path="/reportes" element={<ReportesPage />} />
              <Route path="/configuracion" element={<ConfiguracionPage />} />
              <Route path="/administracion" element={<AdministracionPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}




