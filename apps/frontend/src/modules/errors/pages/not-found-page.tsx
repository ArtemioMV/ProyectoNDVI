import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Pagina no encontrada</h1>
      <p className="text-sm text-slate-500">La ruta solicitada no existe.</p>
      <Link className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-white" to="/dashboard">
        Volver al dashboard
      </Link>
    </section>
  );
}
