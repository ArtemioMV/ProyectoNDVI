import { ShieldCheck, Tv } from "lucide-react";
import { ReactNode } from "react";
import { useCompanySettings } from "@/services/settings/company-settings";

type AuthShellProps = {
  children: ReactNode;
};

/**
 * Carcasa comun de las pantallas de acceso (login, recuperar, verificar).
 * Mantiene el panel de marca a la izquierda y el formulario SIEMPRE en la
 * misma posicion a la derecha, para que al navegar entre ellas nada salte.
 */
export function AuthShell({ children }: AuthShellProps) {
  const branding = useCompanySettings();
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Panel de marca */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-700 to-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-white/15 backdrop-blur">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt={branding.companyName} className="h-full w-full object-cover" />
            ) : (
              <Tv className="h-5 w-5" />
            )}
          </div>
          <span className="text-lg font-semibold tracking-wide">{branding.companyName}</span>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-3xl font-semibold leading-tight">{branding.loginHeadline}</h1>
          <p className="mt-4 text-sm text-white/70">{branding.loginSubline}</p>
        </div>

        <div className="relative flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-white/60">
          <ShieldCheck className="h-4 w-4" />
          {branding.loginFooter}
        </div>
      </aside>

      {/* Columna del formulario: posicion fija en todas las pantallas de auth */}
      <section className="flex items-center justify-center bg-muted px-4 py-10">
        <div className="w-full max-w-sm">
          {/* Marca visible en movil (no hay panel lateral) */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-primary text-white">
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt={branding.companyName} className="h-full w-full object-cover" />
              ) : (
                <Tv className="h-5 w-5" />
              )}
            </div>
            <span className="text-lg font-semibold">{branding.companyName}</span>
          </div>

          {children}

          <p className="mt-6 text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} {branding.companyName}. Acceso privado.
          </p>
        </div>
      </section>
    </main>
  );
}
