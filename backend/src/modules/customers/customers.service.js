// backend/src/modules/customers/customers.service.js

const prisma = require('../../prisma/client');
const { AppError } = require('../../middleware/error.middleware');

class CustomersService {
  async createCustomer(data) {
    const { customerType, name, tinNo, phone, email, address, creditLimit, creditPeriodDays } = data;

    if (!name) {
      throw new AppError('Customer name is required', 400);
    }

    if (!customerType || !['INDIVIDUAL', 'COMPANY'].includes(customerType)) {
      throw new AppError('customerType must be INDIVIDUAL or COMPANY', 400);
    }

    // Optional: warn on possible duplicate
    if (tinNo) {
      const existingTin = await prisma.customer.findFirst({ where: { tinNo } });
      if (existingTin) {
        throw new AppError('A customer with this TIN already exists', 409);
      }
    }

    const customer = await prisma.customer.create({
      data: {
        customerType,
        name,
        tinNo,
        phone,
        email,
        address,
        creditLimit: creditLimit || 0,
        creditPeriodDays: creditPeriodDays || 30,
      },
    });

    return customer;
  }

  async getCustomers({ search, page = 1, limit = 20 }) {
    const skip = (page - 1) * limit;
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { tinNo: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: Number(limit),
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCustomerById(id) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        creditLedgers: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
          take: 10,
        },
      },
    });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    // Calculate outstanding credit
    const outstanding = await prisma.creditLedger.aggregate({
      where: { customerId: id },
      _sum: {
        debitAmount: true,
        creditAmount: true,
      },
    });

    const totalDebit = Number(outstanding._sum.debitAmount || 0);
    const totalCredit = Number(outstanding._sum.creditAmount || 0);
    const outstandingBalance = totalDebit - totalCredit;

    return {
      ...customer,
      outstandingBalance,
      availableCredit: Number(customer.creditLimit) - outstandingBalance,
    };
  }

  async updateCustomer(id, data) {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        tinNo: data.tinNo,
        phone: data.phone,
        email: data.email,
        address: data.address,
        creditLimit: data.creditLimit,
        creditPeriodDays: data.creditPeriodDays,
        isActive: data.isActive,
      },
    });

    return updated;
  }
}

module.exports = new CustomersService();