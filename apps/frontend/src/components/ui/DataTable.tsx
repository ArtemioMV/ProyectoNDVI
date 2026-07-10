import { Fragment, ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Columns3, Pin, PinOff, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "./Button";
import { IconAction } from "./IconAction";
import { cn } from "./cn";
import { DataLoader } from "./DataLoader";
import { Tooltip } from "./Tooltip";

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  visibleByDefault?: boolean;
  pinnedByDefault?: boolean;
  className?: string;
  headerClassName?: string;
  minWidth?: number;
};

type TablePreferences = {
  order: string[];
  hidden: string[];
  pinnedId: string | null;
};

type DataTableProps<T> = {
  storageKey: string;
  columns: Array<DataTableColumn<T>>;
  data: T[];
  getRowId: (row: T) => string;
  title?: string;
  description?: string;
  toolbar?: ReactNode;
  isLoading?: boolean;
  emptyMessage?: string;
  minWidth?: number;
  className?: string;
  /** Filas por pagina. Usa 0 para desactivar la paginacion y mostrar todo. */
  pageSize?: number;
  renderExpandedRow?: (row: T) => ReactNode;
};

type PopoverPosition = {
  top: number;
  left: number;
};

function getDefaultPreferences<T>(columns: Array<DataTableColumn<T>>): TablePreferences {
  return {
    order: columns.map((column) => column.id),
    hidden: columns.filter((column) => column.visibleByDefault === false).map((column) => column.id),
    pinnedId: columns.find((column) => column.pinnedByDefault)?.id ?? null
  };
}

function mergePreferences<T>(columns: Array<DataTableColumn<T>>, stored: TablePreferences | null): TablePreferences {
  const defaults = getDefaultPreferences(columns);
  if (!stored) return defaults;

  const columnIds = new Set(columns.map((column) => column.id));
  const storedOrder = stored.order.filter((id) => columnIds.has(id));
  const missingOrder = defaults.order.filter((id) => !storedOrder.includes(id));
  const hidden = stored.hidden.filter((id) => columnIds.has(id));
  const pinnedId = stored.pinnedId && columnIds.has(stored.pinnedId) ? stored.pinnedId : defaults.pinnedId;

  return { order: [...storedOrder, ...missingOrder], hidden, pinnedId };
}

function readPreferences(storageKey: string): TablePreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as TablePreferences) : null;
  } catch {
    return null;
  }
}

function writePreferences(storageKey: string, preferences: TablePreferences) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(preferences));
}

