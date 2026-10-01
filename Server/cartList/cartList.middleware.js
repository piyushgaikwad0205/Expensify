import { validate } from '../common/validate.middleware.js';
import { createItemDto, updateItemDto } from './cartList.dto.js';

export const validateCreateItem = validate(createItemDto);
export const validateUpdateItem = validate(updateItemDto);
