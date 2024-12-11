import { Request, Response } from "express";
import { getUser } from "../../utils/getUser";
import Student from "../../models/studentModel";
import Course from "../../models/courseModel";
import Paymentplan from "../../models/paymentplanModel";
import { Paginated } from "../../types/pagination.types";
import Staff from "../../models/staffModel";
import mongoose from "mongoose";
import { populate } from "dotenv";
import Invoice from "../../models/invoiceModel";
import Payment from "../../models/paymentModel";
import cron from "node-cron";
import Center from "../../models/centerModel";
import nodemailer from 'nodemailer';
import moment from "moment";

// create student
export const createStudent = async (req: Request, res: Response) => {
  const { fullname, email, phone, reg_date, birth_date, student_id } = req.body;

  // Validate input
  if (
    !fullname ||
    !email ||
    !phone ||
    !reg_date ||
    !birth_date ||
    !student_id
  ) {
    return res
      .status(400)
      .json({ data: "All fields are required", status: 400 });
  }

  try {
    const user = await getUser(req);
    if (!user || user.isAdmin) {
      return res.status(401).json({ data: "Unauthorized", status: 401 });
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
        message: "Student Created Successfully",
      },
    });
  } catch (error) {
    console.error("Error Creating Student:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Edit Student
export const editStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const user = await getUser(req);
    if (!user || user.isAdmin) {
      return res.status(401).json({ data: "Unauthorized", status: 401 });
    }

    const student = await Student.findOne({
      _id: id,
      center: user.user.center,
    });
    if (!student) {
      return res.status(404).json({ data: "Student Not Found", status: 404 });
    }

    Object.assign(student, updates);
    await student.save();

    return res.status(200).json({
      status: 200,
      data: {
        student,
        message: "Student Updated Successfully",
      },
    });
  } catch (error) {
    console.error("Error Editing Student:", error);
    return res.status(500).json({ data: "Internal Server Error", status: 500 });
  }
};

// Get All Students
export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ data: "Unauthorized", status: 401 });
    }

    const { page = 1, limit = 20, q, center, course } = req.query;

    const query: any = {};

    // General search (name, email, etc.)
    if (q) {
      query.$or = [
        { fullname: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } }, // assuming email is a field
      ];
    }

    // Center filter (only for admin users)
    if (center && user.isAdmin) {
      query.center = center;
    } else if (!user.isAdmin) {
      // If not admin, filter by user's center
      query.center = user.user.center;
    } else {
      return res.status(401).json({ data: "Unauthorized", status: 401 });
    }

    // Course filter
    if (course) {
      query["plan.course_id"] = course;
    }

    const totalDocuments = await Student.countDocuments(query);
    const totalPages = Math.ceil(totalDocuments / Number(limit));

    const students = await Student.find(query)
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

    const paginatedResponse = {
      saved: [],
      existingRecords: students,
      hasPreviousPage: Number(page) > 1,
      previousPages: Number(page) - 1,
      hasNextPage: Number(page) < totalPages,
      nextPages: Number(page) + 1,
      totalPages: totalPages,
      totalDocuments: totalDocuments,
      currentPage: Number(page),
    };

    return res.status(200).json({
      status: 200,
      data: paginatedResponse,
    });
  } catch (error) {
    console.error("Error Fetching Students:", error);
    return res.status(500).json({ data: "Internal Server Error", status: 500 });
  }
};

// Get Student by ID
export const getStudentById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await getUser(req);
    if (!user || user.isAdmin) {
      return res.status(401).json({ data: "Unauthorized", status: 401 });
    }

    const student = await Student.findById({
      _id: id,
      center: user.user.center,
    }).populate({
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
    });
    if (!student) {
      return res.status(404).json({ data: "Student Not Found", status: 404 });
    }

    return res.status(200).json({
      status: 200,
      data: student,
    });
  } catch (error) {
    console.error("Error Fetching Student:", error);
    return res.status(500).json({ data: "Internal Server Error", status: 500 });
  }
};

// Delete Student
export const deleteStudent = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await getUser(req);
    if (!user || user.isAdmin) {
      return res.status(401).json({ data: "Unauthorized", status: 401 });
    }

    const student = await Student.findOneAndDelete({
      _id: id,
      center: user.user.center,
    });
    if (!student) {
      return res.status(404).json({ data: "Student Not Found", status: 404 });
    }

    return res.status(200).json({
      status: 200,
      data: { message: "Student Deleted Successfully" },
    });
  } catch (error) {
    console.error("Error Deleting Student:", error);
    return res.status(500).json({ data: "Internal Server Error", status: 500 });
  }
};

