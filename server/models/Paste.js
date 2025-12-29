import mongoose from "mongoose";

const pasteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: null
  },
  maxViews: {
    type: Number,
    default: null
  },
  remainingViews: {
    type: Number,
    default: null
  }
});

const Paste = mongoose.model("Paste", pasteSchema);
export default Paste;
