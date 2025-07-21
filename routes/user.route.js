import { Router } from "express";
import {
  createUser,
  signIn,
  getCurrentUser,
  userLogout,
  updateUserProfile,
  actionUpload,
  validateUsername,
  checkIsEmailExist,
} from "../controllers/user.controller.js";
import { auth } from "../middleware/auth.js";
import extractFile from "../middleware/file.js";

const router = Router();

router.get("/user", auth, getCurrentUser);
router.get("/user/validate-username", validateUsername);
router.get("/user/validate-email", checkIsEmailExist);
router.post("/user-update", auth, extractFile, updateUserProfile);
router.post("/user-update-action", actionUpload);

router.post("/users/login", signIn);
router.post("/users", createUser);

router.post("/user/logout", auth, userLogout);

export default router;
