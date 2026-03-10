import mongoose from "mongoose";

const communitySchema = new mongoose.Schema(
  {
    
    name: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
      index: true,  
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Community", communitySchema);