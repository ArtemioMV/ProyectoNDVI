import { ArrowLeft, BadgeCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "react-router";
import { useCompanySettings } from "@/services/settings/company-settings";
import { AuthShell } from "../components/AuthShell";

export function VerifyAccountPage() {
  const branding = useCompanySettings();
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (code.trim().length < 4) return;
    // Endpoint /auth/verify-account pendiente (ver docs/pending-work.md).
    setVerified(true);
  }

  return (
    <AuthShell>
      <div className="rounded-2xl border bg-background p-7 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Verificar</p>
        <h2 className="mt-1 text-2xl font-semibold">Verificar cuenta</h2>
        <p className="mt-1 text-sm text-slate-500">
          Ingresa el codigo que recibiste. Las cuentas de {branding.companyName} las crea un administrador.
        </p>

        {verified ? (
          <div className="mt-6 space-y-4 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-green-50 text-green-600">
              <BadgeCheck className="h-6 w-6" />
            </div>
            <p className="text-sm text-slate-600">
              Cuenta verificada. Ya puedes iniciar sesion con las credenciales que te asignaron.
            </p>
            <Link className="inline-flex items-center gap-2 text-sm text-primary hover:underline" to="/login">
              <ArrowLeft className="h-4 w-4" /> Ir a iniciar sesion
            </Link>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium">
              Codigo de verificacion
              <input
                className="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-center font-mono text-lg tracking-widest outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
            </label>
            <button
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
              type="submit"
            >
              Verificar
            </button>
            <Link className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary hover:underline" to="/login">
              <ArrowLeft className="h-4 w-4" /> Volver a iniciar sesion
            </Link>
          </form>
        )}
      </div>
    </AuthShell>
  );
}
