import {
  ShieldCheck,
  BarChart3,
  Bell,
  ChevronDown,
  Home,
  FileMinus2,
  LogOut,
  MapPinned,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  ShoppingCart,
  WalletCards,
  HandCoins,
  Tv,
  User,
  Users,
  Wifi,
  X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { clearSession, getUser } from "@/services/auth/session";
import { useCompanySettings } from "@/services/settings/company-settings";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/mapa-clientes", label: "Mapa", icon: MapPinned },
  { href: "/servicios", label: "Servicios", icon: Wifi },
  { href: "/productos", label: "Productos", icon: Package },
  { href: "/caja", label: "Caja", icon: WalletCards },
  { href: "/cobranza", label: "Cobranza", icon: HandCoins },
  { href: "/compras", label: "Compras", icon: ShoppingBag },
  { href: "/gastos", label: "Gastos", icon: FileMinus2 },
  { href: "/ventas", label: "Ventas", icon: ShoppingCart },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/administracion", label: "Administracion", icon: ShieldCheck }
];

function isDesktop() {
  return typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;
}

export function AdminLayout() {
  const navigate = useNavigate();
  // Escritorio: colapsar a franja de iconos. Movil: abrir/cerrar drawer.
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const user = getUser();
  const company = useCompanySettings();

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleLogout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  // La misma hamburguesa: en escritorio colapsa, en movil abre/cierra el drawer.
  function toggleSidebar() {
    if (isDesktop()) {
      setCollapsed((value) => !value);
    } else {
      setMobileOpen((value) => !value);
    }
  }

  function handleNavClick() {
    if (!isDesktop()) setMobileOpen(false);
  }

  return (
    <div className="min-h-screen bg-muted text-foreground">
      {/* Overlay solo en movil cuando el drawer esta abierto */}
      {mobileOpen ? (
        <button
          className="fixed inset-0 z-30 bg-slate-950/40 md:hidden"
          aria-label="Cerrar menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-background transition-all duration-200 md:translate-x-0",
          collapsed ? "md:w-20" : "md:w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        ].join(" ")}
      >
        <div
          className={[
            "flex h-14 items-center gap-3 border-b px-4",
            collapsed ? "md:justify-center md:px-0" : "justify-between"
          ].join(" ")}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-primary text-white">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.companyName} className="h-full w-full object-cover" />
              ) : (
                <Tv className="h-5 w-5" />
              )}
            </div>
            <div className={["min-w-0 leading-tight", collapsed ? "md:hidden" : ""].join(" ")}>
              <div className="truncate font-semibold">{company.companyName}</div>
              <div className="truncate text-xs text-slate-500">{company.tagline}</div>
            </div>
          </div>
          {/* La X solo cierra el drawer en movil; en escritorio se usa la hamburguesa */}
          <button
            className="shrink-0 rounded-md p-1.5 text-slate-500 hover:bg-muted md:hidden"
            aria-label="Cerrar menu"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={handleNavClick}
              title={item.label}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                  collapsed ? "md:justify-center md:px-2" : "",
                  isActive ? "bg-primary text-white" : "text-slate-600 hover:bg-muted"
                ].join(" ")
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className={collapsed ? "md:hidden" : ""}>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div
        className={[
          "transition-all duration-200",
          collapsed ? "md:pl-20" : "md:pl-64"
        ].join(" ")}
      >
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-2 border-b bg-background px-4">
          <div className="flex min-w-0 items-center gap-2">
            <button
              className="shrink-0 rounded-md border p-2 hover:bg-muted"
              aria-label="Abrir o cerrar menu"
              onClick={toggleSidebar}
            >
              <Menu className="h-4 w-4" />
            </button>
            <span className="truncate text-sm font-medium">{company.tagline}</span>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              className="relative rounded-md p-2 text-slate-600 hover:bg-muted"
              aria-label="Notificaciones"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <div className="relative" ref={menuRef}>
              <button
                className="flex items-center gap-2 rounded-md p-1.5 hover:bg-muted"
                onClick={() => setMenuOpen((value) => !value)}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {(user?.username ?? "A").slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden max-w-[8rem] truncate text-sm sm:block">
                  {user?.username ?? "Administrador"}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
              </button>

              {menuOpen ? (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-lg border bg-background shadow-lg">
                  <div className="border-b px-4 py-3">
                    <div className="truncate text-sm font-medium">{user?.username ?? "Administrador"}</div>
                    <div className="truncate text-xs text-slate-500">
                      {user?.roles?.join(", ") ?? "ADMINISTRADOR"}
                    </div>
                  </div>
                  <button className="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-muted">
                    <User className="h-4 w-4 text-slate-500" /> Mi perfil
                  </button>
                  <button
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-muted"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/configuracion");
                    }}
                  >
                    <Settings className="h-4 w-4 text-slate-500" /> Configuracion
                  </button>
                  <button
                    className="flex w-full items-center gap-3 border-t px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" /> Cerrar sesion
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}




