import mongoose, { mongo } from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`Connected to mongo db database ${conn.connection.host}`);
  } catch (error) {
    console.log("error in mongoDB");
  }
};
export default connectDB;
