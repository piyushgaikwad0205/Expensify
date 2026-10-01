import { Router } from 'express';
import { getItems, addItem, editItem, removeItem } from './cartList.controller.js';
import { validate } from '../common/validate.middleware.js';
import { createItemDto, updateItemDto } from './cartList.dto.js';

const router = Router();

router.get('/', getItems);
router.post('/', validate(createItemDto), addItem);
router.patch('/:id', validate(updateItemDto), editItem);
router.delete('/:id', removeItem);

export default router;