// Create Staff

export const createStaff = async (req: Request, res: Response) => {
  const { fullname, email, phone, courses, salary } = req.body;

  // Validate input
  if (!fullname || !email || !phone || !courses || !salary) {
    return res
      .status(400)
      .json({ data: "All fields are required", status: 400 });
  }

  // email validatin
  const existingEmail = await Staff.findOne({ email });
  if (existingEmail) {
    return res.status(400).json({ data: "Email already exist", status: 400 });
  }

  try {
    const user = await getUser(req);
    if (!user || user.isAdmin) {
      return res.status(401).json({ data: "Unauthorized", status: 401 });
    }

    const center = user.user.center;

    const newStaff = new Staff({
      fullname,
      email,
      phone,
      center,
      courses,
      salary,
    });

    await newStaff.save();

    return res.status(201).json({
      status: 201,
      data: {
        newStaff,
        message: "Staff Created Successfully",
      },
    });
  } catch (error) {
    console.error("Error Creating Staff:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// get all staff
export const getAllStaff = async (req: Request, res: Response) => {
  try {
    const user = await getUser(req);
    if (!user || user.isAdmin) {
      return res.status(401).json({ data: "Unauthorized", status: 401 });
    }

    const { q } = req.query; // Retrieve the search query parameter

    const query: any = { center: user.user.center }; // Base query to filter by center

    // Add search by name if 'q' is provided
    if (q) {
      query.$or = { fullname: { $regex: q, $options: "i" } }; // Case-insensitive search by name
    }

    const staff = await Staff.find(query) // Use the query with optional search criteria
      .populate("courses")
      .exec();

    return res.status(200).json({
      status: 200,
      data: staff,
    });
  } catch (error) {
    console.error("Error Fetching Staff:", error);
    return res.status(500).json({ data: "Internal Server Error", status: 500 });
  }
};

// get individual staff
export const getStaffById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await getUser(req);
    if (!user || user.isAdmin) {
      return res.status(401).json({ data: "Unauthorized", status: 401 });
    }

    const staff = await Staff.findOne({ _id: id, center: user.user.center });
    if (!staff) {
      return res.status(404).json({ data: "Staff Not Found", status: 404 });
    }

    return res.status(200).json({
      status: 200,
      data: staff,
    });
  } catch (error) {
    console.error("Error Fetching Staff:", error);
    return res.status(500).json({ data: "Internal Server Error", status: 500 });
  }
};

// edit staff
export const editStaff = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const user = await getUser(req);
    if (!user || user.isAdmin) {
      return res.status(401).json({ data: "Unauthorized", status: 401 });
    }

    const staff = await Staff.findOne({ _id: id, center: user.user.center });
    if (!staff) {
      return res.status(404).json({ data: "Staff Not Found", status: 404 });
    }

    Object.assign(staff, updates);
    await staff.save();

    return res.status(200).json({
      status: 200,
      data: {
        staff,
        message: "Staff Updated Successfully",
      },
    });
  } catch (error) {
    console.error("Error Editing Staff:", error);
    return res.status(500).json({ data: "Internal Server Error", status: 500 });
  }
};

// Delete staff
export const deleteStaff = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await getUser(req);
    if (!user || user.isAdmin) {
      return res.status(401).json({ data: "Unauthorized", status: 401 });
    }

    const staff = await Staff.findOneAndDelete({
      _id: id,
      center: user.user.center,
    });
    if (!staff) {
      return res.status(404).json({ data: "Staff Not Found", status: 404 });
    }

    return res.status(200).json({
      status: 200,
      data: { message: "Staff Deleted Successfully" },
    });
  } catch (error) {
    console.error("Error Deleting Staff:", error);
    return res.status(500).json({ data: "Internal Server Error", status: 500 });
  }
};

// add course to student


