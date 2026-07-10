import maplibregl, { type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { ExternalLink, LocateFixed, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";

/**
 * Mapa interactivo con MapLibre GL (open-source, sin token) sobre tiles de OpenStreetMap.
 * Modo editable: clic o arrastrar el pin para fijar coordenadas. Cuando exista un
 * `MAP_TILES_URL` propio, se cambia la fuente de tiles aqui.
 */

const OSM_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
      ],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap"
    }
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }]
};

// Lima como centro por defecto cuando no hay coordenadas. [lng, lat]
const DEFAULT_CENTER: [number, number] = [-77.0428, -12.0464];

function toNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return NaN;
  return Number(value);
}

export function hasCoords(lat: string | number | null | undefined, lng: string | number | null | undefined) {
  const a = toNumber(lat);
  const b = toNumber(lng);
  return !Number.isNaN(a) && !Number.isNaN(b) && (a !== 0 || b !== 0);
}

type LocationMapProps = {
  lat: string | number | null | undefined;
  lng: string | number | null | undefined;
  editable?: boolean;
  onChange?: (lat: number, lng: number) => void;
  className?: string;
};

export function LocationMap({ lat, lng, editable = false, onChange, className }: LocationMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const a = toNumber(lat);
  const b = toNumber(lng);
  const valid = hasCoords(lat, lng);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const center: [number, number] = valid ? [b, a] : DEFAULT_CENTER;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_STYLE,
      center,
      zoom: valid ? 15 : 11
    });
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;

    const marker = new maplibregl.Marker({ color: "#2563eb", draggable: editable }).setLngLat(center);
    if (valid) marker.addTo(map);
    markerRef.current = marker;

    if (editable) {
      map.on("click", (event) => {
        marker.setLngLat(event.lngLat).addTo(map);
        onChangeRef.current?.(event.lngLat.lat, event.lngLat.lng);
      });
      marker.on("dragend", () => {
        const position = marker.getLngLat();
        onChangeRef.current?.(position.lat, position.lng);
      });
    }

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Init una sola vez; los cambios externos se sincronizan en el efecto de abajo.
  }, []);

  // Sincroniza coordenadas que cambian desde afuera (boton "usar mi ubicacion" o al escribir).
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker || !valid) return;
    marker.setLngLat([b, a]).addTo(map);
    map.setCenter([b, a]);
  }, [a, b, valid]);

  if (!valid && !editable) {
    return (
      <div className={cn("grid place-items-center rounded-md border border-dashed text-xs text-slate-400", className)}>
        <span className="flex items-center gap-1">
          <MapPin className="h-4 w-4" /> Sin coordenadas
        </span>
      </div>
    );
  }

  return <div ref={containerRef} className={cn("overflow-hidden rounded-md border", className)} />;
}

export function LocationLinks({ lat, lng }: { lat: string | number | null | undefined; lng: string | number | null | undefined }) {
  if (!hasCoords(lat, lng)) return null;
  const a = toNumber(lat);
  const b = toNumber(lng);
  return (
    <a className="inline-flex items-center gap-1 text-xs text-primary hover:underline" href={`https://www.google.com/maps?q=${a},${b}`} target="_blank" rel="noreferrer">
      <ExternalLink className="h-4 w-4" /> Abrir en Google Maps
    </a>
  );
}

