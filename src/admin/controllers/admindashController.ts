import Center from "../../models/centerModel";
import Course from "../../models/courseModel";
import { Request, Response } from 'express';
import { getUser } from '../../utils/getUser';
import Manager from "../../models/managersModel";
import bcrypt from 'bcryptjs';
import mongoose from "mongoose";
import Student from "../../models/studentModel";
import dotenv from 'dotenv';
import Staff from '../../models/staffModel';
import Paymentplan from '../../models/paymentplanModel';
import { Paginated } from '../../types/pagination.types';


dotenv.config();

// create center
export const createCenter = async (req: Request, res: Response) =>{
    const {name, location, code,} = req.body;

    // Validate input
    if (!name || !location || !code ) {
    return res.status(400).json({ 
        data: 'All fields are required',
        status: 400,
    });
}

    try {
        const user = await getUser(req);
        if (!user || !user.isAdmin) {
          return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }
        // create a new center
        const newCenter = new Center({
            name, location, code,
        });

        // save to database
        await newCenter.save();

        return res.status(201).json({
            status: 201,
            data: newCenter
        });
    } catch (error) {
        console.error('Error Creating Center:', error);
        return res.status(500).json({ status: 500, data: 'Internal Server error'})
    }

}

// get all centers
export const getAllCenters = async (req: Request, res: Response) => {
    try {
        const user = await getUser(req);
        if (!user || !user.isAdmin) {
          return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }
        // Retrieve all centers from the database
        const centers = await Center.find();


        return res.status(200).json({
            status: 200,
            data: {
                centers,
                message: 'Centers Retrieved Successfully',
            }
        });
    } catch (error) {
        console.error('Error Retrieving Centers:', error);
        return res.status(500).json({ 
            data: 'Internal Server Error',
            status: 500
         });
    }
};


// get individual center
export const getCenterById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const user = await getUser(req);
        if (!user || !user.isAdmin) {
          return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }
        // Find the center by ID
        const center = await Center.findById(id);

        // find the manager
        const manager = (await Manager.findOne({ center: id }).exec()) ?? {};

        // count all number of students
        const studentCount = await Student.countDocuments({ center: id }).exec();


        if (!center) {
            return res.status(404).json({ 
                data: 'Center not found',
                status: 404,
             });
        }

        return res.status(200).json({
            status: 200,
            data: {
                center,
                manager,
                studentCount,
                message: 'Center Retrieved Successfully',
            }
        });
    } catch (error) {
        console.error('Error Retrieving Center:', error);
        return res.status(500).json({ 
            data: 'Internal Server Error',
            status: 500
         });
    }
};

// editcenter

export const editCenter = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, location, code } = req.body;

    // Validate input
    if (!name && !location && !code) {
        return res.status(400).json({ 
            data: 'Atleast one field is required to updte',
            status: 400,
         });
    }

    try {
        const user = await getUser(req);
        if (!user || !user.isAdmin) {
          return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }
        // Find the center by ID and update
        const updatedCenter = await Center.findByIdAndUpdate(
            id,
            { name, location, code },
            { new: true, runValidators: true }
        );

        if (!updatedCenter) {
            return res.status(404).json({ 
                status: 404,
                data: 'Center not found'
            });
        }

        return res.status(200).json({
            status: 200,
            data: {
                updatedCenter,
                message: 'Center Updated Successfully',
            }
        });
    } catch (error) {
        console.error('Error Updating Center:', error);
        return res.status(500).json({
            status: 500,
            data: 'Internal Server Error'
        });
    }
};

// delete center
export const deleteCenter = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const user = await getUser(req);
        if (!user || !user.isAdmin) {
          return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }
        // Find the center by ID and delete
        const deletedCenter = await Center.findByIdAndDelete(id);

        if (!deletedCenter) {
            return res.status(404).json({ status: 404, data: 'Center not found' });
        }

        return res.status(200).json({
            status: 200,
            data: {
                deletedCenter,
                message: 'Center Deleted Successfully',
            }
        });
    } catch (error) {
        console.error('Error Deleting Center:', error);
        return res.status(500).json({ 
            data: 'Internal Server Error',
            status: 500
        });
    }
};





// =============================================================

// create manager endpoints
export const createManager = async (req: Request, res:Response)=>{
    
    const {fullname, email, phone, centerId} = req.body;

    // Validate input
    if (!fullname || !email || !phone || !centerId) {
        return res.status(400).json({ status: 400, data: 'All fields are required' });
    }

    try {
        const user = await getUser(req);
        if (!user || !user.isAdmin) {
          return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }

        // check if the center exists
        const center = await Center.findById(centerId);
        if(!center){
            return res.status(404).json({
                status: 404,
                data: 'Center not found'
            })
        }

        // hash the default password
        const defaultPassword = process.env.DEFAULT_PASSWORD;
        if (!defaultPassword) {
            throw new Error('Default password is not set');
        }
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // create a new manager
        const newManager = new Manager({
            fullname,
            email,
            password: hashedPassword,
            phone,
            center: centerId
        });

        // Save the manager to the database
        await newManager.save();

        return res.status(201).json({
            status: 201,
            data: {
                newManager,
                message: 'Manager Created Successfully',
            }
        });
    } catch (error) {
        console.error('Error Creating Manager:', error);
        return res.status(500).json({ data: 'Internal Server Error', status: 500, });
    }
}