export const addCourse = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount, course_id, installments, reg_date } = req.body;

  try {
    const user = await getUser(req);
    if (!user || user.isAdmin) {
      return res.status(401).json({ data: "Unauthorized", status: 401 });
    }

    const student = await Student.findById({
      _id: id,
      center: user.user.center,
    });
    if (!student) {
      return res.status(404).json({ data: "Student not found", status: 404 });
    }

    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ data: "Course not found", status: 404 });
    }

    // Assuming course.duration is in months
    const courseDuration = Number(course.duration);
    const estimate = +amount / +installments;

    // Calculate interval between payments based on installments and course duration
    const intervalInMonths = courseDuration / +installments;

    // Calculate the next payment date from the registration date
    const next_payment_date = moment(reg_date).add(intervalInMonths, 'months');

    const paymentPlan = new Paymentplan({
      user_id: student._id,
      amount,
      course_id: course._id,
      installments,
      estimate,
      reg_date,
      next_payment_date,
    });

    await paymentPlan.save();

    student.plan.push(paymentPlan._id);
    await student.save();

    return res.status(201).json({
      data: "Payment plan created successfully",
      paymentPlan,
      status: 201,
    });
  } catch (error) {
    console.error("Error adding payment plan:", error);
    return res.status(500).json({
      data: "Internal Server Error",
      error: (error as any).message,
      status: 500,
    });
  }
};

// create invoice
export const createInvoice = async (req: Request, res: Response) => {
  const { amount, payment_plan_id, message, disclaimer, due_date } = req.body;

  try {
    const user = await getUser(req);
    if (!user || user.isAdmin) {
      return res.status(401).json({ data: "Unauthorized", status: 401 });
    }

    const newInvoice = new Invoice({
      amount,
      payment_plan_id,
      message,
      disclaimer,
      due_date,
    });

    await newInvoice.save();
    res.status(201).json({
      status: 201,
      data: {
        newInvoice,
        message: "Invoice created successfully",
      },
    });
  } catch (error) {
    res.status(500).json({ "Error creating invoice": error });
  }
};

// get all invoices
export const getAllInvoices = async (req: Request, res: Response) => {
  try {
    const user = await getUser(req);
    if (!user || user.isAdmin) {
      return res.status(401).json({ data: "Unauthorized", status: 401 });
    }

    const invoices = await Invoice.find().populate({
      path: "payment_plan_id",
      model: Paymentplan,
      select:
        "amount installments estimate last_payment_date next_payment_date reg_date",
      populate: [
        {
          path: "course_id",
          model: Course,
          select: "title duration amount",
        },
        {
          path: "user_id",
          model: Student,
          select: "fullname email phone center student_id",
          populate:[{
            path: "center",
            model: Center,
            select: "name location code"
          }]
        },
      ],
    });

    res.status(200).json({
      data: invoices,
      status: 200,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error fetching invoices",
      details: error,
    });
  }
};

// get single invoice
export const getInvoiceById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await getUser(req);
    if (!user || user.isAdmin) {
      return res.status(401).json({ data: "Unauthorized", status: 401 });
    }

    const invoice = await Invoice.findById(id).populate({
      path: "payment_plan_id",
      model: Paymentplan,
      select:
        "amount installments estimate last_payment_date next_payment_date reg_date",
      populate: [
        {
          path: "course_id",
          model: Course,
          select: "title duration amount",
        },
        {
          path: "user_id",
          model: Student,
          select: "fullname email phone center student_id",
          populate:[{
            path: "center",
            model: Center,
            select: "name location code"
          }]
        },
      ],
    });

    if (!invoice) {
      return res.status(404).json({
        data: "Invoice not found",
        status: 404,
      });
    }

    res.status(200).json({
      data: invoice,
      status: 200,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error fetching the invoice",
      details: error,
    });
  }
};

// delete invoice
export const deleteInvoice = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await getUser(req);
    if (!user || user.isAdmin) {
      return res.status(401).json({ data: "Unauthorized", status: 401 });
    }

    const invoice = await Invoice.findByIdAndDelete(id);

    if (!invoice) {
      return res.status(404).json({
        data: "Invoice not found",
        status: 404,
      });
    }

    res.status(200).json({
      data: "Invoice deleted successfully",
      status: 200,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error deleting the invoice",
      details: error,
    });
  }
};

