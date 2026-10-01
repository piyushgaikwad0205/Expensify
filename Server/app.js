import express from 'express';
import cors from 'cors';
import cartRoutes from './cartList/cartList.routes.js';
import budgetRoutes from './budget/budget.routes.js';
import dashboardRoutes from './dashboard/dashboard.routes.js';
import authRoutes from './auth/auth.routes.js';
import { optionalAuth } from './auth/auth.middleware.js';
import { chaosMiddleware } from './common/chaos.middleware.js';
import { notFound, errorHandler } from './common/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(chaosMiddleware);
app.use(optionalAuth);

app.use('/api/auth', authRoutes);
app.use('/api/items', cartRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Shopping List & Budget Tracker API'
  });
});

app.use(notFound);
app.use(errorHandler);

export default app;
