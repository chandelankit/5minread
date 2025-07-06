// /models/poll.js
import { Schema, model, models } from "mongoose";

const PollSchema = new Schema({
  question: {
    type: String,
    required: [true, "Poll question is required"],
    maxLength: [500, "Poll question must be less than 500 characters"]
  },
  options: [{
    text: {
      type: String,
      required: true,
      maxLength: [100, "Option text must be less than 100 characters"]
    },
    votes: {
      type: Number,
      default: 0
    }
  }],
  sourceNews: {
    type: String,
    required: [true, "Source news is required"]
  },
  newsId: {
    type: Schema.Types.ObjectId,
    ref: "News",
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"]
  },
  voters: [{
    type: Schema.Types.ObjectId,
    ref: "User"
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  }
});

// Index for better query performance
PollSchema.index({ createdAt: -1 });
PollSchema.index({ newsId: 1 });
PollSchema.index({ userId: 1 });

const Poll = models.Poll || model("Poll", PollSchema);

export default Poll;