// get all managers
export const getAllManagers = async (req: Request, res: Response) => {
    try {
        const user = await getUser(req);
        if (!user || !user.isAdmin) {
          return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }
        // Fetch all managers from the database
        const managers = await Manager.find().populate('center');

        return res.status(200).json({
            status: 200,
            data: {
                managers,
                message: 'Managers Retrieved Successfully',
            }
        });
    } catch (error) {
        console.error('Error Retrieving Managers:', error);
        return res.status(500).json({ 
            data: 'Internal Server Error',
            status: 500
         });
    }
};


// delete managers
export const deleteManager = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const user = await getUser(req);
        if (!user || !user.isAdmin) {
          return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }
        // Find and delete the manager by ID
        const manager = await Manager.findByIdAndDelete(id);
        if (!manager) {
            return res.status(404).json({ data: 'Manager not found', status: 404 });
        }

        return res.status(200).json({
            status: 200,
            data: {
                message: 'Manager Deleted Successfully',
            }
        });
    } catch (error) {
        console.error('Error Deleting Manager:', error);
        return res.status(500).json({ 
            data: 'Internal Server Error',
            status: 500
         });
    }
};

// get individual mangers
export const getManagerById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const user = await getUser(req);
        if (!user || !user.isAdmin) {
          return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }
        // Find the manager by ID
        const manager = await Manager.findById(id).populate('center'); // Populate center reference if needed

        if (!manager) {
            return res.status(404).json({ data: 'Manager not found', status: 404, });
        }

        return res.status(200).json({
            status: 200,
            data: {
                manager,
                message: 'Manager Retrieved Successfully',
            }
        });
    } catch (error) {
        console.error('Error Retrieving Manager:', error);
        return res.status(500).json({ 
            data: 'Internal Server Error',
            status: 500
         });
    }
};

export const editManager = async (req: Request, res: Response) =>{
    const { id }  = req.params;
    const {fullname, email, phone, center} = req.body;


    // Validate input
    if (!fullname && !email && !phone && !center) {
        return res.status(400).json({
            status: 400,
            data: 'Atleast one fields are required'
        });
    }

    try {
        const user = await getUser(req);
        if (!user || !user.isAdmin) {
          return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }

        // find the center by id
        const editedManager = await Manager.findByIdAndUpdate(
            id,
            {fullname, email, phone, center},
            { new: true, runValidators: true }
        );

        if(!editedManager){
            return res.status(404).json({
                status:404,
                data: 'Manager not found'
            });
        }

        return res.status(200).json({
            status:200,
            data:{
                editedManager,
                message: 'Center Updated Successfully'
            }
        });
    } catch (error) {
        console.error('Error Editing Manager:', error);
        return res.status(500).json({
            status: 500,
            data: 'Internal Server Error'
        })
    }
}

// ==========================================Courses===============================

// create courses
export const createCourse = async (req: Request, res: Response) => {
    const { title, duration, amount } = req.body;

    // Validate input
    if (!title || duration === undefined || amount === undefined) {
        return res.status(400).json({ data: 'All fields are required', status: 400 });
    }

    try {
        const user = await getUser(req);
        if (!user || !user.isAdmin) {
          return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }
       

        const newCourse = new Course({
            title,
            duration,
            amount,
        });

        await newCourse.save();

        return res.status(201).json({
            status: 201,
            data: {
                newCourse,
                message: 'Course Created Successfully',
            }
        });
    } catch (error) {
        console.error('Error Creating Course:', error);
        return res.status(500).json({ data: 'Internal Server Error', status: 500,  });
    }
};

// edit course
export const editCourse = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, duration, amount } = req.body;

    try {
        const user = await getUser(req);
        if (!user || !user.isAdmin) {
          return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            id,
            { title, duration, amount },
            { new: true, runValidators: true }
        );

        if (!updatedCourse) {
            return res.status(404).json({ data: 'Course not found', status: 404 });
        }

        return res.status(200).json({
            status: 200,
            data: {
                updatedCourse,
                message: 'Course Updated Successfully',
            }
        });
    } catch (error) {
        console.error('Error Updating Course:', error);
        return res.status(500).json({ data: 'Internal Server Error', status: 500, });
    }
};


// get all courses
export const getAllCourses = async (req: Request, res: Response) => {
    try {

        const user = await getUser(req);
        if (!user) {
          return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }

        // Get page and limit from query parameters
        const page = parseInt(req.query.page as string, 10) || 1; // Default to page 1 if not provided
        const limit = parseInt(req.query.limit as string, 10) || 10; // Default to 10 items per page if not provided

        // Validate page and limit
        if (page < 1 || limit < 1) {
            return res.status(400).json({ data: 'Invalid page or limit', status: 400 });
        }

        // Calculate the number of items to skip
        const skip = (page - 1) * limit;

        // Get the total number of courses
        const totalCourses = await Course.countDocuments();

        // Fetch the courses with pagination
        const courses = await Course.find()
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            status: 200,
            data: {
                courses,
                totalCourses,
                currentPage: page,
                totalPages: Math.ceil(totalCourses / limit),
                message: 'Courses Retrieved Successfully',
            }
        });
    } catch (error) {
        console.error('Error Retrieving Courses:', error);
        return res.status(500).json({ data: 'Internal Server Error', status: 500 });
    }
};

