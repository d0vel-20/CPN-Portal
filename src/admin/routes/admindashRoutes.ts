import express from 'express';
import { createCenter, editCenter, deleteCenter, getAllCenters, getCenterById, createManager, getAllManagers, deleteManager, getManagerById } from '../controllers/admindashController';
// import verifyToken  from '../../middlewares/authMiddleware';
const router = express.Router();


// Admin Create Center Routes
router.post('/create-center',  createCenter);
router.put('/centers/:id',  editCenter);
router.delete('/centers/:id',  deleteCenter);
router.get('/centers', getAllCenters);
router.get('/centers/:id',  getCenterById);


// Admin create Manager

router.post('/create-managers',  createManager);
router.get('/managers',  getAllManagers);
router.delete('/managers/:id',  deleteManager);
router.get('/managers/:id', getManagerById);

// Get staff


// Get students




export default router;
