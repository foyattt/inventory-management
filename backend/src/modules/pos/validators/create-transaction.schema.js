// backend/src/modules/pos/validators/create-transaction.schema.js

const Joi = require('joi');

const lineItemSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().positive().required(),
  unitPrice: Joi.number().min(0).required(),
  stockSourceId: Joi.string().optional().allow(null),
});

const depositAllocationSchema = Joi.object({
  accountName: Joi.string()
    .valid('Zesino', 'Aleme', 'alem', 'Yirzemu')
    .required(),
  bankName: Joi.string()
    .valid(
      'Awash',
      'Abyssinia',
      'CBE',
      'Oromia_Cooperative_Bank',
      'Dashen',
      'Hibret',
      'Zemen'
    )
    .required(),
  amount: Joi.number().positive().required(),
});

const createTransactionSchema = Joi.object({
  gatePassNo: Joi.string().trim().required(),
  fsNo: Joi.string().trim().required(),
  customerId: Joi.string().required(),
  paymentMethod: Joi.string().valid('CASH', 'CREDIT').required(),
  gatePassItems: Joi.array().items(lineItemSchema).min(1).required(),
  invoiceItems: Joi.array().items(lineItemSchema).default([]),
  depositAllocations: Joi.array().items(depositAllocationSchema).when('paymentMethod', {
    is: 'CASH',
    then: Joi.array().min(1).required(),
    otherwise: Joi.optional(),
  }),
  notes: Joi.string().allow('', null),
});

module.exports = {
  createTransactionSchema,
};