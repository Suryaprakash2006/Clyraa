import express, { urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './utils/db.js';
dotenv.config({});

import authenticationRouter from './routes/authenticationRouter.js';
import postRoutes from './routes/postRouter.js';
import commentRoutes from './routes/commentRouter.js';
import communityRoutes from "./routes/communityRoutes.js";
import groupRoutes from "./routes/groupRouter.js";
import tripRoutes from "./routes/tripRouter.js";

const app = express();

//middleware
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
const corsOptions = {
  origin: 'http://localhost:5173',
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

const PORT = process.env.PORT || 8000;

app.listen(PORT , () => {
  connectDB();
  console.log(`Server is running on the http://localhost:${PORT}`);
})