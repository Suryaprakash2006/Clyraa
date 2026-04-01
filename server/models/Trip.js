import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
{
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true,
    index: true
  },

  budget: {
    type: Number,
    default: 0,
    min: 0
  },

  source: {
    type: String,
    trim: true
  },

  destination: {
    type: String,
    trim: true
  },

  mode: {
    type: String,
    enum: ["bike", "car", "solo", "train", "flight"]
  },

  days: Number,

  tripStarted: {
    type: Boolean,
    default: false
  },

  stops: [
    {
      name: String,
      reason: String,
      reached: {
        type: Boolean,
        default: false
      }
    }
  ],

  expenses: [
    {
      amount: Number,
      reason: String,
      paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],

  tripCompleted: {
    type: Boolean,
    default: false
  },

  packingList: [
    {
      item: String,
      isPacked: {
        type: Boolean,
        default: false
      },
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    }
  ],

  notes: [
    {
      title: String,
      content: String,
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
},
{ timestamps: true }
);

export default mongoose.model("Trip", tripSchema);