import "dotenv/config";
import { mockData } from "./MOCK_DATA.js";
import Product from "./models/Product.js";
import { connectDB } from "./db/connect.js";

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    await Product.deleteMany();
    await Product.create(mockData);
    console.log("data successfully uploaded");
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
