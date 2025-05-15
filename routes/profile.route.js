import { Router } from 'express';
import { followUser, unfollowUser, getProfile } from '../controllers/profile.controller.js';
import { auth } from "../middleware/auth.js";


const router = Router();

router.get('/profiles/:username', auth, getProfile);
router.post('/profiles/:username/follow', auth, followUser);
router.delete('/profiles/:username/follow', auth, unfollowUser);


export default router;  