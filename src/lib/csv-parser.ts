/**
 * Minimal RFC-4180-ish CSV parser used by the Migration wizard.
 * Handles quoted fields, escaped quotes, CRLF, and trailing newlines.
 * Returns headers + rows of strings — type coercion happens later in
 * the field mapping / validation step.
 */

export interface ParsedCsv {
  headers: string[];
  rows: string[][];
  /** Records as { header: value } for convenience. */
  records: Record<string, string>[];
}

export function parseCsv(text: string): ParsedCsv {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  // Strip BOM
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      continue;
    }
    if (ch === "\r") continue;
    if (ch === "\n") {
      row.push(field);
      rows.push(row);
      field = "";
      row = [];
      continue;
    }
    field += ch;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Drop trailing empty rows
  while (rows.length && rows[rows.length - 1].every((c) => c.trim() === "")) {
    rows.pop();
  }

  if (rows.length === 0) {
    return { headers: [], rows: [], records: [] };
  }

  const headers = rows[0].map((h) => h.trim());
  const dataRows = rows.slice(1);
  const records = dataRows.map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = (r[idx] ?? "").trim();
    });
    return obj;
  });

  return { headers, rows: dataRows, records };
}

/**
 * Suggest a Tinara field for an incoming CSV header using simple
 * normalisation + alias matching. Returns null if no confident match.
 */
export function suggestField(
  header: string,
  candidates: { key: string; aliases: string[] }[]
): string | null {
  const normalised = header.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const c of candidates) {
    const all = [c.key, ...c.aliases].map((a) =>
      a.toLowerCase().replace(/[^a-z0-9]/g, "")
    );
    if (all.includes(normalised)) return c.key;
  }
  return null;
}
