import { Request, Response } from 'express';
import Admin from '../models/adminModel';
import { get } from 'http';
import { getUser } from '../utils/getUser';

export const getAdminProfile = async (req: Request, res: Response) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ data: 'Unauthorized', status: 401 });
    }
    if (user.isAdmin) {
      return res.status(200).json({ data: user.user, status: 200 });
    }
    throw new Error('User is not an admin');
  } catch (error) {
    console.error(error);
    return res.status(500).json({ data: 'invalid or expired token', status: 400});
  }
};
export const getManagerProfile = async (req: Request, res: Response) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ data: 'Unauthorized', status: 401 });
    }
    if (!user.isAdmin) {
      return res.status(200).json({ data: user.user, status: 200 });
    }
    throw new Error('User is not a manager');
  } catch (error) {
    console.error(error);
    return res.status(500).json({ data: 'invalid or expired token', status: 400});
  }
};






// Cron Job Endpoint
export const cronJobEndpoint = async (req: Request, res: Response) => {
    try {
        return res.status(200).json({ message: 'Cron job executed successfully' });
    } catch (error) {
        console.error('Error executing cron job:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};


