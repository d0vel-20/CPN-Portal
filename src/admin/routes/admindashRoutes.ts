import express from 'express';
import { createCenter, editCenter, deleteCenter, getAllCenters, getCenterById, createManager, getAllManagers, deleteManager, getManagerById } from '../controllers/admindashController';
import verifyToken  from '../../middlewares/authMiddleware';
const router = express.Router();


// Admin Create Center Routes
router.post('/create-center', verifyToken, createCenter);
router.put('/centers/:id', verifyToken, editCenter);
router.delete('/centers/:id', verifyToken, deleteCenter);
router.get('/centers',verifyToken, getAllCenters);
router.get('/centers/:id', verifyToken, getCenterById);


// Admin create Manager

router.post('/create-managers', verifyToken, createManager);
router.get('/managers', verifyToken, getAllManagers);
router.delete('/managers/:id', verifyToken, deleteManager);
router.get('/managers/:id', getManagerById);

// Get staff


// Get students




export default router;
