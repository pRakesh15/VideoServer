import { Server } from "socket.io";
import express from "express";
import { createServer } from "node:http";
import cors from "cors";
import { config } from "dotenv";

config();
const port = process.env.port;
const app = express();

const server = createServer(app);

const io = new Server(server, {
  cors: true,
});
const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

io.on("connection", (socket) => {
  socket.on("room:join", (data) => {
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);
    io.to(room).emit("user:joined", { email, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});


server.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});
