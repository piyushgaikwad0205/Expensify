import { CartItem } from './cartList.model.js';

// In-Memory Fallback Cache for Circuit Breaker
let cachedItems = [];

export const getAllItems = async (userId) => {
  const filter = userId ? { userId } : {};
  try {
    const items = await CartItem.find(filter).sort({ createdAt: -1 });
    cachedItems = items;
    return items;
  } catch (err) {
    console.warn('⚠️ MongoDB unreachable! Circuit Breaker fallback to memory cache:', err.message);
    if (cachedItems.length > 0) {
      return cachedItems;
    }
    throw err;
  }
};

export const createItem = async (data) => {
  try {
    const item = await CartItem.create(data);
    cachedItems = [item, ...cachedItems];
    return item;
  } catch (err) {
    console.error('⚠️ DB write failed during outage:', err.message);
    const customErr = new Error('Database unavailable. Operation failed.');
    customErr.status = 503;
    throw customErr;
  }
};

export const updateItem = async (id, data, userId) => {
  const filter = userId ? { _id: id, userId } : { _id: id };
  return CartItem.findOneAndUpdate(filter, data, { new: true, runValidators: true });
};

export const deleteItem = async (id, userId) => {
  const filter = userId ? { _id: id, userId } : { _id: id };
  const deleted = await CartItem.findOneAndDelete(filter);
  if (deleted) {
    cachedItems = cachedItems.filter((i) => String(i._id) !== String(id));
  }
  return deleted;
};
