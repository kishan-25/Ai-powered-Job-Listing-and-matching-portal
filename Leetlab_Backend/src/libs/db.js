import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log("DB connected successfully");
  } catch (err) {
    console.error("DB not connected:", err);
    process.exit(1);
  }
};

export default connectDB;
