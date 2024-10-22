import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("DB connected successfully with backend");
  } catch (err) {
    console.error("Error connecting to DB: " + err.message);
  }
};

export default connectDB;
