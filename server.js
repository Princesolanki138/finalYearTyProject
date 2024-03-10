import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js"

//configure environment variables
dotenv.config();

//establish connection with mongodb database 
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));


app.get("/", (req, res) => {
  res.send({
    message: "NS WATCHES",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});