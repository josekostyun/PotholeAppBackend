import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import potholeRoutes from "./routes/potholeRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

//Mount routes
app.use("/api/potholes", potholeRoutes);
app.use("/api/users", userRoutes);

//Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error("MongoDB connection error:", err));
