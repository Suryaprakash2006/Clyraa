<div align="center">
  <!-- Placeholder for a main project banner/screenshot -->
  <!-- <img src="./docs/banner.png" alt="Clyraa Banner" width="100%" /> -->
  <h1>🌟 Clyraa</h1>
  <p><em>A modern, social-driven travel and community platform.</em></p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" alt="Version" />
    <img src="https://img.shields.io/badge/build-passing-brightgreen.svg" alt="Build Status" />
    <img src="https://img.shields.io/badge/license-ISC-green.svg" alt="License" />
    <img src="https://img.shields.io/badge/React-19.2.4-61dafb.svg?logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-Express-339933.svg?logo=node.js" alt="Node.js" />
    <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248.svg?logo=mongodb" alt="MongoDB" />
  </p>
</div>

---

## 📖 Project Context

**Clyraa** is a comprehensive full-stack application designed to unify the social travel experience. It bridges the gap between trip organization and social networking by allowing users to explore travel communities, connect with others, plan trips collaboratively, and share their experiences in real-time. Whether you are managing group chats or maintaining collaborative packing lists, Clyraa provides an intuitive, reliable, and highly interactive user experience.

---

## ✨ Key Features

- **Robust Authentication:** Secure user registration, login, and session management leveraging JWT and bcrypt.
- **Dynamic Social Feed:** A unified, customizable post feed complete with interactions (likes, comments) and responsive UI cards.
- **Community & Group Management:** Dedicated spaces to create or discover new travel groups and communities.
- **Real-Time Group Chat:** Instant messaging powered by Socket.IO, enabling seamless communication for trip members.
- **Interactive Trip Dashboard:** Built-in tools for collaborative planning, including shared packing lists, notes, and an "End Trip" summary engine.
- **Modern UI/UX:** Mobile-first, fully responsive design structured with Tailwind CSS v4, focusing on immersive visuals and smooth micro-animations.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework:** React 19 (bootstrapped with Vite)
- **Styling:** Tailwind CSS (v4)
- **State Management:** Zustand
- **Routing:** React Router v7
- **Network & Real-time:** Axios, Socket.IO Client
- **Icons & UI Utilities:** Lucide React, React Hot Toast

### Backend (Server)
- **Runtime & Framework:** Node.js, Express.js
- **Database:** MongoDB & Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT), bcryptjs
- **Real-time Engine:** Socket.IO
- **Middleware:** CORS, Cookie Parser

---

## 🏗️ Architecture

The project is structured into two main directories ensuring a clean separation of concerns between the client and server.

```text
Clyraa/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/            # Axios interceptors and API service functions
│   │   ├── assets/         # Static assets (images, icons)
│   │   ├── components/     # Reusable UI components (e.g., PostCard, Navbar)
│   │   ├── pages/          # Full page views (Feed, Profile, TripDashboard)
│   │   └── store/          # Zustand global state stores
│   └── package.json        # Frontend dependencies
│
└── server/                 # Express backend
    ├── controllers/        # Request handling logic
    ├── middleware/         # Custom middlewares (e.g., auth check)
    ├── models/             # Mongoose database schemas
    ├── routes/             # API endpoint definitions
    ├── utils/              # Helper functions (hashing, JWT generation)
    └── index.js            # Server entry point
```

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)

### 1. Clone the Repository
```bash
git clone https://github.com/Suryaprakash2006/Clyraa.git
cd Clyraa
```

### 2. Environment Variables

#### Backend Configuration
Create a `.env` file in the `server` directory:
```bash
cd server
touch .env
```
Populate the server `.env` file with your credentials:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

#### Frontend Configuration
If required, create a `.env` file in the `client` directory:
```bash
cd ../client
touch .env
```
Add any necessary client-side variables (e.g., the backend API URL):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Installation

Install all the dependencies for both the frontend and backend.

**Server:**
```bash
cd ../server
npm install
```

**Client:**
```bash
cd ../client
npm install
```

### 4. Running the Application

You can start both servers simultaneously.

**Start the Backend (Development Mode):**
```bash
cd server
npm start
# The server will run on http://localhost:8000
```

**Start the Frontend:**
```bash
cd client
npm run dev
# The client will run on http://localhost:5173
```

---

## 💻 Usage & API Examples

### Using the Axios Client (Frontend)
The frontend utilizes a configured Axios instance to securely attach JWT tokens from cookies to every request.

```javascript
import axiosInstance from '../api/axiosInstance';

// Fetching social posts for the user's feed
export const fetchPosts = async () => {
  try {
    const response = await axiosInstance.get('/posts/feed');
    return response.data;
  } catch (error) {
    console.error('Error fetching feed:', error);
  }
};
```

### Example Backend Endpoint (Authentication)
An example of how user registration might be handled in the backend routes (`server/routes/auth.js`):

```javascript
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists." });

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({ username, email, password: hashedPassword });
    
    // Generate Token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Send via strictly secure HttpOnly cookie
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.status(201).json({ user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
```

### Real-Time Socket Initialization
```javascript
// On the Server (index.js)
import { Server } from 'socket.io';

const io = new Server(server, { cors: { origin: process.env.CLIENT_URL } });
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('join_group_chat', (groupId) => {
    socket.join(groupId);
  });
  
  socket.on('send_message', (data) => {
    io.to(data.groupId).emit('receive_message', data);
  });
});
```

---
