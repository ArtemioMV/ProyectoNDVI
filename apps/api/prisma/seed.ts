import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type PermissionSeed = {
  key: string;
  resource: string;
  action: string;
  description: string;
};

type RoleSeed = {
  name: string;
  description: string;
  permissionKeys: string[];
};

const PERMISSIONS: PermissionSeed[] = [
  { key: "organizations.read", resource: "organizations", action: "read", description: "View active organization data" },
  { key: "users.invite", resource: "users", action: "invite", description: "Invite users to the organization" },
  { key: "roles.assign", resource: "roles", action: "assign", description: "Assign roles to memberships" },

  { key: "parcels.read", resource: "parcels", action: "read", description: "View parcels" },
  { key: "parcels.create", resource: "parcels", action: "create", description: "Create parcels" },
  { key: "parcels.update", resource: "parcels", action: "update", description: "Update parcels" },
  { key: "parcels.delete", resource: "parcels", action: "delete", description: "Soft-delete parcels" },

  { key: "parcels.geometry.read", resource: "parcels", action: "geometry.read", description: "View geometry and history" },
  { key: "parcels.geometry.create", resource: "parcels", action: "geometry.create", description: "Draw or import geometry" },
  { key: "parcels.geometry.update", resource: "parcels", action: "geometry.update", description: "Create a corrected geometry version" },
  { key: "parcels.geometry.delete", resource: "parcels", action: "geometry.delete", description: "Retire a geometry version" },

  { key: "satellite.ndvi.process", resource: "satellite", action: "ndvi.process", description: "Request vegetation index processing" },
  { key: "satellite.ndvi.read", resource: "satellite", action: "ndvi.read", description: "View vegetation index results and history" },

  { key: "reports.export", resource: "reports", action: "export", description: "Export reports within effective scope" },
  { key: "audit.read", resource: "audit", action: "read", description: "View organization audit logs" },
];

const SYSTEM_ROLES: RoleSeed[] = [
  {
    name: "Administrador",
    description: "Template: complete organization administration",
    permissionKeys: PERMISSIONS.map((permission) => permission.key),
  },
  {
    name: "Operador agricola",
    description: "Template: manages parcels, geometry, and vegetation index processing",
    permissionKeys: [
      "organizations.read",
      "parcels.read",
      "parcels.create",
      "parcels.update",
      "parcels.geometry.read",
      "parcels.geometry.create",
      "parcels.geometry.update",
      "satellite.ndvi.process",
      "satellite.ndvi.read",
      "reports.export",
    ],
  },
  {
    name: "Visualizador",
    description: "Template: read-only access to parcels and satellite results",
    permissionKeys: [
      "organizations.read",
      "parcels.read",
      "parcels.geometry.read",
      "satellite.ndvi.read",
    ],
  },
];

const RECORD_STATUSES = [
  { name: "borrador", description: "Record being edited by evaluator", is_terminal: false },
  { name: "enviado", description: "Submitted for validation", is_terminal: false },
  { name: "validado", description: "Validated and no longer editable", is_terminal: true },
  { name: "rechazado", description: "Rejected; can be corrected and resubmitted", is_terminal: false },
];

const VEGETATION_INDICES = [
  { key: "NDVI", name: "Normalized Difference Vegetation Index", description: "General vegetation vigor using NIR and Red bands" },
  { key: "NDRE", name: "Normalized Difference Red Edge", description: "Canopy chlorophyll proxy using NIR and Red Edge bands" },
  { key: "NDMI", name: "Normalized Difference Moisture Index", description: "Vegetation moisture proxy using NIR and SWIR bands" },
  { key: "SAVI", name: "Soil Adjusted Vegetation Index", description: "Vegetation vigor adjusted for exposed soil" },
  { key: "EVI", name: "Enhanced Vegetation Index", description: "Enhanced vigor index reducing atmospheric and background effects" },
];

const SATELLITE_SOURCES = [
  { name: "Sentinel-2", provider: "ESA Copernicus", description: "Optical imagery at 10-20 m resolution, about 5 day revisit", is_active: true },
  { name: "Landsat 8/9", provider: "NASA/USGS", description: "Optical imagery at 30 m resolution, placeholder source", is_active: false },
];

