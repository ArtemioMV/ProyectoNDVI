import { Package, Plus, Search, Trash2, X } from "lucide-react";
import { DragEvent, ReactNode, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";

/**
 * Primitivos reutilizables del POS (catalogo en tarjetas + carrito con arrastrar-al-tacho).
 * Se usan igual en Ventas y en Compras; cada pagina pone sus propios controles y logica.
 */

function setGlobalDragCursor(active: boolean) {
  document.body.style.cursor = active ? "grabbing" : "";
}

export function PosLayout({ catalog, panel }: { catalog: ReactNode; panel: ReactNode }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-3">{catalog}</div>
      <div className="space-y-3 lg:sticky lg:top-20 lg:self-start">{panel}</div>
    </div>
  );
}

export function CatalogSearch({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
      <input
        className="w-full rounded-md border py-2 pl-9 pr-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

type ProductImageProps = {
  imageUrl?: string | null;
  name: string;
  className: string;
  iconClass: string;
  dragHandle?: boolean;
  onDragStart?: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
};

function ProductImage({ imageUrl, name, className, iconClass, dragHandle, onDragStart, onDragEnd }: ProductImageProps) {
  return (
    <div
      className={cn("grid place-items-center overflow-hidden bg-muted", dragHandle ? "cursor-grab active:cursor-grabbing" : "cursor-default", className)}
      draggable={dragHandle}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      title={dragHandle ? "Arrastrar producto" : undefined}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="h-full w-full select-none object-cover" draggable={false} />
      ) : (
        <Package className={cn("text-slate-300", iconClass)} />
      )}
    </div>
  );
}

export function CatalogCard({
  imageUrl,
  name,
  meta,
  children,
  addLabel = "Agregar",
  disabled,
  onAdd,
  dragMaterialId
}: {
  imageUrl?: string | null;
  name: string;
  meta: ReactNode;
  children: ReactNode;
  addLabel?: string;
  disabled?: boolean;
  onAdd: () => void;
  /** Si se pasa, la imagen se puede arrastrar a la lista para agregarla. */
  dragMaterialId?: string;
}) {
  return (
    <article className="flex cursor-default flex-col overflow-hidden rounded-lg border bg-background">
      <ProductImage
        imageUrl={imageUrl}
        name={name}
        className="h-28 w-full"
        iconClass="h-8 w-8"
        dragHandle={Boolean(dragMaterialId)}
        onDragStart={dragMaterialId ? (event) => {
          event.dataTransfer.effectAllowed = "copy";
          event.dataTransfer.setData("application/x-add-material", dragMaterialId);
          setGlobalDragCursor(true);
        } : undefined}
        onDragEnd={() => setGlobalDragCursor(false)}
      />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <h3 className="truncate text-sm font-semibold">{name}</h3>
          <p className="text-xs text-slate-500">{meta}</p>
        </div>
        {children}
        <Button className="mt-auto" size="sm" type="button" icon={<Plus className="h-4 w-4" />} disabled={disabled} onClick={onAdd}>
          {addLabel}
        </Button>
      </div>
    </article>
  );
}

export function CartItemCard({
  dragKey,
  imageUrl,
  name,
  detail,
  amount,
  onRemove
}: {
  dragKey: string;
  imageUrl?: string | null;
  name: string;
  detail: ReactNode;
  amount: ReactNode;
  onRemove: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", dragKey);
        setGlobalDragCursor(true);
      }}
      onDragEnd={() => setGlobalDragCursor(false)}
      className="group relative flex cursor-grab gap-2 rounded-md border bg-background p-2 active:cursor-grabbing"
      title="Arrastrar producto"
    >
      <ProductImage imageUrl={imageUrl} name={name} className="h-10 w-10 shrink-0 rounded" iconClass="h-4 w-4" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold">{name}</p>
        <p className="text-xs text-slate-500">{detail}</p>
        <p className="text-xs font-medium">{amount}</p>
      </div>
      <button
        type="button"
        aria-label="Quitar"
        onClick={onRemove}
        className="absolute right-1 top-1 rounded p-0.5 text-slate-400 opacity-0 transition hover:text-red-600 group-hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function TrashZone({ onDropKey }: { onDropKey: (key: string) => void }) {
  const [active, setActive] = useState(false);
  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setActive(true);
      }}
      onDragLeave={() => setActive(false)}
      onDrop={(event) => {
        event.preventDefault();
        const key = event.dataTransfer.getData("text/plain");
        if (key) onDropKey(key);
        setActive(false);
        setGlobalDragCursor(false);
      }}
      className={cn(
        "flex cursor-default items-center justify-center gap-2 rounded-md border-2 border-dashed py-2 text-xs transition",
        active ? "border-red-400 bg-red-50 text-red-600" : "border-slate-200 text-slate-400"
      )}
    >
      <Trash2 className="h-4 w-4" /> Arrastra un producto aqui para quitarlo
    </div>
  );
}

