

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel';
import Manager from '../models/managersModel'
import dotenv from 'dotenv'

dotenv.config();


const JWT_SECRET = process.env.JWT_SECRET || '';

// Register Admin
export const registerAdmin = async (req: Request, res: Response) => {
  const { fullname, email, password, accessCode } = req.body;

  // Input validation
  if (!fullname || !email || !password || !accessCode) {
    return res.status(400).json({ data: 'Please fill in all fields' });
  }

  // Access code verification
  const expectedAccessCode = process.env.ACCESS_CODE; // Store in environment variable
  if (accessCode !== expectedAccessCode) {
    return res.status(403).json({ data: 'Invalid access code' });
  }

  try {
    // Check if any admin already exists
      // const exist = await Admin.findOne();
      // if (exist) {
      //   return res.status(409).json({ data: 'Admin already exists' });
      // }
    // Check for existing admin with the same email
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ data: 'Admin with this email already exists.' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new admin
    const newAdmin = new Admin({ fullname, email, password: hashedPassword });
    await newAdmin.save();

    console.log({JWT_SECRET});
    
    // Generate token
    const token = jwt.sign({ id: newAdmin._id.toString(), type: 'admin'}, JWT_SECRET, { expiresIn: '1d' });


    res.status(201).json({
      status: 201,
      data:{
        token,
        user:{id: newAdmin._id, email: newAdmin.email}
      }

    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Login Controller
export const Login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  let isAdmin = true;
  try {
    // Find the user in Admin model
    let user = await Admin.findOne({ email });

    // If not found, check Manager model
    if (!user) {
      user = await Manager.findOne({ email });
      isAdmin = false;
    }


    // If user not found in either model
    if (!user) {
      return res.status(404).json({ data: 'User not found' });
    }

    // Check password
    let isMatch = true;
    if(isAdmin){
      isMatch = await bcrypt.compare(password, user.password);
    }else{
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res.status(400).json({ data: 'Invalid credentials' });
    }

    // Generate token
    if (JWT_SECRET) {
      const token = jwt.sign(
        { id: user._id.toString(), type: isAdmin? 'admin' : 'manager' }, 
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      // Respond with user data and token
      res.status(200).json({
        status: 200,
        data: {
          token,
          user: { id: user._id, email: user.email,},
          isAdmin
        }
      });
    } else {
      throw new Error('JWT_SECRET is not defined' + JWT_SECRET);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ data: error.message });
    } else {
      res.status(500).json({ data: 'An unknown error occurred' });
    }
  }
};


