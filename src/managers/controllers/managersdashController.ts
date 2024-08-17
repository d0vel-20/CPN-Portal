
import { Request, Response } from 'express';
import { getUser } from '../../utils/getUser';
import Student from "../../models/studentModel";
import Paymentplan from '../../models/paymentplanModel';
import { Paginated } from '../../types/pagination.types';




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

        const center = user.user.center;

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
    const updates = req.body;

    try {
        const user = await getUser(req);
        if (!user || user.isAdmin) {
          return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }

        const student = await Student.findOne({ _id: id, center: user.user.center });
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
        if (!user) {
            return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }

        const { page = 1, limit = 10, q, center, course } = req.query;

        const query: any = {};

        // General search (name, email, etc.)
        if (q) {
            query.$or = [
                { name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } }  // assuming email is a field
                // Add other fields here if necessary
            ];
        }

        // Center filter (only for admin users)
        if (center && user.isAdmin) {
            query.center = center;
        } else if (!user.isAdmin) {
            // If not admin, filter by user's center
            query.center = user.user.center;
        }else{
            return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }

        // Course filter
        if (course) {
            query['plan.course_id'] = course;
        }

        const totalDocuments = await Student.countDocuments(query);
        const totalPages = Math.ceil(totalDocuments / Number(limit));

        const students = await Student.find(query)
            .populate({
                path: 'plan',
                model: Paymentplan,
                select: 'course_id',  // Selecting the course_ID field from Paymentplan
                match: course ? { course_id: course } : {}
            })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const paginatedResponse: Paginated = {
            saved: [],
            existingRecords: students,
            hasPreviousPage: Number(page) > 1,
            previousPages: Number(page) - 1,
            hasNextPage: Number(page) < totalPages,
            nextPages: Number(page) + 1,
            totalPages: totalPages,
            totalDocuments: totalDocuments,
            currentPage: Number(page)
        };

        return res.status(200).json({
            status: 200,
            data: paginatedResponse
        });
    } catch (error) {
        console.error('Error Fetching Students:', error);
        return res.status(500).json({ data: 'Internal Server Error', status: 500 });
    }
};



// Get Student by ID
export const getStudentById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const user = await getUser(req);
        if (!user || user.isAdmin) {
          return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }

        const student = await Student.findById({_id: id, center: user.user.center });
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
    const { id } = req.params;

    try {
        const user = await getUser(req);
        if (!user || user.isAdmin) {
          return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }

        const student = await Student.findOneAndDelete({ _id: id, center: user.user.center });
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