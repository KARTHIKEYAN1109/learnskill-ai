import mongoose from 'mongoose';

const connectDB = async (retries = 5, delayMs = 5000) => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is required');
  }

  mongoose.set('strictQuery', true);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected');
      return;
    } catch (error) {
      console.error(`Database connection attempt ${attempt} failed.`);
      if (attempt === retries) {
        console.error('All database connection attempts failed. Terminating...');
        throw error;
      }
      console.log(`Retrying in ${delayMs / 1000} seconds...`);
      await new Promise((resolve) => global.setTimeout(resolve, delayMs));
    }
  }
};

export default connectDB;
