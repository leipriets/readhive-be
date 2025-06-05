import { Server } from "socket.io";
import {
  registerUser,
  unregisterUserBySocketId,
  getUsers,
  getSocketId,
} from './users.js';

let io;

function init(server) {
  io = new Server(server, {
    cors: {
      origin: '*',  // set your frontend origin here for security
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('register', (userId) => {
      console.log(`User registered: ${userId} with socket ${socket.id}`);
      registerUser(userId, socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
      unregisterUserBySocketId(socket.id);
    });
  });

  return io;
}

// Emit notification to a user by userId
function notifyUser(userId, data) {
  const socketId = getSocketId(userId);
  if (socketId && io) {
    io.to(socketId).emit('notification', data);
  }
}

function notifyUserComment(userId, data) {
  const socketId = getSocketId(userId);
  if (socketId && io) {
    io.to(socketId).emit('notificationComment', data);
  }
}

export { init, notifyUser, notifyUserComment, getUsers }