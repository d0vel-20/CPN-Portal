import express from 'express';
import { createCenter, editCenter, deleteCenter, getAllCenters, getCenterById } from '../controllers/admindashController';
import verifyToken  from '../../middlewares/authMiddleware';
const router = express.Router();


// Login Route
router.post('/create-center', verifyToken, createCenter);
router.put('/centers/:id', editCenter);
router.delete('/centers/:id', deleteCenter);
router.get('/centers', getAllCenters);
router.get('/centers/:id', getCenterById);



export default router;
