// backend/src/modules/inventory/import.service.js

const prisma = require('../../prisma/client');
const { AppError } = require('../../middleware/error.middleware');
const { parseSpreadsheet, getField } = require('../../utils/spreadsheet');
const { toQtyString, toMoneyString, isPositive } = require('../../utils/money');

const TEMPLATE_HEADERS = [
  'internalCode',
  'name',
  'description',
  'category',
  'unitOfMeasure',
  'origin',
  'batchCode',
  'receivedQty',
  'unitCost',
  'supplierRef',
  'receiptDate',
];

function mapOrigin(value) {
  const normalized = String(value || '').trim().toUpperCase();
  if (!normalized) return null;
  if (['IMPORTED', 'IMPORT', 'IMP'].includes(normalized)) return 'IMPORTED';
  if (['LOCAL', 'LOC'].includes(normalized)) return 'LOCAL';
  return null;
}

function rowToProduct(row) {
  const internalCode = getField(row, ['internalCode', 'internal_code', 'partNumber', 'part_number', 'sku']);
  const name = getField(row, ['name', 'productName', 'product_name']);
  const description = getField(row, ['description']) || null;
  const category = getField(row, ['category']) || null;
  const unitOfMeasure = getField(row, ['unitOfMeasure', 'unit_of_measure', 'uom']) || 'PCS';
  const origin = mapOrigin(getField(row, ['origin', 'sourceType', 'source_type']));
  const batchCode = getField(row, ['batchCode', 'batch_code']);
  const receivedQty = getField(row, ['receivedQty', 'received_qty', 'stock', 'quantity']);
  const unitCost = getField(row, ['unitCost', 'unit_cost', 'unitPrice', 'unit_price', 'price']);
  const supplierRef = getField(row, ['supplierRef', 'supplier_ref']) || null;
  const receiptDate = getField(row, ['receiptDate', 'receipt_date']);

  return {
    rowNumber: row.__row,
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
    'LOC-20418',
    'Thermal Receipt Paper (80mm)',
    '80mm POS paper roll',
    'Packaging',
    'PCS',
    'Local',
    'LOC-20418-B1',
    '100',
    '3.20',
    'Local mill',
    '2026-01-15',
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
          message: 'internalCode and name are required',
        });
        continue;
      }

      const duplicateKey = row.internalCode.toLowerCase();
      if (seenCodes.has(duplicateKey)) {
        summary.duplicates += 1;
        summary.errors.push({
          row: row.rowNumber,
          internalCode: row.internalCode,
          message: 'Duplicate internalCode in this file',
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
            throw new AppError('origin must be Imported or Local when receivedQty is provided', 400);
          }
          if (!row.batchCode) {
            throw new AppError('batchCode is required when receivedQty is provided', 400);
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
