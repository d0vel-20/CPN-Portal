import express from 'express';
import getAdminProfile  from '../controllers/profileControllers';
import verifyToken  from '../middlewares/authMiddleware';

const router = express.Router();

// Login Route
router.get('/admin', verifyToken,getAdminProfile);



export default router;