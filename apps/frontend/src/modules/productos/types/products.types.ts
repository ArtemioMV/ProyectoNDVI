export type InventoryMovementType = "PURCHASE" | "SALE" | "INSTALLATION" | "REPLACEMENT" | "RETURN" | "ADJUSTMENT_IN" | "ADJUSTMENT_OUT";

export type Material = {
  id: string;
  sku?: string | null;
  name: string;
  description?: string | null;
  unit: string;
  // Ultimo costo registrado desde Compras. No se edita desde el catalogo.
  costPrice?: number | null;
  salePrice: number;
  coveragePrice?: number | null;
  installPrice?: number | null;
  // Marca los productos que son materiales de instalacion (se jalan en el alta de cliente).
  isInstallationMaterial?: boolean;
  // URL de la foto del producto (jpg, png, webp, etc.).
  imageUrl?: string | null;
  stock: number;
  minStock: number;
  isActive: boolean;
  isLowStock: boolean;
};

export type CreateMaterialPayload = {
  sku?: string;
  name: string;
  description?: string;
  unit: string;
  salePrice: number;
  coveragePrice?: number;
  installPrice?: number;
  isInstallationMaterial?: boolean;
  imageUrl?: string;
  minStock?: number;
};

export type CreateMaterialMovementPayload = {
  type: Exclude<InventoryMovementType, "PURCHASE" | "SALE">;
  quantity: number;
  reason?: string;
  reference?: string;
};