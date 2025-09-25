import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { json } from 'body-parser';
import { Router } from 'express';
import cron from 'node-cron';
import { seedUsers } from './utils/user-generator';
import { seedPosts } from './utils/post-generator'; // Import seedPosts

dotenv.config();
const application = express();
const router = Router();
application.use(json());
const port = process.env.PORT as string;
application.use(cors({
  origin:['*']
}));
application.use(helmet());

application.listen(port,() =>{
  console.log(`Connected http://localhost:${port}`);
  
  // Seed the database with 1000 users on startup
  seedUsers(1000);
  // Seed the database with 1000 posts on startup
  seedPosts(1000);

  // Schedule seeding every 2 hours using node-cron
  cron.schedule('0 */2 * * *', () => {
    console.log('Running bi-hourly user and post generation...');
    seedUsers(1000);
    seedPosts(1000);
  });
});
