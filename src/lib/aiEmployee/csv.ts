export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

const FORMULA_PREFIX = /^[=+\-@\t\r]/;

/**
 * Builds CSV text. Cells that start with a spreadsheet formula character are prefixed
 * with an apostrophe so exported lead data cannot execute as a formula in Excel or Sheets.
 */
export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const escape = (raw: string | number | null | undefined) => {
    let text = raw === null || raw === undefined ? '' : String(raw);
    if (FORMULA_PREFIX.test(text)) text = `'${text}`;
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const header = columns.map((c) => escape(c.header)).join(',');
  const body = rows.map((row) => columns.map((c) => escape(c.value(row))).join(','));
  return [header, ...body].join('\r\n');
}