export function UseMyLocationButton({ onLocate }: { onLocate: (lat: number, lng: number) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function locate() {
    if (!navigator.geolocation) {
      setError("Este dispositivo no soporta geolocalizacion.");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocate(position.coords.latitude, position.coords.longitude);
        setLoading(false);
      },
      () => {
        setError("No se pudo obtener la ubicacion. Revisa los permisos.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="space-y-1">
      <Button type="button" size="sm" variant="secondary" icon={<LocateFixed className="h-4 w-4" />} disabled={loading} onClick={locate}>
        {loading ? "Ubicando..." : "Usar mi ubicacion"}
      </Button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}



/** Tono del pin segun cobranza: al dia, con deuda, deuda vencida o servicio inactivo. */
export type CustomerPointTone = "ok" | "debt" | "overdue" | "inactive";

type CustomerMapPoint = {
  id: string;
  name: string;
  zone: string;
  monthly: number;
  lat: string | number | null | undefined;
  lng: string | number | null | undefined;
  services?: string;
  documentNumber?: string;
  phone?: string | null;
  statusLabel?: string;
  debt?: number;
  tone?: CustomerPointTone;
};

type CustomerPointsMapProps = {
  points: CustomerMapPoint[];
  className?: string;
  selectedPointId?: string | null;
  onPointClick?: (point: CustomerMapPoint) => void;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[char] ?? char);
}

const toneStyles: Record<CustomerPointTone, { base: string; ring: string }> = {
  ok: { base: "bg-emerald-600", ring: "ring-emerald-300" },
  debt: { base: "bg-amber-500", ring: "ring-amber-300" },
  overdue: { base: "bg-red-600", ring: "ring-red-300" },
  inactive: { base: "bg-slate-400", ring: "ring-slate-300" }
};

function markerElement(tone: CustomerPointTone, active: boolean) {
  const styles = toneStyles[tone];
  const element = document.createElement("button");
  element.type = "button";
  element.className = [
    "grid h-7 w-7 place-items-center rounded-full border-2 border-white shadow-lg transition",
    styles.base,
    active ? `scale-125 ring-4 ${styles.ring}` : "hover:scale-110"
  ].join(" ");
  element.innerHTML = '<span class="h-2.5 w-2.5 rounded-full bg-white"></span>';
  return element;
}

export function CustomerPointsMap({ points, className, selectedPointId, onPointClick }: CustomerPointsMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const onPointClickRef = useRef(onPointClick);
  onPointClickRef.current = onPointClick;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_STYLE,
      center: DEFAULT_CENTER,
      zoom: 10
    });
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const bounds = new maplibregl.LngLatBounds();
    let validCount = 0;

    points.forEach((point) => {
      if (!hasCoords(point.lat, point.lng)) return;
      const latNumber = toNumber(point.lat);
      const lngNumber = toNumber(point.lng);
      const element = markerElement(point.tone ?? "ok", point.id === selectedPointId);
      element.setAttribute("aria-label", point.name);
      element.addEventListener("click", () => onPointClickRef.current?.(point));

      const debt = point.debt ?? 0;
      const debtBadge = debt > 0
        ? '<span style="border-radius:999px;background:#fef2f2;color:#b91c1c;padding:3px 9px;font-size:11px;font-weight:700;white-space:nowrap">Debe ' + escapeHtml(new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(debt)) + '</span>'
        : '<span style="border-radius:999px;background:#dcfce7;color:#15803d;padding:3px 9px;font-size:11px;font-weight:700;white-space:nowrap">Al dia</span>';

      const popupHtml = [
        '<div style="min-width: 238px; font-family: Inter, system-ui, sans-serif; color:#0f172a; border-radius:18px; overflow:hidden; background:#ffffff">',
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px 8px">',
        '<div style="min-width:0"><strong style="display:block;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;line-height:1.25">', escapeHtml(point.name), '</strong>',
        point.documentNumber ? '<span style="display:block;margin-top:3px;color:#64748b;font-size:11px">DNI ' + escapeHtml(point.documentNumber) + '</span>' : '',
        '</div>',
        debtBadge,
        '</div>',
        '<div style="padding:0 12px 10px">',
        '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">',
        '<span style="border-radius:999px;background:#f1f5f9;color:#475569;padding:4px 8px;font-size:11px">', escapeHtml(point.zone), '</span>',
        point.phone ? '<span style="border-radius:999px;background:#f1f5f9;color:#475569;padding:4px 8px;font-size:11px">' + escapeHtml(point.phone) + '</span>' : '',
        '</div>',
        '<p style="margin:0;color:#334155;font-size:12px;line-height:1.35">', escapeHtml(point.services || "Sin servicios"), '</p>',
        '</div>',
        '<div style="display:flex;align-items:center;justify-content:space-between;background:#f8fafc;border-top:1px solid #e2e8f0;padding:8px 12px">',
        '<span style="color:#64748b;font-size:11px;font-weight:600">Mensualidad</span>',
        '<strong style="font-size:13px">', escapeHtml(new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(point.monthly)), '</strong>',
        '</div>',
        '</div>'
      ].join("");

      const marker = new maplibregl.Marker({ element })
        .setLngLat([lngNumber, latNumber])
        .setPopup(new maplibregl.Popup({ offset: 16, closeButton: false, closeOnClick: true, maxWidth: "260px" }).setHTML(popupHtml))
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend([lngNumber, latNumber]);
      validCount += 1;
    });

    if (validCount === 1) {
      map.setCenter(bounds.getCenter());
      map.setZoom(14);
    } else if (validCount > 1) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 400 });
    }

    window.setTimeout(() => map.resize(), 0);
  }, [points, selectedPointId]);

  if (points.length === 0) {
    return (
      <div className={cn("grid place-items-center rounded-md border border-dashed text-sm text-slate-500", className)}>
        No hay clientes con coordenadas para este filtro.
      </div>
    );
  }

  return <div ref={containerRef} className={cn("overflow-hidden rounded-md border", className)} />;
}




