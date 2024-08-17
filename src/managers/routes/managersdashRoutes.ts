import { Router } from 'express';
import { createStudent, getAllStudents, getStudentById, editStudent, deleteStudent, createStaff, getAllStaff, getStaffById, editStaff, deleteStaff } from '../../managers/controllers/managersdashController';
import verifyToken  from '../../middlewares/authMiddleware';

const router = Router();

// Mnager Create Student Routes
router.post('/students', verifyToken,createStudent);
router.get('/students', verifyToken,getAllStudents);
router.get('/students/:id', verifyToken,getStudentById);
router.patch('/students/:id', verifyToken,editStudent);
router.delete('/students/:id', verifyToken,deleteStudent);

// Manager create Staff Routes
router.post('/staff', verifyToken,createStaff);
router.get('/staff', verifyToken,getAllStaff);
router.get('/staff/:id', verifyToken,getStaffById);
router.patch('/staff/:id', verifyToken,editStaff);
router.delete('/staff/:id', verifyToken,deleteStaff);

export default router;
