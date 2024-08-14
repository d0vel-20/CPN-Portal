import express from 'express';
import {getAdminProfile, getManagerProfile } from '../controllers/profileControllers';
import verifyToken  from '../middlewares/authMiddleware';

const router = express.Router();

// Login Route
router.get('/admin', getAdminProfile);
router.get('/manager', getManagerProfile);



export default router;