// get individual course
export const getCourseById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {

        const user = await getUser(req);
        if (!user || !user.isAdmin) {
          return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }

        const course = await Course.findById(id);

        if (!course) {
            return res.status(404).json({ data: 'Course not found', status: 404, });
        }

        return res.status(200).json({
            status: 200,
            data: {
                course,
                message: 'Course Retrieved Successfully',
            }
        });
    } catch (error) {
        console.error('Error Retrieving Course:', error);
        return res.status(500).json({ data: 'Internal Server Error', status: 500, });
    }
};

// delete courses
export const deleteCourse = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const user = await getUser(req);
        if (!user || !user.isAdmin) {
          return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }

        const deletedCourse = await Course.findByIdAndDelete(id);

        if (!deletedCourse) {
            return res.status(404).json({ data: 'Course not found', status: 404, });
        }

        return res.status(200).json({
            status: 200,
            data: {
                deletedCourse,
                message: 'Course Deleted Successfully',
            }
        });
    } catch (error) {
        console.error('Error Deleting Course:', error);
        return res.status(500).json({ data: 'Internal Server Error', status: 500, });
    }
};


// get individual staff
export const adminGetOneStaff = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const user = await getUser(req);
        if (!user || !user.isAdmin) {
          return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }

        const staff = await Staff.findOne({ _id: id})
        .populate('courses')
        .populate('center');
        if (!staff) {
            return res.status(404).json({ data: 'Staff Not Found', status: 404 });
        }

        return res.status(200).json({
            status: 200,
            data: staff
        });
    } catch (error) {
        console.error('Error Fetching Staff:', error);
        return res.status(500).json({ data: 'Internal Server Error', status: 500 });
    }
};
// get all staff
export const adminGetAllStaff = async (req: Request, res: Response) => {
    try {
        const user = await getUser(req);
        if (!user || !user.isAdmin) {
            return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }

        const { page = 1, limit = 20, q, center } = req.query; // Destructure query parameters with default values

        const query: any = {}; // Initialize the query object

        // Add search functionality by name, email, etc.
        if (q) {
            query.$or = [
                { name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } }
                // Add other fields here if necessary for more search options
            ];
        }

        // Add center filter if provided
        if (center) {
            query.center = center;
        }

        const totalDocuments = await Staff.countDocuments(query); // Get the total number of documents matching the query
        const totalPages = Math.ceil(totalDocuments / Number(limit)); // Calculate total pages based on limit

        const staff = await Staff.find(query)
            .populate('courses')
            .populate('center')
            .limit(Number(limit)) // Limit results per page
            .skip((Number(page) - 1) * Number(limit)) // Skip results for pagination
            .exec(); // Execute the query

        const paginatedResponse: Paginated = {
            saved: [],
            existingRecords: staff, // Return staff data
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
        console.error('Error Fetching Staff:', error);
        return res.status(500).json({ data: 'Internal Server Error', status: 500 });
    }
};
// get individual student
export const adminGetOneStudent = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const user = await getUser(req);
        if (!user || !user.isAdmin) {
          return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }

        const student = await Student.findById({_id: id})
        .populate('center')
        .populate({
            path: "plan",
            model: Paymentplan,
            // populate: {
            // path: '_id', // Adjust based on your needs
            select:
              "amount installments estimate last_payment_date next_payment_date reg_date",
            populate: {
              path: "course_id",
              model: Course,
              select: "title duration amount",
            },
            // }
          })
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
}
// get all students
export const adminGetAllStudents = async (req: Request, res: Response) => {
    try {
        const user = await getUser(req);
        if (!user || !user.isAdmin) {
            return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }

        const { page = 1, limit = 20, q, center, course } = req.query;

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
            if (center) {
                query.center = center;
            }

        // Course filter
        if (course) {
            query['plan.course_id'] = course;
        }

        console.log('Query:', query);

        const totalDocuments = await Student.countDocuments(query);
        const totalPages = Math.ceil(totalDocuments / Number(limit));

        const students = await Student.find(query)
            .populate('center')
            .populate({
                path: "plan",
                model: Paymentplan,
                // populate: {
                // path: '_id', // Adjust based on your needs
                select:
                  "amount installments estimate last_payment_date next_payment_date reg_date",
                populate: {
                  path: "course_id",
                  model: Course,
                  select: "title duration amount",
                },
                // }
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
}

// Delete Student
export const deleteStudent = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const user = await getUser(req);
        if (!user || !user.isAdmin) {
          return res.status(401).json({ data: 'Unauthorized', status: 401 });
        }

        const student = await Student.findOneAndDelete({ _id: id});
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