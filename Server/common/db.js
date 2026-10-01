import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopping_budget_tracker';
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 2500,
  });
  console.log('MongoDB connected');
};

export default connectDB;
