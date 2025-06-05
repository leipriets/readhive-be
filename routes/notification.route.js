import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {
  getUserNotifications,
  getUserNotificationsCount,
  clearSeenNotification
} from "../controllers/notification.controller.js";

const router = Router();

router.get("/user-notifications", auth, getUserNotifications);
router.get("/user-notifications-count", auth, getUserNotificationsCount);
router.post("/clear-user-notifications", auth, clearSeenNotification);

export default router;
