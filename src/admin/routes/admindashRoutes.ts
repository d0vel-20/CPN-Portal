import express from 'express';
import { createCenter, editCenter, deleteCenter, getAllCenters, getCenterById, createManager } from '../controllers/admindashController';
import verifyToken  from '../../middlewares/authMiddleware';
const router = express.Router();


// Admin Create Center Routes
router.post('/create-center', verifyToken, createCenter);
router.put('/centers/:id', editCenter);
router.delete('/centers/:id', deleteCenter);
router.get('/centers', getAllCenters);
router.get('/centers/:id', getCenterById);


// create Manager

router.post('/create-managers', createManager);



export default router;
