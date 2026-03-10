import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    budget: {
      type: Number,
      default: 0,
    },

    source: String,
    destination: String,

    mode: {
      type: String,
      enum: ["bike", "car", "solo", "train", "flight"],
    },

    days: Number,

    tripStarted: {
      type: Boolean,
      default: false,
    },

    stops: [
      {
        name: String,
        reason: String,
        reached: {
          type: Boolean,
          default: false,
        },
      },
    ],

    expenses: [
      {
        amount: Number,
        reason: String,
        paidBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Trip", tripSchema);