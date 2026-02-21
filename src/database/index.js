import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URL);

    console.log(
      `Connected to MongoDB || DB HOST : ${connectionInstance.connection.host}`,
    );
  } catch (error) {
    console.log("DEBUG: MONGODB connection error", error);
    process.exit(1);
  }
};
