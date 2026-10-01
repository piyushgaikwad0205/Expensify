export const calculateTotals = (items = [], budgetAmount = 0) => {
  const totalSpent = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const remaining = budgetAmount - totalSpent;
  const isExceeded = totalSpent > budgetAmount;
  const exceededBy = isExceeded ? totalSpent - budgetAmount : 0;
  const percentageUsed = budgetAmount > 0 ? Math.min(Math.round((totalSpent / budgetAmount) * 100), 100) : 0;

  return {
    budget: budgetAmount,
    totalSpent,
    remaining,
    isExceeded,
    exceededBy,
    percentageUsed,
    itemCount: items.length
  };
};
