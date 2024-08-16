
import { Request, Response } from 'express';
import { getUser } from '../../utils/getUser';
import Student from "../../models/studentModel";
import mongoose, { Schema, Document } from 'mongoose';




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
    const updates = req.body;

    try {
        const user = await getUser(req);
        if (!user || user.isAdmin) {
          return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }

        const student = await Student.findOne({ _id: id, center: user.user.centerId });
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

        // Pagination
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        // Filters and Search
        const filters: any = { center: user.user.centerId };

        // Name filter
        if (req.query.name) {
            filters.name = { $regex: req.query.name, $options: 'i' }; // Case-insensitive name search
        }

        // Center filter (if you allow managers to search for other centers)
        if (req.query.center) {
            filters.center = new mongoose.Types.ObjectId(req.query.center as string);
        }

        // Course filter
        if (req.query.course) {
            filters.courses = new mongoose.Types.ObjectId(req.query.course as string); // Assuming 'courses' is an array of ObjectIds
        }

        // Sorting
        const sortField = req.query.sortField as string || 'name'; // Default sort by name
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1; // Default ascending order

        // Fetch Students with pagination, filters, and sorting
        const students = await Student.find(filters)
            .sort({ [sortField]: sortOrder })
            .skip(skip)
            .limit(limit);

        // Count total documents for pagination
        const totalStudents = await Student.countDocuments(filters);

        return res.status(200).json({
            status: 200,
            data: {
                students,
                total: totalStudents,
                page,
                pages: Math.ceil(totalStudents / limit)
            }
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

        const student = await Student.findById({_id: id, center: user.user.centerId });
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

        const student = await Student.findOneAndDelete({ _id: id, center: user.user.centerId });
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