import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/database.js";

// routes
import authRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";

const app = express();
dotenv.config();

app.use(cors());

// Middleware untuk parsing request body
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/blog", blogRoutes);

// Sync Sequelize models with database (create tables if not exists)
sequelize.sync().then(() => {
  console.log("Database synced");
});

// Jalankan server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
