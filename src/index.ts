import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

import socketMid, { SocketAuth } from "./middleware/socket.js";
import { sendMsg } from "./controllers/msgController.js";
import { joinConversation } from "./controllers/csController.js";
import authRoutes from "./routes/authRoutes.js";
import msgRoutes from "./routes/msgRoutes.js";
import csRoutes from "./routes/csRoutes.js";
import devRouters from "./routes/devRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("App is still running...🚀");
});

io.use(socketMid);
io.on("connection", (socket: SocketAuth) => {
  console.log(`User connected: ${socket.id}, User ID: ${socket.data.userId}`);
  socket.join(socket.data.userId as string);

  socket.on("joinRoom", async (conversationId) => {
    await joinConversation(socket, conversationId);
  });

  socket.on("sendMsg", async (payload) => {
    await sendMsg(socket, payload, io);
  });

  socket.on("disconnect", () => {
    console.log(`User leave: ${socket.id}, User ID: ${socket.data.userId}`);
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/msg", msgRoutes);
app.use("/api/conversation", csRoutes);
app.use("/dev/api/", devRouters);

const port = 3456;
if (process.env.NODE_ENV !== "test") {
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export { app, server, io };
