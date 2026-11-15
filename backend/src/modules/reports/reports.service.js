// backend/src/modules/reports/reports.service.js

const prisma = require('../../prisma/client');
const { qtyAdd, toQtyNumber, toMoneyString, d } = require('../../utils/money');

class ReportsService {
  async getDashboard() {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        stockSources: {
          select: {
            sourceType: true,
            currentBalance: true,
            unitCost: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    let productsInStock = 0;
    let lowStockCount = 0;
    let stockValue = d(0);
    const lowStockItems = [];

    for (const product of products) {
      const totalQty = product.stockSources.reduce(
        (sum, s) => qtyAdd(sum, s.currentBalance),
        '0.0000'
      );
      const total = toQtyNumber(totalQty);

      if (total > 0) productsInStock += 1;
      if (total < 30) {
        lowStockCount += 1;
        const unitCost =
          product.stockSources.find((s) => s.unitCost != null)?.unitCost ?? 0;
        lowStockItems.push({
          id: product.id,
          name: product.name,
          sku: product.internalCode,
          units: total,
          unitCost: Number(unitCost),
        });
      }

      for (const s of product.stockSources) {
        const bal = d(s.currentBalance || 0);
        const cost = d(s.unitCost || 0);
        stockValue = stockValue.add(bal.mul(cost));
      }
    }

    lowStockItems.sort((a, b) => a.units - b.units);
    const lowStockPreview = lowStockItems.slice(0, 10);

    const weekTx = await prisma.saleTransaction.findMany({
      where: {
        status: 'COMPLETED',
        transactionDate: { gte: weekStart },
      },
      select: {
        id: true,
        gatePassNo: true,
        fsNo: true,
        gatePassTotal: true,
        transactionDate: true,
        createdAt: true,
        customer: { select: { name: true } },
        gatePassLines: { select: { quantity: true } },
      },
      orderBy: { transactionDate: 'desc' },
    });

    let weeklySales = d(0);
    const byDay = {};
    for (let i = 0; i < 7; i++) {
      const dte = new Date(weekStart);
      dte.setDate(weekStart.getDate() + i);
      const key = dte.toISOString().slice(0, 10);
      byDay[key] = d(0);
    }

    for (const tx of weekTx) {
      const total = d(tx.gatePassTotal || 0);
      weeklySales = weeklySales.add(total);
      const key = new Date(tx.transactionDate).toISOString().slice(0, 10);
      if (byDay[key] !== undefined) {
        byDay[key] = byDay[key].add(total);
      }
    }

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const salesByDay = Object.keys(byDay)
      .sort()
      .map((key) => {
        const date = new Date(key + 'T12:00:00');
        return {
          date: key,
          day: dayNames[date.getDay()],
          value: Number(byDay[key].toFixed(2)),
        };
      });

    const recent = await prisma.saleTransaction.findMany({
      where: { status: 'COMPLETED' },
      include: {
        customer: { select: { id: true, name: true } },
        gatePassLines: { select: { quantity: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const recentSales = recent.map((tx) => {
      const itemsSold = tx.gatePassLines.reduce(
        (sum, line) => sum + toQtyNumber(line.quantity),
        0
      );
      return {
        id: tx.id,
        gatePassNo: tx.gatePassNo,
        fsNo: tx.fsNo,
        customer: tx.customer?.name || '—',
        itemsSold,
        recordedAt: tx.createdAt,
        total: toMoneyString(tx.gatePassTotal),
      };
    });

    return {
      metrics: {
        weeklySales: toMoneyString(weeklySales),
        weeklyTransactionCount: weekTx.length,
        productsInStock,
        totalProducts: products.length,
        lowStockCount,
        stockValue: toMoneyString(stockValue),
      },
      salesByDay,
      lowStockItems: lowStockPreview,
      recentSales,
      period: {
        from: weekStart.toISOString(),
        to: now.toISOString(),
      },
    };
  }
}

module.exports = new ReportsService();