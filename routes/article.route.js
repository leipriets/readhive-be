import { Router } from "express";
import {
  getArticles,
  createArticle,
  getArticleBySlug,
  updateArticle,
  deleteArticle,
  addToFavorites,
  removeToFavorites,
  getFeed,
} from "../controllers/article.controller.js";
import {
  likeComment,
  disLikeComment,
  postComment,
  updateComment,
  getComments,
  deleteComment,
} from "../controllers/comments.controller.js";
import { auth } from "../middleware/auth.js";
import extractFile from "../middleware/file.js";
import extractFiles from "../middleware/files.js";

const router = Router();

router.get("/articles", getArticles);
router.get("/articles/feed", auth, getFeed);
router.get("/articles/:slug", auth, getArticleBySlug);
router.put(
  "/articles/:slug",
  auth,
  extractFiles.array("images"),
  updateArticle
);
router.delete("/articles/:slug", auth, deleteArticle);
router.post("/articles", auth, extractFiles.array("images"), createArticle);

router.post("/articles/:slug/favorite", auth, addToFavorites);
router.delete("/articles/:slug/favorite", auth, removeToFavorites);

router.get("/articles/:slug/comments", auth, getComments);
router.post("/articles/:slug/comment", auth, postComment);
router.patch("/articles/:slug/comment", auth, updateComment);
router.delete("/articles/:slug/comment/:commentId", auth, deleteComment);

router.post("/articles/:slug/like-comment", auth, likeComment);
router.post("/articles/:slug/dislike-comment", auth, disLikeComment);

export default router;
