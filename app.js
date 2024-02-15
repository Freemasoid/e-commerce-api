import "dotenv/config";
import "express-async-errors";
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import ExpressMongoSanitize from "express-mongo-sanitize";
import { connectDB } from "./db/connect.js";
import { notFoundMid } from "./middleware/not-found.js";
import errorHandlerMid from "./middleware/error-handler.js";
import { authRouter } from "./routes/authRoutes.js";
import { userRouter } from "./routes/userRoutes.js";
import { prodRouter } from "./routes/productRoutes.js";
import fileUpload from "express-fileupload";
import { reviewRouter } from "./routes/reviewRoutes.js";
import { orderRouter } from "./routes/orderRoutes.js";
import session from "express-session";

let corsOptions = {
  origin: ["https://metal-zone-mern.netlify.app", "http://localhost:5173"],
  optionSuccessStatus: 200,
  credentials: true,
  exposedHeaders: ["set-cookie"],
    allowedHeaders: [
    "Content-Type",
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Origin",
    "Authorization",
  ],
  prefilghtContinue: true,
};

let sessionConfig = {
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie : {
    sameSite: 'none',
    secure: true,
     maxAge: 60 * 60 * 24 * 1000,
  }
};

const app = express();

app.set("trust proxy", 1);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);

app.use(session(sessionConfig));
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.static("public"));
app.use("uploads", express.static("uploads"));
app.use(fileUpload());
app.use(helmet());
app.use(ExpressMongoSanitize());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", prodRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);

app.use(notFoundMid);
app.use(errorHandlerMid);

const port = process.env.PORT || 5174;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => console.log(`Server is listening on port ${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();
