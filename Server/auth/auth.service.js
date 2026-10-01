import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from './auth.model.js';

export const registerUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 400;
    throw err;
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });
  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'dev_secret_key_123', {
    expiresIn: '7d'
  });
  return { user: { id: user._id, name: user.name, email: user.email }, token };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }
  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'dev_secret_key_123', {
    expiresIn: '7d'
  });
  return { user: { id: user._id, name: user.name, email: user.email }, token };
};