const COUNTRIES = [
  { name: "Peru", iso2: "PE", iso3: "PER", numeric_code: 604 },
  { name: "Chile", iso2: "CL", iso3: "CHL", numeric_code: 152 },
  { name: "Colombia", iso2: "CO", iso3: "COL", numeric_code: 170 },
  { name: "Ecuador", iso2: "EC", iso3: "ECU", numeric_code: 218 },
  { name: "Mexico", iso2: "MX", iso3: "MEX", numeric_code: 484 },
];

const CROPS = [
  { name: "Arandano", code: "BLUE", description: "Vaccinium corymbosum" },
  { name: "Palto", code: "AVO", description: "Persea americana" },
  { name: "Uva", code: "GRAPE", description: "Vitis vinifera" },
];

async function seedPermissions(): Promise<Map<string, string>> {
  const keyToId = new Map<string, string>();

  for (const permission of PERMISSIONS) {
    const row = await prisma.permission.upsert({
      where: { key: permission.key },
      update: {
        resource: permission.resource,
        action: permission.action,
        description: permission.description,
      },
      create: permission,
    });

    keyToId.set(row.key, row.id);
  }

  console.log(`permissions: ${PERMISSIONS.length}`);
  return keyToId;
}

async function seedSystemRoles(keyToId: Map<string, string>): Promise<void> {
  for (const roleSeed of SYSTEM_ROLES) {
    let role = await prisma.role.findFirst({
      where: { organization_id: null, name: roleSeed.name, is_system: true },
    });

    if (!role) {
      role = await prisma.role.create({
        data: {
          organization_id: null,
          name: roleSeed.name,
          description: roleSeed.description,
          is_system: true,
        },
      });
    } else {
      role = await prisma.role.update({
        where: { id: role.id },
        data: { description: roleSeed.description },
      });
    }

    for (const key of roleSeed.permissionKeys) {
      const permissionId = keyToId.get(key);
      if (!permissionId) {
        throw new Error(`Role "${roleSeed.name}" references missing permission: ${key}`);
      }

      await prisma.rolePermission.upsert({
        where: { role_id_permission_id: { role_id: role.id, permission_id: permissionId } },
        update: {},
        create: { role_id: role.id, permission_id: permissionId },
      });
    }
  }

  console.log(`system roles: ${SYSTEM_ROLES.length}`);
}

async function seedRecordStatuses(): Promise<void> {
  for (const status of RECORD_STATUSES) {
    await prisma.recordStatus.upsert({
      where: { name: status.name },
      update: { description: status.description, is_terminal: status.is_terminal },
      create: status,
    });
  }

  console.log(`record_statuses: ${RECORD_STATUSES.length}`);
}

async function seedVegetationIndices(): Promise<void> {
  for (const index of VEGETATION_INDICES) {
    await prisma.vegetationIndex.upsert({
      where: { key: index.key },
      update: { name: index.name, description: index.description },
      create: index,
    });
  }

  console.log(`vegetation_indices: ${VEGETATION_INDICES.length}`);
}

async function seedSatelliteSources(): Promise<void> {
  for (const source of SATELLITE_SOURCES) {
    await prisma.satelliteSource.upsert({
      where: { name: source.name },
      update: { provider: source.provider, description: source.description, is_active: source.is_active },
      create: source,
    });
  }

  console.log(`satellite_sources: ${SATELLITE_SOURCES.length}`);
}

async function seedCountries(): Promise<void> {
  for (const country of COUNTRIES) {
    await prisma.country.upsert({
      where: { name: country.name },
      update: { iso2: country.iso2, iso3: country.iso3, numeric_code: country.numeric_code },
      create: country,
    });
  }

  console.log(`countries: ${COUNTRIES.length}`);
}

async function seedCrops(): Promise<void> {
  for (const crop of CROPS) {
    await prisma.crop.upsert({
      where: { name: crop.name },
      update: { code: crop.code, description: crop.description },
      create: crop,
    });
  }

  console.log(`crops: ${CROPS.length}`);
}

async function main(): Promise<void> {
  console.log("Seed Agro Geospatial SaaS");

  const keyToId = await seedPermissions();
  await seedSystemRoles(keyToId);
  await seedRecordStatuses();
  await seedVegetationIndices();
  await seedSatelliteSources();
  await seedCountries();
  await seedCrops();

  console.log("Seed complete. Safe to re-run.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
