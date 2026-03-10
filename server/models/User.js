import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    phone: {
      type: String,
    },

    password: {
      type: String,
      required: true,
    },

    profile: {
      bio: {
        type: String,
        default: "",
      },
      profilePic: {
        type: String,
        default: "",
      },
      travelledPlaces: [
        {
          type: String,
        },
      ],
    },

    communitiesJoined: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community",
      },
    ],

    savedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);