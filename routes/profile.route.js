import { Router } from 'express';
import { followUser, unfollowUser } from '../controllers/profile.controller.js';
import { auth } from "../middleware/auth.js";


const router = Router();

router.post('/profiles/:username/follow', auth, followUser);
router.delete('/profiles/:username/unfollow', auth, unfollowUser);


export default router;