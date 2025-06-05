const users = new Map(); // userId -> socketId

function registerUser(userId, socketId) {
  users.set(userId, socketId);
}

function unregisterUserBySocketId(socketId) {
  for (const [userId, sId] of users.entries()) {
    if (sId === socketId) {
      users.delete(userId);
      break;
    }
  }
}

function getUsers() {
  return Array.from(users.entries()).map(([userId, socketId]) => ({
    userId,
    socketId,
  }));
}

function getSocketId(userId) {
  return users.get(userId);
}

export { registerUser, unregisterUserBySocketId, getUsers, getSocketId };
