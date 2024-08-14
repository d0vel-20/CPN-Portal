import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import {cronJobEndpoint} from './controllers/profileControllers';
import admindashRoutes from './admin/routes/admindashRoutes'
import managersdashRoutes from './managers/routes/managersdashRoutes';
import connectDB from './database/database';
import { json } from 'stream/consumers';

const app = express()
dotenv.config();

const PORT = process.env.PORT || 5000;

const startApp = async () => {
    app.use(cors());
    app.use(morgan('dev'));
    app.use(express.json());
    app.use(express.urlencoded({extended: true}))

   

    app.listen(PORT, () =>{
        console.log(`Server running on port ${PORT}`);
        
    });

    await connectDB();

    // Use the authentication routes
    app.use('/api/auth', authRoutes);
    app.use('/api/profile', profileRoutes)
    app.use('/api/admin', admindashRoutes)
    app.use('/api/manager', managersdashRoutes)

    // Cron Job Route
    app.get('/cron-job', cronJobEndpoint);


      // 404 route
  app.use((req: any, res: any) => {
    return res.status(404).json({ data: `Cannot ${req.method} route ${req.path}`, statusCode: 404, msg: "Failure" })
})
}

startApp()
