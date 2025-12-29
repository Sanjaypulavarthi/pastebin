import express from "express";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import pasteRoutes from "./routes/paste.js";
import cors from "cors";


dotenv.config();

const app = express();
connectDB();

app.use(cors({
  origin: "https://pastebin-snowy-rho.vercel.app",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());
app.use("/api", pasteRoutes); // API routes
app.use("/", pasteRoutes);    // HTML routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
