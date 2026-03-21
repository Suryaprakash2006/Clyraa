import express, { urlencoded } from 'express';
import http from "http";
import { Server } from "socket.io";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import cookie from "cookie";
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

// middleware
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

app.use(cors(corsOptions));

// routes
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


//SOCKET JWT AUTH MIDDLEWARE
io.use((socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader) {
      return next(new Error("No cookies found"));
    }

    const cookies = cookie.parse(cookieHeader);
    const token = cookies.token;

    if (!token) {
      return next(new Error("No token provided"));
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    socket.user = decoded;

    next();
  } catch (error) {
    console.log("Socket auth error:", error.message);
    next(new Error("Authentication error"));
  }
});


const lastMessageTime = new Map();

io.on("connection", (socket) => {

  const userId = socket.user.userId;

  console.log("User connected:", socket.id, "userId:", userId);

  socket.on("join_group", async (groupId) => {
    try {
      if (!groupId) {
        return socket.emit("error", "Invalid group ID");
      }

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
      socket.emit("error", "Failed to join group");
    }
  });

  socket.on("send_message", async ({ groupId, message }) => {
    try {
      if (!groupId || !message || message.trim() === "") {
        return socket.emit("error", "Invalid message data");
      }

      if (message.length > 500) {
        return socket.emit("error", "Message too long");
      }

      const now = Date.now();
      const lastTime = lastMessageTime.get(socket.id) || 0;

      if (now - lastTime < 500) {
        return;
      }

      lastMessageTime.set(socket.id, now);

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

      const populatedMessage = await newMessage.populate(
        "senderId",
        "name profilePic"
      );

      io.to(groupId).emit("receive_message", populatedMessage);

    } catch (error) {
      console.log("Send message error:", error);
      socket.emit("error", "Failed to send message");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    lastMessageTime.delete(socket.id);
  });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});