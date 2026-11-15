// backend/src/modules/inventory/import.service.js

const prisma = require('../../prisma/client');
const { AppError } = require('../../middleware/error.middleware');
const { parseSpreadsheet, getField } = require('../../utils/spreadsheet');
const { toQtyString, toMoneyString, isPositive } = require('../../utils/money');

// Preferred template headers for imported items (and general use)
const TEMPLATE_HEADERS = [
  'NO.',
  'Part Number',
  'Chinese Description',
  'English Description',
  'Qty (stock in Djibouti)',
  'Unit Price',
];

function mapOrigin(value) {
  const normalized = String(value || '').trim().toUpperCase();
  if (!normalized) return null;
  if (['IMPORTED', 'IMPORT', 'IMP'].includes(normalized)) return 'IMPORTED';
  if (['LOCAL', 'LOC'].includes(normalized)) return 'LOCAL';
  return null;
}

function rowToProduct(row) {
  // Part Number (internalCode) — support new and legacy column names
  const internalCode = getField(row, [
    'Part Number',
    'partNumber',
    'part_number',
    'internalCode',
    'internal_code',
    'sku',
  ]);

  // Chinese Description → name
  const name = getField(row, [
    'Chinese Description',
    'chineseDescription',
    'chinese_description',
    'name',
    'productName',
    'product_name',
  ]);

  // English Description → description
  const description =
    getField(row, [
      'English Description',
      'englishDescription',
      'english_description',
      'description',
    ]) || null;

  const category = getField(row, ['category']) || null;
  const unitOfMeasure =
    getField(row, ['unitOfMeasure', 'unit_of_measure', 'uom']) || 'PCS';

  // Origin — default to IMPORTED for import files when not specified
  let origin = mapOrigin(getField(row, ['origin', 'sourceType', 'source_type']));
  if (!origin) {
    // Files using the new imported-items columns are treated as IMPORTED
    origin = 'IMPORTED';
  }

  const batchCode =
    getField(row, ['batchCode', 'batch_code']) ||
    (internalCode ? `${internalCode}-IMP` : null);

  // Qty
  const receivedQty = getField(row, [
    'Qty (stock in Djibouti)',
    'Qty',
    'qty',
    'quantity',
    'receivedQty',
    'received_qty',
    'stock',
  ]);

  // Unit Price
  const unitCost = getField(row, [
    'Unit Price',
    'unitPrice',
    'unit_price',
    'unitCost',
    'unit_cost',
    'price',
  ]);

  const supplierRef = getField(row, ['supplierRef', 'supplier_ref']) || null;
  const receiptDate = getField(row, ['receiptDate', 'receipt_date']);

  // Optional row number column
  const no = getField(row, ['NO.', 'NO', 'no', 'No.']);

  return {
    rowNumber: row.__row ?? no,
    internalCode,
    name,
    description,
    category,
    unitOfMeasure,
    origin,
    batchCode,
    receivedQty,
    unitCost,
    supplierRef,
    receiptDate,
  };
}

function buildTemplateCsv() {
  const sample = [
    '1',
    'PN-10001',
    '热敏收据纸 (80mm)',
    'Thermal Receipt Paper (80mm)',
    '100',
    '3.20',
  ];
  return `${TEMPLATE_HEADERS.join(',')}\n${sample.join(',')}\n`;
}

class InventoryImportService {
  async importFromFile({ buffer, originalName }, userId) {
    if (!buffer || !buffer.length) {
      throw new AppError('An import file is required', 400);
    }

    const { rows } = await parseSpreadsheet(buffer, originalName);
    if (!rows.length) {
      throw new AppError('The import file does not contain any data rows', 400);
    }

    const summary = {
      created: 0,
      stockSourcesCreated: 0,
      duplicates: 0,
      skipped: 0,
      failed: 0,
      errors: [],
    };

    const seenCodes = new Set();

    for (const rawRow of rows) {
      const row = rowToProduct(rawRow);

      if (!row.internalCode && !row.name) {
        summary.skipped += 1;
        continue;
      }

      if (!row.internalCode || !row.name) {
        summary.failed += 1;
        summary.errors.push({
          row: row.rowNumber,
          internalCode: row.internalCode || null,
          message: 'Part Number and Chinese Description are required',
        });
        continue;
      }

      const duplicateKey = row.internalCode.toLowerCase();
      if (seenCodes.has(duplicateKey)) {
        summary.duplicates += 1;
        summary.errors.push({
          row: row.rowNumber,
          internalCode: row.internalCode,
          message: 'Duplicate Part Number in this file',
        });
        continue;
      }
      seenCodes.add(duplicateKey);

      try {
        await prisma.$transaction(async (tx) => {
          let product = await tx.product.findUnique({
            where: { internalCode: row.internalCode },
          });

          if (product) {
            summary.duplicates += 1;
            summary.errors.push({
              row: row.rowNumber,
              internalCode: row.internalCode,
              message: 'Product already exists; existing record was left unchanged',
            });
          } else {
            product = await tx.product.create({
              data: {
                internalCode: row.internalCode,
                name: row.name,
                description: row.description,
                category: row.category,
                unitOfMeasure: row.unitOfMeasure,
              },
            });
            summary.created += 1;
          }

          const hasStock = row.receivedQty !== '' && isPositive(row.receivedQty);
          if (!hasStock) {
            return;
          }

          if (!row.origin) {
            throw new AppError(
              'origin must be Imported or Local when quantity is provided',
              400
            );
          }
          if (!row.batchCode) {
            throw new AppError(
              'batchCode is required when quantity is provided',
              400
            );
          }

          const existingBatch = await tx.stockSource.findUnique({
            where: {
              productId_batchCode: {
                productId: product.id,
                batchCode: row.batchCode,
              },
            },
          });

          if (existingBatch) {
            summary.duplicates += 1;
            summary.errors.push({
              row: row.rowNumber,
              internalCode: row.internalCode,
              message: `Stock batch ${row.batchCode} already exists for this product`,
            });
            return;
          }

          const qty = toQtyString(row.receivedQty);
          const source = await tx.stockSource.create({
            data: {
              productId: product.id,
              sourceType: row.origin,
              batchCode: row.batchCode,
              supplierRef: row.supplierRef,
              receiptDate: row.receiptDate ? new Date(row.receiptDate) : new Date(),
              receivedQty: qty,
              currentBalance: qty,
              unitCost: row.unitCost ? toMoneyString(row.unitCost) : null,
            },
          });

          await tx.stockMovement.create({
            data: {
              productId: product.id,
              stockSourceId: source.id,
              movementType: 'RECEIPT',
              quantity: qty,
              referenceType: 'IMPORT',
              referenceId: source.id,
              reason: `Imported batch ${row.batchCode}`,
              performedById: userId,
            },
          });

          summary.stockSourcesCreated += 1;
        });
      } catch (error) {
        summary.failed += 1;
        summary.errors.push({
          row: row.rowNumber,
          internalCode: row.internalCode,
          message: error.message || 'Failed to import row',
        });
      }
    }

    return summary;
  }

  getTemplateCsv() {
    return buildTemplateCsv();
  }
}

module.exports = new InventoryImportService();