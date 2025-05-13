import { Router } from 'express';
import { createUser, signIn, getCurrentUser } from '../controllers/user.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/user', auth, getCurrentUser);
router.post('/users/login', signIn);
router.post('/users', createUser);


export default router;