export function DataTable<T>({
  storageKey,
  columns,
  data,
  getRowId,
  title,
  description,
  toolbar,
  isLoading = false,
  emptyMessage = "No hay datos para mostrar.",
  minWidth = 840,
  className,
  pageSize = 10,
  renderExpandedRow
}: DataTableProps<T>) {
  const settingsButtonRef = useRef<HTMLButtonElement | null>(null);
  const settingsPanelRef = useRef<HTMLDivElement | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsPosition, setSettingsPosition] = useState<PopoverPosition | null>(null);
  const [preferences, setPreferences] = useState<TablePreferences>(() => mergePreferences(columns, readPreferences(storageKey)));
  const [page, setPage] = useState(0);

  const paginationEnabled = pageSize > 0;
  const totalPages = paginationEnabled ? Math.max(1, Math.ceil(data.length / pageSize)) : 1;
  const currentPage = Math.min(page, totalPages - 1);

  useEffect(() => {
    if (page !== currentPage) setPage(currentPage);
  }, [page, currentPage]);

  const pageData = paginationEnabled ? data.slice(currentPage * pageSize, currentPage * pageSize + pageSize) : data;
  const rangeStart = data.length === 0 ? 0 : currentPage * pageSize + 1;
  const rangeEnd = paginationEnabled ? Math.min(data.length, (currentPage + 1) * pageSize) : data.length;

  useEffect(() => {
    setPreferences((current) => mergePreferences(columns, current));
  }, [columns]);

  useEffect(() => {
    writePreferences(storageKey, preferences);
  }, [preferences, storageKey]);

  useLayoutEffect(() => {
    if (!settingsOpen) return;

    function updatePosition() {
      const button = settingsButtonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const panelWidth = 352;
      const margin = 12;
      const left = Math.min(Math.max(margin, rect.right - panelWidth), window.innerWidth - panelWidth - margin);
      setSettingsPosition({ top: rect.bottom + 8, left });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [settingsOpen]);

  useEffect(() => {
    if (!settingsOpen) return;

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (settingsPanelRef.current?.contains(target) || settingsButtonRef.current?.contains(target)) return;
      setSettingsOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSettingsOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [settingsOpen]);

  const columnsById = useMemo(() => new Map(columns.map((column) => [column.id, column])), [columns]);
  const orderedColumns = preferences.order.map((id) => columnsById.get(id)).filter(Boolean) as Array<DataTableColumn<T>>;
  const visibleColumns = orderedColumns.filter((column) => !preferences.hidden.includes(column.id));

  function resetPreferences() {
    setPreferences(getDefaultPreferences(columns));
  }

  function toggleColumn(columnId: string) {
    setPreferences((current) => {
      const isHidden = current.hidden.includes(columnId);
      const hidden = isHidden ? current.hidden.filter((id) => id !== columnId) : [...current.hidden, columnId];
      const pinnedId = hidden.includes(current.pinnedId ?? "") ? null : current.pinnedId;
      return { ...current, hidden, pinnedId };
    });
  }

  function moveColumn(columnId: string, direction: "up" | "down") {
    setPreferences((current) => {
      const index = current.order.indexOf(columnId);
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.order.length) return current;
      const order = [...current.order];
      const [item] = order.splice(index, 1);
      order.splice(nextIndex, 0, item);
      return { ...current, order };
    });
  }

  function togglePinned(columnId: string) {
    setPreferences((current) => ({ ...current, pinnedId: current.pinnedId === columnId ? null : columnId }));
  }

  const settingsPanel = settingsOpen && settingsPosition
    ? createPortal(
        <div
          ref={settingsPanelRef}
          className="fixed z-[110] w-[22rem] max-w-[calc(100vw-1.5rem)] rounded-lg border bg-background p-3 shadow-xl shadow-slate-900/15"
          style={{ top: settingsPosition.top, left: settingsPosition.left }}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <strong className="text-sm">Vista de tabla</strong>
              <p className="text-xs text-slate-500">Activa columnas, cambia orden y fija una columna.</p>
            </div>
            <Columns3 className="h-4 w-4 text-slate-400" />
          </div>
          <div className="max-h-[min(22rem,calc(100vh-9rem))] space-y-2 overflow-y-auto pr-1">
            {orderedColumns.map((column, index) => {
              const visible = !preferences.hidden.includes(column.id);
              const pinned = preferences.pinnedId === column.id;
              return (
                <div key={column.id} className="grid grid-cols-[1fr_auto] gap-2 rounded-md border p-2">
                  <label className="flex min-w-0 items-center gap-2 text-sm">
                    <input type="checkbox" className="h-4 w-4 rounded border-slate-300" checked={visible} onChange={() => toggleColumn(column.id)} />
                    <span className="truncate">{column.header}</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <IconAction label="Subir columna" icon={<ArrowUp />} tone="primary" variant="soft" size="sm" disabled={index === 0} onClick={() => moveColumn(column.id, "up")} />
                    <IconAction label="Bajar columna" icon={<ArrowDown />} tone="primary" variant="soft" size="sm" disabled={index === orderedColumns.length - 1} onClick={() => moveColumn(column.id, "down")} />
                    <IconAction label={pinned ? "Quitar fijado" : "Fijar columna"} icon={pinned ? <PinOff /> : <Pin />} tone="primary" variant={pinned ? "solid" : "soft"} size="sm" disabled={!visible} onClick={() => togglePinned(column.id)} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div className={cn("overflow-hidden rounded-lg border bg-background", className)}>
      {title || description || toolbar ? (
        <div className="grid gap-3 border-b p-4 lg:grid-cols-[minmax(14rem,1fr)_auto] lg:items-center">
          <div className="min-w-0">
            {title ? <h2 className="font-semibold">{title}</h2> : null}
            {description ? <p className="text-sm text-slate-500">{description}</p> : null}
          </div>
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            {toolbar}
            <div className="flex shrink-0 items-center gap-2">
              <Tooltip label="Configurar columnas">
                <Button ref={settingsButtonRef} type="button" variant="secondary" size="sm" icon={<SlidersHorizontal className="h-4 w-4" />} onClick={() => setSettingsOpen((open) => !open)}>
                  Columnas
                </Button>
              </Tooltip>
              <IconAction
                label="Restablecer vista por defecto"
                icon={<RotateCcw />}
                tone="primary"
                variant="soft"
                size="sm"
                aria-label="Restablecer columnas"
                onClick={resetPreferences}
              />
              {settingsPanel}
            </div>
          </div>
        </div>
      ) : null}

      {isLoading ? <DataLoader /> : null}
      {!isLoading && data.length === 0 ? <div className="p-6 text-sm text-slate-500">{emptyMessage}</div> : null}
      {!isLoading && data.length > 0 ? (
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full border-collapse text-sm" style={{ minWidth }}>
            <thead className="bg-muted text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {visibleColumns.map((column) => {
                  const pinned = preferences.pinnedId === column.id;
                  return (
                    <th
                      key={column.id}
                      className={cn("px-4 py-3 font-semibold", pinned && "sticky left-0 z-20 bg-muted shadow-[8px_0_12px_-12px_rgba(15,23,42,0.45)]", column.headerClassName)}
                      style={column.minWidth ? { minWidth: column.minWidth } : undefined}
                    >
                      {column.header}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y">
              {pageData.map((row) => {
                const expanded = renderExpandedRow?.(row);
                return (
                  <Fragment key={getRowId(row)}>
                    <tr className="hover:bg-muted/40">
                      {visibleColumns.map((column) => {
                        const pinned = preferences.pinnedId === column.id;
                        return (
                          <td key={column.id} className={cn("px-4 py-3 align-top", pinned && "sticky left-0 z-10 bg-background shadow-[8px_0_12px_-12px_rgba(15,23,42,0.45)]", column.className)}>
                            {column.cell(row)}
                          </td>
                        );
                      })}
                    </tr>
                    {expanded ? (
                      <tr>
                        <td colSpan={visibleColumns.length} className="border-t bg-muted/20 px-4 py-4">
                          {expanded}
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {!isLoading && paginationEnabled && data.length > 0 ? (
        <div className="flex flex-col gap-2 border-t px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Mostrando <strong className="text-slate-700">{rangeStart}</strong>-<strong className="text-slate-700">{rangeEnd}</strong> de <strong className="text-slate-700">{data.length}</strong>
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<ChevronLeft className="h-4 w-4" />}
              disabled={currentPage === 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
            >
              Anterior
            </Button>
            <span className="px-1 text-xs">
              Pagina <strong className="text-slate-700">{currentPage + 1}</strong> de {totalPages}
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}



