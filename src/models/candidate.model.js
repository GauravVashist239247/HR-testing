import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interviewer",
      required: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
    },

    position: {
      type: String,
      required: true, // e.g. Backend Developer, HR Executive
    },

    interviewDate: {
      type: Date,
      required: true,
    },

    interviewField: {
      type: String,
      required: true, // e.g. Frontend, Backend, HR
    },

    interviewRound: {
      type: String,
      enum: ["HR", "Technical", "Managerial"],
      required: true,
    },

    status: {
      type: String,
      enum: ["scheduled", "completed", "selected", "rejected"],
      default: "scheduled",
    },

    feedback: {
      type: String,
    },

    score: {
      type: Number, // optional rating
      min: 0,
      max: 10,
    },
  },
  { timestamps: true },
);

export const Candidate = mongoose.model("Candidate", candidateSchema);
