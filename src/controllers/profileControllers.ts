import { Request, Response } from 'express';
import Admin from '../models/adminModel';
import { get } from 'http';
import { getUser } from '../utils/getUser';

const getAdminProfile = async (req: Request, res: Response) => {
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
    res.status(500).json({ data: 'Internal Server Error' });
  }
};

export default getAdminProfile;
