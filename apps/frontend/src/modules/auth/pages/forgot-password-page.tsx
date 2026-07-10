import { ArrowLeft, MailCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "react-router";
import { AuthShell } from "../components/AuthShell";

export function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!username.trim()) return;
    // Endpoint /auth/forgot-password pendiente (ver docs/pending-work.md).
    setSent(true);
  }

  return (
    <AuthShell>
      <div className="rounded-2xl border bg-background p-7 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Recuperar</p>
        <h2 className="mt-1 text-2xl font-semibold">Recuperar contrasena</h2>
        <p className="mt-1 text-sm text-slate-500">Te enviaremos las instrucciones al contacto registrado de tu cuenta.</p>

        {sent ? (
          <div className="mt-6 space-y-4 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-green-50 text-green-600">
              <MailCheck className="h-6 w-6" />
            </div>
            <p className="text-sm text-slate-600">
              Si <strong>{username}</strong> corresponde a una cuenta valida, se enviaran los pasos para restablecer la contrasena.
            </p>
            <Link className="inline-flex items-center gap-2 text-sm text-primary hover:underline" to="/login">
              <ArrowLeft className="h-4 w-4" /> Volver a iniciar sesion
            </Link>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium">
              Usuario o correo
              <input
                className="mt-1.5 w-full rounded-lg border px-3 py-2.5 font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </label>
            <button
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
              type="submit"
            >
              Enviar instrucciones
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
