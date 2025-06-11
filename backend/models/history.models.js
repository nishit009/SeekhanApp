import mongoose from "mongoose";

const HistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  historyRes: [
    {
      question: { type: String, required: true },
      answer: { type: String, required: true },
    },
  ],
});

export default mongoose.model("History", HistorySchema);
