import express from "express";
import "dotenv/config";
import path from "path";
import cors from 'cors';
import http from 'http';
import { fileURLToPath } from "url";
import * as socket from "./socket/index.js";

import sequelize from "./config/database.js";

// routes
import userRoutes from "./routes/user.route.js";
import articleRoutes from "./routes/article.route.js";
import profileRoutes from "./routes/profile.route.js";
import tagRoutes from "./routes/tags.route.js";
import notificationRoutes from "./routes/notification.route.js";
// seeds
import { seedUsers } from "./seeds/user.seed.js";
import { seedArticles } from "./seeds/article.seed.js";


// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const API_PREFIX = "/api";


const server = http.createServer(app);
const io = socket.init(server);

app.get('/', (req, res) => {
  res.send('Hello from ReadHive!');
});


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/src/images", express.static(path.join("src/images")));


app.use(API_PREFIX, userRoutes);
app.use(API_PREFIX, articleRoutes);
app.use(API_PREFIX, profileRoutes);
app.use(API_PREFIX, tagRoutes);
app.use(API_PREFIX, notificationRoutes);

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
  sequelize
    .authenticate()
    .then(() => {
      console.log("Connection has been established successfully.");
    })
    .catch((error) => {
      console.error("Unable to connect to the database: ", error);
    });
});
io.listen(3001);

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});

// Sync DB
// try {
//   await sequelize.sync({ force: true });
//   console.log("Database synced");

//   const users = await seedUsers();
//   await seedArticles(users);
//   console.log("✅Seeding completed successfully!");
  
  
// } catch (err) {
//   console.error("Error syncing DB:", err);
// }
