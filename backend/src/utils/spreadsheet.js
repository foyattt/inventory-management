// backend/src/utils/spreadsheet.js

const XLSX = require('xlsx');

function splitCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function normalizeHeader(header) {
  return String(header || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

function parseCsv(text) {
  const lines = String(text)
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '');

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = splitCsvLine(lines[0]).map((header) => header.trim());
  const rows = lines.slice(1).map((line, index) => {
    const values = splitCsvLine(line);
    const row = { __row: index + 2 };
    headers.forEach((header, idx) => {
      row[header] = (values[idx] ?? '').trim();
    });
    return row;
  });

  return { headers, rows };
}

function parseSpreadsheet(buffer, originalName = 'upload.csv') {
  const filename = String(originalName).toLowerCase();

  if (filename.endsWith('.csv') || filename.endsWith('.txt')) {
    return parseCsv(buffer.toString('utf8'));
  }

  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { headers: [], rows: [] };
  }

  const sheet = workbook.Sheets[sheetName];
  const jsonRows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
  const headers = jsonRows.length ? Object.keys(jsonRows[0]) : [];
  const rows = jsonRows.map((row, index) => ({
    ...row,
    __row: index + 2,
  }));

  return { headers, rows };
}

function getField(row, aliases) {
  const map = {};
  Object.keys(row).forEach((key) => {
    if (key === '__row') return;
    map[normalizeHeader(key)] = row[key];
  });

  for (const alias of aliases) {
    const value = map[normalizeHeader(alias)];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }

  return '';
}

module.exports = {
  splitCsvLine,
  normalizeHeader,
  parseCsv,
  parseSpreadsheet,
  getField,
};
