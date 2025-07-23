import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
export const connecttoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("mongoDB connected...");
  } catch (error) {
    console.error("MONGO connection error:", error.message);
    process.exit(1);
}};
