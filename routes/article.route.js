import { Router } from "express";
import {
  getArticles,
  createArticle,
  getArticleBySlug,
  updateArticle,
  deleteArticle,
  addToFavorites,
  removeToFavorites
} from "../controllers/article.controller.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.get("/articles", getArticles);
router.get("/articles/:slug", auth, getArticleBySlug);
router.put("/articles/:slug", auth, updateArticle);
router.delete("/articles/:slug", auth, deleteArticle);
router.post("/articles", auth, createArticle);

router.post('/articles/:slug/favorite', auth, addToFavorites);
router.delete('/articles/:slug/favorite', auth, removeToFavorites);

export default router;
