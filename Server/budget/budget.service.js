import { Budget } from './budget.model.js';

export const getBudgetByUser = async (userId) => {
  const filter = userId ? { userId } : {};
  let budget = await Budget.findOne(filter);
  if (!budget) {
    budget = await Budget.create({ userId: userId || null, amount: 0 });
  }
  return budget;
};

export const updateBudgetByUser = async (amount, userId) => {
  const filter = userId ? { userId } : {};
  return Budget.findOneAndUpdate(
    filter,
    { amount },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};
