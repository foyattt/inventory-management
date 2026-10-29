// backend/src/modules/auth/auth.controller.js

const authService = require('./auth.service');
const { AppError } = require('../../middleware/error.middleware');

class AuthController {
  async register(req, res, next) {
    try {
      const { email, password, fullName, role } = req.body;

      if (!email || !password || !fullName) {
        throw new AppError('Email, password and fullName are required', 400);
      }

      if (password.length < 6) {
        throw new AppError('Password must be at least 6 characters', 400);
      }

      const user = await authService.register({
        email,
        password,
        fullName,
        role,
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError('Email and password are required', 400);
      }

      const result = await authService.login({ email, password });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();