
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
    const { id } = req.params;
    const { fullname, email, phone, centerId, courses, reg_date } = req.body;

    try {
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (fullname) student.fullname = fullname;
        if (email) student.email = email;
        if (phone) student.phone = phone;
        if (centerId) student.centerId = centerId;
        if (courses) student.courses = courses;
        if (reg_date) student.reg_date = reg_date;

        await student.save();

        return res.status(200).json({
            status: 200,
            data: {
                student,
                message: 'Student Updated Successfully',
            }
        });
    } catch (error) {
        console.error('Error Updating Student:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get All Students
export const getAllStudents = async (req: Request, res: Response) => {
    try {
        const students = await Student.find().populate('centerId').populate('courses');

        return res.status(200).json({
            status: 200,
            data: {
                students,
                message: 'Students Retrieved Successfully',
            }
        });
    } catch (error) {
        console.error('Error Retrieving Students:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

// get Individual student
export const getStudentById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const student = await Student.findById(id).populate('centerId').populate('courses');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        return res.status(200).json({
            status: 200,
            data: {
                student,
                message: 'Student Retrieved Successfully',
            }
        });
    } catch (error) {
        console.error('Error Retrieving Student:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

// delete students
export const deleteStudent = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const student = await Student.findByIdAndDelete(id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        return res.status(200).json({
            status: 200,
            data: {
                message: 'Student Deleted Successfully',
            }
        });
    } catch (error) {
        console.error('Error Deleting Student:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
