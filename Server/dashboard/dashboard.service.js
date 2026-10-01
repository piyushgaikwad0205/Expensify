import { getAllItems } from '../cartList/cartList.service.js';
import { getBudgetByUser } from '../budget/budget.service.js';
import { calculateTotals } from '../common/calculations.js';

export const getDashboardData = async (userId) => {
  const [items, budgetDoc] = await Promise.all([
    getAllItems(userId),
    getBudgetByUser(userId)
  ]);

  const summary = calculateTotals(items, budgetDoc.amount);

  return {
    ...summary,
    items
  };
};
