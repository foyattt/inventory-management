// backend/src/modules/customers/customers.controller.js

const customersService = require('./customers.service');

class CustomersController {
  async createCustomer(req, res, next) {
    try {
      const customer = await customersService.createCustomer(req.body);
      res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCustomers(req, res, next) {
    try {
      const result = await customersService.getCustomers(req.query);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerById(req, res, next) {
    try {
      const customer = await customersService.getCustomerById(req.params.id);
      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCustomer(req, res, next) {
    try {
      const customer = await customersService.updateCustomer(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Customer updated successfully',
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CustomersController();