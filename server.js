import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js"
import authRoute from "./routes/authRoute.js";

//configure environment variables
dotenv.config();

//establish connection with mongodb database 
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1/auth", authRoute);

app.get("/", (req, res) => {
  res.send({
    message: "NS WATCHES",
  });
});

app.get("/test1", (req, res) => {
  res.send({
    message: "test 1 successfully",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
