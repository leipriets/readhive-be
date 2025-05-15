import { Router } from 'express';
import { createUser, signIn, getCurrentUser, userLogout } from '../controllers/user.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/user', auth, getCurrentUser);
router.post('/users/login', signIn);
router.post('/users', createUser);

router.post('/user/logout', auth, userLogout)


export default router;