import express from "express";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import cors from 'cors';

import sequelize from "./config/database.js";
import User from './models/user.model.js';
import Article from "./models/article.model.js";
import ArticeTag from "./models/articleTag.model.js";
import Tag from "./models/tag.model.js";
import Favorite from "./models/favorite.model.js";
import Follower from "./models/follower.model.js";
import Comment from "./models/comment.model.js";

// routes
import userRoutes from "./routes/user.route.js";
import articleRoutes from "./routes/article.route.js";
import profileRoutes from "./routes/profile.route.js";
import tagRoutes from "./routes/tags.route.js";

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const API_PREFIX = "/api";
app.use(API_PREFIX, userRoutes);
app.use(API_PREFIX, articleRoutes);
app.use(API_PREFIX, profileRoutes);
app.use(API_PREFIX, tagRoutes);

app.listen(port, () => {
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

// Sync DB
// try {
//   await sequelize.sync({ force: true });
//   console.log("Database synced");
// } catch (err) {
//   console.error("Error syncing DB:", err);
// }