// add payment
export const addPayment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount, payment_plan_id, message, disclaimer, payment_date } =
    req.body;

  try {
    const user = await getUser(req);
    if (!user || user.isAdmin) {
      return res.status(401).json({ data: "Unauthorized", status: 401 });
    }

    const student = await Student.findById({
      _id: id,
      center: user.user.center,
    });
    if (!student) {
      return res.status(404).json({ data: "Student not found", status: 404 });
    }
    

        // Find the payment plan to get the last payment date
        const paymentPlan = await Paymentplan.findById(payment_plan_id);
        if (!paymentPlan) {
          return res.status(404).json({ data: "Payment plan not found", status: 404 });
        }

            // Use the next payment date from the payment plan as the last payment date
    const lastPaymentDate = paymentPlan.next_payment_date || payment_date;

    const newPayment = new Payment({
      user_id: student._id,
      amount,
      payment_plan_id,
      message,
      disclaimer,
      payment_date,
      lastPaymentDate,
    });

    await newPayment.save();

    // Update the next payment date in the payment plan
    const nextPaymentDate = moment(lastPaymentDate).add(1, 'months').toISOString(); // Convert Moment to ISO string
    paymentPlan.next_payment_date = nextPaymentDate; // Assign as an ISO string
    await paymentPlan.save();


    res.status(201).json({
      status: 201,
      data: {
        newPayment,
        message: "Payment created successfully",
      },
    });
  } catch (error) {
    res.status(500).json({ "Error creating payment": error });
  }
};

// get all payments
export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const user = await getUser(req);
    if (!user || user.isAdmin) {
      return res.status(401).json({ data: "Unauthorized", status: 401 });
    }

    

    // Extract pagination parameters from the request query with default values
    const { page = 1, limit = 20, center,userId, minAmount, maxAmount, studentSearch, courseSearch } = req.query;
    let _center:any;
    if (user.isAdmin) {
      if (center) {
        _center = new mongoose.Types.ObjectId(center as string); // Ensure it's an ObjectId
      }
    } else {
      _center = user.user.center; // Manager's center is assigned
    }

    const query: any = {};
    
    console.log({center});
    
    if (!_center || !mongoose.Types.ObjectId.isValid(_center as any)) {
      return res.status(400).json({
        message: "Invalid center ID provided",
        status: 400,
      });
    }

    const centerId = new mongoose.Types.ObjectId(_center as string);


    if (userId) {
      const userIdString = Array.isArray(userId) ? userId[0] : userId; // Handle arrays of query parameters
      if (typeof userIdString === "string" && mongoose.Types.ObjectId.isValid(userIdString)) {
        query.user_id = new mongoose.Types.ObjectId(userIdString);
      } else {
        return res.status(400).json({
          message: "Invalid userId provided",
          status: 400,
        });
      }
    }

    // Filter by amount range if provided
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = Number(minAmount);
      if (maxAmount) query.amount.$lte = Number(maxAmount);
    }

        // search by student details if studentSearch is provided
        if (studentSearch && typeof studentSearch === "string") {
          query["payment_plan_id.user_id"] = {
            $or: [
              { fullname: new RegExp(studentSearch, "i") },
              { email: new RegExp(studentSearch, "i") },
              { phone: new RegExp(studentSearch, "i") },
              { student_id: new RegExp(studentSearch, "i") },
            ],
          };
        }


            // search by course if courseSearch is provided
    if (courseSearch && typeof courseSearch === "string") {
      query["payment_plan_id.course_id"] = {
        $or: [
          { title: new RegExp(courseSearch, "i") },
          { duration: new RegExp(courseSearch, "i") },
        ],
      };
    }

    // Calculate total documents and total pages
    const totalDocuments = await Payment.countDocuments(query);
    const totalPages = Math.ceil(totalDocuments / Number(limit));

    // Fetch payments with pagination
    const payments = await Payment.find(query)
      .skip((Number(page) - 1) * Number(limit)) // Skip documents based on current page
      .limit(Number(limit))
       // Limit the number of documents per page
       .populate({
        path: "user_id", // Populate the `user_id` field
        model: "Student",
        match: { center: centerId }, // Apply filter to the populated documents
        select: "fullname email phone center", // Fetch only relevant fields
      })
      .populate({
        path: "payment_plan_id",
        model: Paymentplan,
        select:
          "amount installments estimate last_payment_date next_payment_date reg_date",
        populate: [
          {
            path: "course_id",
            model: Course,
            select: "title duration amount",
          },
          {
            path: "user_id",
            model: Student,
            select: "fullname email phone center student_id",
            populate:[{
              path: "center",
              model: Center,
              select: "name location code"
            }]
          },
        ],
      });

      const filteredPayments = payments.filter(
        (payment) => payment.user_id !== null
      );

    // Construct the paginated response
    const paginatedResponse = {
      saved: [],
      existingRecords: filteredPayments,
      hasPreviousPage: Number(page) > 1,
      previousPages: Number(page) - 1,
      hasNextPage: Number(page) < totalPages,
      nextPages: Number(page) + 1,
      totalPages: totalPages,
      totalDocuments: totalDocuments,
      currentPage: Number(page),
    };

    res.status(200).json({
      status: 200,
      data: paginatedResponse,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({
      data: "Internal Server Error",
      status: 500,
      details: error,
    });
  }
};


