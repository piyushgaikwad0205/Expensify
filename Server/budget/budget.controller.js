import * as budgetService from './budget.service.js';

export const getBudget = async (req, res, next) => {
  try {
    const budget = await budgetService.getBudgetByUser(req.user?.id);
    res.json({ success: true, data: budget });
  } catch (err) {
    next(err);
  }
};

export const setBudget = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (amount === undefined || typeof amount !== 'number' || amount < 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }
    const budget = await budgetService.updateBudgetByUser(amount, req.user?.id);
    res.json({ success: true, data: budget });
  } catch (err) {
    next(err);
  }
};
