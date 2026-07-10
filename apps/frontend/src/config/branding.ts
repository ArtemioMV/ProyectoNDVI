/**
 * Datos de marca. Por ahora son constantes, pero estan aislados aqui porque
 * seran administrables desde el panel (modulo de configuracion): nombre,
 * logo, colores, etc. Cuando exista el endpoint de settings, este archivo
 * pasara a leer de la API en vez de constantes.
 */
export const branding = {
  companyName: "NovaLink",
  tagline: "Panel administrativo",
  // Textos del panel de marca en el login.
  loginHeadline: "Bienvenido de vuelta.",
  loginSubline: "Gestiona clientes, servicios, mensualidades y caja desde un solo lugar.",
  loginFooter: "Solo personal autorizado",
  // Placeholder de logo. Se reemplazara por la URL del logo subido en el panel.
  logoUrl: null as string | null
};
