import express from "express";
import {
  healthCheck,
  createPaste,
  getPaste,
  viewPasteHTML
} from "../controllers/pasteController.js";

const router = express.Router();

// API routes
router.get("/healthz", healthCheck);
router.post("/pastes", createPaste);
router.get("/pastes/:id", getPaste);

// HTML view route
router.get("/p/:id", viewPasteHTML);

export default router;
