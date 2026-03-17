import express, { urlencoded } from 'express';
import http from "http";
import { Server } from "socket.io";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import jwt from "jsonwebtoken"; // 🔥 NEW
import connectDB from './utils/db.js';
dotenv.config({});

import authenticationRouter from './routes/authenticationRouter.js';
import postRoutes from './routes/postRouter.js';
import commentRoutes from './routes/commentRouter.js';
import communityRoutes from "./routes/communityRoutes.js";
import groupRoutes from "./routes/groupRouter.js";
import tripRoutes from "./routes/tripRouter.js";
import messageRoutes from "./routes/messageRouter.js";

import Message from "./models/Message.js";
import Group from "./models/Group.js";

const app = express();

//middleware
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};
app.use(cors(corsOptions));

//routes
app.use("/api/auth", authenticationRouter);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/messages", messageRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});


// SOCKET JWT AUTH MIDDLEWARE
io.use((socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader) {
      return next(new Error("No cookies found"));
    }

    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map(c => c.split("="))
    );

    const token = cookies.token;

    if (!token) {
      return next(new Error("No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.user = decoded; // attach user

    next();
  } catch (error) {
    console.log("Socket auth error:", error.message);
    next(new Error("Authentication error"));
  }
});


io.on("connection", (socket) => {

  const userId = socket.user.userId; //use verified user

  console.log("User connected:", socket.id, "userId:", userId);

  socket.on("join_group", async (groupId) => {
    try {
      const group = await Group.findById(groupId);

      if (!group) {
        return socket.emit("error", "Group not found");
      }

      const isMember = group.members.some(
        (member) => member.toString() === userId
      );

      if (!isMember) {
        return socket.emit("error", "Not authorized to join this group");
      }

      socket.join(groupId);
      console.log(`User ${userId} joined group ${groupId}`);

    } catch (error) {
      console.log("Join group error:", error);
    }
  });

  socket.on("send_message", async ({ groupId, message }) => {
    try {
      const group = await Group.findById(groupId);

      if (!group) {
        return socket.emit("error", "Group not found");
      }

      const isMember = group.members.some(
        (member) => member.toString() === userId
      );

      if (!isMember) {
        return socket.emit("error", "Not allowed to send message");
      }

      const newMessage = await Message.create({
        groupId,
        senderId: userId,
        text: message,
      });

      io.to(groupId).emit("receive_message", newMessage);

    } catch (error) {
      console.log("Send message error:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});