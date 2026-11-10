// backend/src/utils/spreadsheet.js

const ExcelJS = require('exceljs');

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

function cellToString(value) {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'object') {
    if (value.text !== undefined) return String(value.text).trim();
    if (value.result !== undefined) return String(value.result).trim();
    return String(value).trim();
  }
  return String(value).trim();
}

async function parseExcel(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    return { headers: [], rows: [] };
  }

  const headerRow = worksheet.getRow(1);
  const headers = [];
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headers[colNumber - 1] = cellToString(cell.value);
  });

  const cleanHeaders = headers.filter((h) => h && h.length > 0);
  if (cleanHeaders.length === 0) {
    return { headers: [], rows: [] };
  }

  const rows = [];
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;

    const item = { __row: rowNumber };
    let hasAnyValue = false;

    cleanHeaders.forEach((header, idx) => {
      const cell = row.getCell(idx + 1);
      const value = cellToString(cell.value);
      item[header] = value;
      if (value !== '') hasAnyValue = true;
    });

    if (hasAnyValue) {
      rows.push(item);
    }
  });

  return { headers: cleanHeaders, rows };
}

async function parseSpreadsheet(buffer, originalName = 'upload.csv') {
  const filename = String(originalName).toLowerCase();

  if (filename.endsWith('.csv') || filename.endsWith('.txt')) {
    return parseCsv(buffer.toString('utf8'));
  }

  return parseExcel(buffer);
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