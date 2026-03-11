import mongoose from "mongoose";

const communitySchema = new mongoose.Schema(
  {
    
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    location: {
      type: String,
      required: true,
      index: true,
      trim : true,  
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