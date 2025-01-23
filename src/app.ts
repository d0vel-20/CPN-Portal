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
import { spawn } from "child_process";

const app = express()

   // script to connect to vps webhook to build automatically
   const script:string = `echo 'starting script' 
   git pull
   npm install
   npm run build
   pm2 restart apicpn
   echo 'ended script'`;
       app.post('/api/webhook-backend', async (req: any, res: any) => {
          console.log("Webhook triggered. Starting build process...");

           const child = spawn("bash", ["-c", script.replace(/\n/g, "&&")]);
   
           const prom = new Promise<boolean>((resolve, reject) => {
             child.stdout.on("data", (data: any) => {
               console.log(`stdout: ${data}`);
             });
         
             child.on("close", (code: any) => {
               console.log(`child process exited with code ${code}`);
               if (code == 0) resolve(true);
               else resolve(false);
             });

           });

          if (await prom) {
      console.log("Build process completed successfully.");
      return res.status(200).json({ success: true });
  } else {
      console.error("Build process failed.");
      return res.status(500).json({ success: false });
  }
       })
   
       
   
       const feScript: string = `
       echo 'starting script'
       cd ../cpnfrontend || exit 1
       echo 'Pulling latest changes from git'
       git pull origin main || exit 1
       echo 'Installing dependencies'
       npm install || exit 1
       echo 'Stopping PM2 process'
       pm2 stop cpnfrontend || exit 1
       echo 'Building the project'
       npm run build || exit 1
       echo 'Starting PM2 process'
       pm2 start cpnfrontend || exit 1
       echo 'Script finished successfully'
       `;
       app.post('/api/webhook-frontend', async (req: any, res: any) => {
        const child = spawn("bash", ["-c", feScript]);
      
        let output = '';
        let errorOccurred = false;

        child.stdout.on("data", (data: Buffer) => {
          console.log(`stdout: ${data.toString()}`);
          output += data.toString();
        });
      
        child.stderr.on("data", (data: Buffer) => {
          console.error(`stderr: ${data.toString()}`);
          output += data.toString();
          errorOccurred = true;
        });
      
       
        child.on("close", (code) => {
          console.log(`child process exited with code ${code}`);
          if (code === 0 && !errorOccurred) {
            return res.status(200).json({ success: true, log: output });
          } else {
            return res.status(500).json({ success: false, log: output });
          }
        });
      
       
        child.on("error", (err) => {
          console.error(`Error occurred: ${err.message}`);
          return res.status(500).json({ success: false, error: err.message });
        });
      });




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
