
import { Request, Response } from 'express';
import { getUser } from '../../utils/getUser';
import Student from "../../models/studentModel";




// create student
export const createStudent = async (req: Request, res: Response) => {
    const { fullname, email, phone, reg_date, birth_date, student_id } = req.body;

    // Validate input
    if (!fullname || !email || !phone || !reg_date || !birth_date || !student_id) {
        return res.status(400).json({ data: 'All fields are required', status: 400 });
    }

    try {
        const user = await getUser(req);
        if (!user || user.isAdmin) {
          return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }

        const center = user.user.centerId;

        const newStudent = new Student({
            fullname,
            email,
            phone,
            center,
            reg_date,
            birth_date,
            student_id,
        });

        await newStudent.save();

        return res.status(201).json({
            status: 201,
            data: {
                newStudent,
                message: 'Student Created Successfully',
            }
        });
    } catch (error) {
        console.error('Error Creating Student:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Edit Student
export const editStudent = async (req: Request, res: Response) => {
    const { studentId } = req.params;
    const updates = req.body;

    try {
        const user = await getUser(req);
        if (!user || user.isAdmin) {
          return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }

        const student = await Student.findOne({ _id: studentId, center: user.user.centerId });
        if (!student) {
            return res.status(404).json({ data: 'Student Not Found', status: 404 });
        }

        Object.assign(student, updates);
        await student.save();

        return res.status(200).json({
            status: 200,
            data: {
                student,
                message: 'Student Updated Successfully',
            }
        });
    } catch (error) {
        console.error('Error Editing Student:', error);
        return res.status(500).json({ data: 'Internal Server Error', status: 500 });
    }
};

// Get All Students
export const getAllStudents = async (req: Request, res: Response) => {
    try {
        const user = await getUser(req);
        if (!user || user.isAdmin) {
          return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }

        const students = await Student.find({ center: user.user.centerId });
        return res.status(200).json({
            status: 200,
            data: students
        });
    } catch (error) {
        console.error('Error Fetching Students:', error);
        return res.status(500).json({ data: 'Internal Server Error', status: 500 });
    }
};

// Get Student by ID
export const getStudentById = async (req: Request, res: Response) => {
    const { Id } = req.params;

    try {
        const user = await getUser(req);
        if (!user || user.isAdmin) {
          return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }

        const student = await Student.findOne({_id: Id, center: user.user.centerId });
        if (!student) {
            return res.status(404).json({ data: 'Student Not Found', status: 404 });
        }

        return res.status(200).json({
            status: 200,
            data: student
        });
    } catch (error) {
        console.error('Error Fetching Student:', error);
        return res.status(500).json({ data: 'Internal Server Error', status: 500 });
    }
};

// Delete Student
export const deleteStudent = async (req: Request, res: Response) => {
    const { studentId } = req.params;

    try {
        const user = await getUser(req);
        if (!user || user.isAdmin) {
          return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }

        const student = await Student.findOneAndDelete({ _id: studentId, center: user.user.centerId });
        if (!student) {
            return res.status(404).json({ data: 'Student Not Found', status: 404 });
        }

        return res.status(200).json({
            status: 200,
            data: { message: 'Student Deleted Successfully' }
        });
    } catch (error) {
        console.error('Error Deleting Student:', error);
        return res.status(500).json({ data: 'Internal Server Error', status: 500 });
    }
};