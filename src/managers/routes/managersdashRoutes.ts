import { Router } from 'express';
import { createStudent, getAllStudents, getStudentById, editStudent, deleteStudent } from '../../managers/controllers/managersdashController';

const router = Router();

// Define routes for students
router.post('/students', createStudent);
router.get('/students', getAllStudents);
router.get('/students/:id', getStudentById);
router.put('/students/:id', editStudent);
router.delete('/students/:id', deleteStudent);

export default router;