// get single payment
export const getPaymentById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await getUser(req);
    if (!user || user.isAdmin) {
      return res.status(401).json({ data: "Unauthorized", status: 401 });
    }

    const payment = await Payment.findById(id).populate({
      path: "payment_plan_id",
      model: Paymentplan,
      select:
        "amount installments estimate last_payment_date next_payment_date reg_date",
      populate: [
        {
          path: "course_id",
          model: Course,
          select: "title duration amount",
        },
        {
          path: "user_id",
          model: Student,
          select: "fullname email phone center student_id",
          populate:[{
            path: "center",
            model: Center,
            select: "name location code"
          }]
        },
      ],
    });

    if (!payment) {
      return res.status(404).json({
        data: "Payment not found",
        status: 404,
      });
    }

    res.status(200).json({
      data: payment,
      status: 200,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error fetching the payment",
      details: error,
    });
  }
};

// get all payment for a student
export const getPaymentsByStudentId = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await getUser(req);
    if (!user || user.isAdmin) {
      return res.status(401).json({ data: "Unauthorized", status: 401 });
    }

    const payments = await Payment.find({ user_id: id }).populate({
      path: "payment_plan_id",
      model: Paymentplan,
      select:
        "amount installments estimate last_payment_date next_payment_date reg_date",
      populate: [
        {
          path: "course_id",
          model: Course,
          select: "title duration amount",
        },
        {
          path: "user_id",
          model: Student,
          select: "fullname email phone center student_id",
          populate:[{
            path: "center",
            model: Center,
            select: "name location code"
          }]
        },
      ],
    });

    // if (payments.length === 0) {
    //   return res.status(404).json({
    //     data: "No payments found for the student",
    //     status: 404,
    //   });
    // }

    res.status(200).json({
      data: payments,
      status: 200,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error fetching payments for the student",
      details: error,
    });
  }
};


async function sendEmail(to: string, subject: string, text: string) {
  // Create a transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // You can use other services like Yahoo, Outlook, etc.
    auth: {
      user: 'your-email@gmail.com', // Replace with your email
      pass: 'your-email-password', // Replace with your email password
    },
  });

  // Setup email data
  const mailOptions = {
    from: 'your-email@gmail.com', // Sender address
    to, // Manager's email address
    subject, // Subject line
    text, // Plain text body
  };

  // Send mail with defined transport object
  await transporter.sendMail(mailOptions);
}







export async function getPlanBalance(req: Request, res: Response) {
  const { id } = req.params;
  try {

    const plan = await Paymentplan.findById(id);
    if (!plan) {
      return res.status(404).json({ data: "gerrout", status: 404 });
    }

    const payments = await Payment.find({ payment_plan_id: id });
    if (!payments || !payments.length) {
      return res.status(200).json({ data: "0", status: 200 });
    }
    const toBePaid = Number(plan.amount);
    let paid = 0;
    payments.forEach(payment=>{
      paid += Number(payment.amount)
    })

    const balance = Math.abs(toBePaid - paid);

        // If there's a remaining balance, send an email to the manager
        // if (balance > 0) {
        //   const managerEmail = "nwanebij@gmail.com"; // Replace with the manager's email address
        //   const emailSubject = "Remaining Payment Notification";
        //   const emailText = `Dear Manager,\n\nThe student with plan ID ${id} has a remaining balance of ${balance} to be paid.\n\nBest regards,\nYour System`;
    
        //   await sendEmail(managerEmail, emailSubject, emailText);
        // }


    return res.status(200).json({ data: `${balance}`, status: 200 });


  } catch (error) {
    console.error(error);
    
    res.status(500).json({
      error: "Error fetching balance for the student",
      details: error,
    });
  }
}



