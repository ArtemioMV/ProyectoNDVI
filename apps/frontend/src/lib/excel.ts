import * as XLSX from "xlsx";

/**
 * Exportacion a Excel real (.xlsx) con SheetJS. Cada hoja recibe filas como
 * objetos; los encabezados salen de las llaves en el orden dado.
 */
export type ExcelSheet = {
  name: string;
  rows: Array<Record<string, string | number | null | undefined>>;
};

export function exportToExcel(filename: string, sheets: ExcelSheet[]) {
  const workbook = XLSX.utils.book_new();
  for (const sheet of sheets) {
    const worksheet = XLSX.utils.json_to_sheet(sheet.rows.length > 0 ? sheet.rows : [{}]);
    // Ancho de columnas segun el contenido mas largo (tope 40 caracteres).
    const headers = sheet.rows.length > 0 ? Object.keys(sheet.rows[0]) : [];
    worksheet["!cols"] = headers.map((header) => {
      const longest = Math.max(header.length, ...sheet.rows.map((row) => String(row[header] ?? "").length));
      return { wch: Math.min(Math.max(longest + 2, 10), 40) };
    });
    // Los nombres de hoja en Excel van hasta 31 caracteres.
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name.slice(0, 31));
  }
  XLSX.writeFile(workbook, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}
