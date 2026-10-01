import * as cartService from './cartList.service.js';

export const getItems = async (req, res, next) => {
  try {
    const items = await cartService.getAllItems(req.user?.id);
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

export const addItem = async (req, res, next) => {
  try {
    const { name, price, quantity, isLocked } = req.body;
    const item = await cartService.createItem({
      name,
      price,
      quantity: quantity || 1,
      isLocked: isLocked || false,
      userId: req.user?.id || null
    });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

export const editItem = async (req, res, next) => {
  try {
    const item = await cartService.updateItem(req.params.id, req.body, req.user?.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

export const removeItem = async (req, res, next) => {
  try {
    const item = await cartService.deleteItem(req.params.id, req.user?.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    next(err);
  }
};
