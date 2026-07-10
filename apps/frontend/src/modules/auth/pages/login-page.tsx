import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, Lock, LogIn, User } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { httpClient } from "@/services/api/http-client";
import { saveSession, SessionUser } from "@/services/auth/session";
import { AuthShell } from "../components/AuthShell";

type LoginResponse = {
  success: boolean;
  data: { accessToken: string; user: SessionUser };
  message?: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await httpClient.post<LoginResponse>("/auth/login", { username, password });
      return response.data;
    },
    onSuccess: (data) => {
      saveSession(data.data.accessToken, data.data.user);
      navigate("/dashboard", { replace: true });
    },
    onError: () => setError("Usuario o contrasena incorrectos.")
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError("Ingresa usuario y contrasena.");
      return;
    }
    loginMutation.mutate();
  }

  return (
    <AuthShell>
      <div className="rounded-2xl border bg-background p-7 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Acceso</p>
        <h2 className="mt-1 text-2xl font-semibold">Iniciar sesion</h2>
        <p className="mt-1 text-sm text-slate-500">Acceso administrativo del sistema.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium">
            Usuario
            <div className="relative mt-1.5">
              <User className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                className="w-full rounded-lg border py-2.5 pl-9 pr-3 font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                type="text"
                autoComplete="username"
                placeholder="admin@marvasolutions.lat"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>
          </label>

          <label className="block text-sm font-medium">
            Contrasena
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                className="w-full rounded-lg border py-2.5 pl-9 pr-10 font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="********"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                className="absolute right-2 top-2 rounded-md p-1 text-slate-400 hover:text-slate-600"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : null}

          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
            type="submit"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            Ingresar
          </button>

          <div className="flex items-center justify-between pt-1 text-sm">
            <Link className="text-slate-500 hover:text-primary hover:underline" to="/verificar-cuenta">
              Verificar cuenta
            </Link>
            <Link className="font-medium text-primary hover:underline" to="/recuperar-contrasena">
              Olvidaste tu contrasena?
            </Link>
          </div>
        </form>
      </div>
    </AuthShell>
  );
}
