import * as authService from './auth.service.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const data = await authService.registerUser({ name, email, password });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const data = await authService.loginUser({ email, password });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
