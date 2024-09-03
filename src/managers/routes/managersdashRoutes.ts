import { Router } from "express";
import {
  createStudent,
  getAllStudents,
  getStudentById,
  editStudent,
  deleteStudent,
  createStaff,
  getAllStaff,
  getStaffById,
  editStaff,
  deleteStaff,
  addCourse,
  createInvoice,
  addPayment,
  getAllInvoices,
  getInvoiceById,
  deleteInvoice,
  getAllPayments,
  getPaymentById,
  getPaymentsByStudentId,
  getPlanBalance
} from "../../managers/controllers/managersdashController";
import verifyToken from "../../middlewares/authMiddleware";

const router = Router();

// Mnager Create Student Routes
router.post("/students", verifyToken, createStudent);
router.get("/students", verifyToken, getAllStudents);
router.get("/students/:id", verifyToken, getStudentById);
router.patch("/students/:id", verifyToken, editStudent);
router.delete("/students/:id", verifyToken, deleteStudent);

// Manager create Staff Routes
router.post("/staff", verifyToken, createStaff);
router.get("/staff", verifyToken, getAllStaff);
router.get("/staff/:id", verifyToken, getStaffById);
router.patch("/staff/:id", verifyToken, editStaff);
router.delete("/staff/:id", verifyToken, deleteStaff);

// Manager add course to students
router.post("/students/:id/plan", verifyToken, addCourse);

// manger create invoice
router.post("/plan/invoice", verifyToken, createInvoice);
router.get("/plan/invoice", verifyToken, getAllInvoices);
router.get("/plan/invoice/:id", verifyToken, getInvoiceById);
router.delete("/plan/invoice/:id", verifyToken, deleteInvoice);

// manager add payment

router.post("/students/:id/payment", verifyToken, addPayment);
router.get("/student/payments", verifyToken, getAllPayments);
router.get("/student/payment/:id", verifyToken, getPaymentById);
router.get('/payments/student/:id', getPaymentsByStudentId);
router.get('/payments/balance/:id', getPlanBalance);

export default router;
