import mongoose from 'mongoose';

const cartListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  isLocked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export const CartItem = mongoose.model('CartItem', cartListSchema);
