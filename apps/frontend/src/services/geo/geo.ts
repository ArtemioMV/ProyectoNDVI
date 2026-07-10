/**
 * Datos geograficos servidos como JSON estatico (public/data), NO bundleados en el JS.
 * Peru mantiene el ubigeo detallado INEI. Otros paises usan un catalogo regional operativo.
 * Si falta un pais, se genera una estructura demo con el nombre del pais para no bloquear el registro.
 */
export type Country = { code: string; name: string };
export type UbigeoProvince = { name: string; districts: string[] };
export type UbigeoDepartment = { name: string; provinces: UbigeoProvince[] };
export type RegionalUbigeo = Record<string, UbigeoDepartment[]>;
export type GeoPoint = { latitude: number; longitude: number };

const countryCenters: Record<string, GeoPoint> = {
  PE: { latitude: -12.0464, longitude: -77.0428 },
  AO: { latitude: -8.839, longitude: 13.2894 },
  AR: { latitude: -34.6037, longitude: -58.3816 },
  BO: { latitude: -16.4897, longitude: -68.1193 },
  BR: { latitude: -15.7939, longitude: -47.8828 },
  CA: { latitude: 45.4215, longitude: -75.6972 },
  CL: { latitude: -33.4489, longitude: -70.6693 },
  CO: { latitude: 4.711, longitude: -74.0721 },
  EC: { latitude: -0.1807, longitude: -78.4678 },
  ES: { latitude: 40.4168, longitude: -3.7038 },
  MX: { latitude: 19.4326, longitude: -99.1332 },
  US: { latitude: 38.9072, longitude: -77.0369 }
};

function buildDemoUbigeo(countryName: string): UbigeoDepartment[] {
  const cleanName = countryName || "Pais";
  return [
    {
      name: `${cleanName} Centro`,
      provinces: [
        { name: "Capital", districts: ["Centro", "Norte", "Sur"] },
        { name: "Zona metropolitana", districts: ["Este", "Oeste", "Industrial"] }
      ]
    },
    {
      name: `${cleanName} Norte`,
      provinces: [
        { name: "Provincia norte", districts: ["Norte 1", "Norte 2", "Norte 3"] }
      ]
    },
    {
      name: `${cleanName} Sur`,
      provinces: [
        { name: "Provincia sur", districts: ["Sur 1", "Sur 2", "Sur 3"] }
      ]
    }
  ];
}

function stableHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function demoCoordinates(countryCode: string, parts: string[]): GeoPoint {
  const center = countryCenters[countryCode] ?? { latitude: 0, longitude: 0 };
  const hash = stableHash([countryCode, ...parts].join("|"));
  const latOffset = ((hash % 1200) / 1200 - 0.5) * 1.2;
  const lngOffset = (((Math.floor(hash / 1200) % 1200) / 1200) - 0.5) * 1.2;
  return {
    latitude: Number((center.latitude + latOffset).toFixed(6)),
    longitude: Number((center.longitude + lngOffset).toFixed(6))
  };
}

export async function fetchCountries(): Promise<Country[]> {
  const response = await fetch("/data/countries.json");
  if (!response.ok) throw new Error("No se pudo cargar paises");
  return response.json();
}

export async function fetchUbigeo(countryCode = "PE"): Promise<UbigeoDepartment[]> {
  if (countryCode === "PE") {
    const response = await fetch("/data/peru-ubigeo.json");
    if (!response.ok) throw new Error("No se pudo cargar ubigeo");
    return response.json();
  }

  const response = await fetch("/data/regional-ubigeo.json");
  if (!response.ok) throw new Error("No se pudo cargar ubigeo regional");
  const data = (await response.json()) as RegionalUbigeo;
  if (data[countryCode]?.length) return data[countryCode];

  const countries = await fetchCountries();
  const countryName = countries.find((country) => country.code === countryCode)?.name ?? countryCode;
  return buildDemoUbigeo(countryName);
}
