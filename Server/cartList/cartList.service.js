import { CartItem } from './cartList.model.js';

export const getAllItems = async (userId) => {
  const filter = userId ? { userId } : {};
  return CartItem.find(filter).sort({ createdAt: -1 });
};

export const createItem = async (data) => {
  return CartItem.create(data);
};

export const updateItem = async (id, data, userId) => {
  const filter = userId ? { _id: id, userId } : { _id: id };
  return CartItem.findOneAndUpdate(filter, data, { new: true, runValidators: true });
};

export const deleteItem = async (id, userId) => {
  const filter = userId ? { _id: id, userId } : { _id: id };
  return CartItem.findOneAndDelete(filter);
};
