import mongoose from "mongoose";

let isConnected = false; // check if db is connected

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);

  if (!process.env.MONGODB_URL) {
    throw new Error("=> missing env.MONGODB_URL");
  }

  if (isConnected) {
    return console.log("=> using existing database connection");
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URL);
    isConnected = true;
    console.log("=> using new database connection");
  } catch (err: any) {
    console.log("=> error connecting to database: ", err);
    throw new Error(err);
  }
};
