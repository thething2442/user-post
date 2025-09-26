import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors'
import helmet from 'helmet';
import { json } from 'body-parser';
import { Router } from 'express';
import cron from 'node-cron'; // Import cron
import { seedUsers } from './utils/user-generator'; // Import seedUsers
import { seedPosts } from './utils/post-generator'; // Import seedPosts

// Import user controller functions
import { CreateUser, GetAll, GetByID, EditById, DeleteById } from './controllers/user.config';
// Import post controller functions
import { CreatePost, GetAllPosts, GetPostByID, EditPostById, DeletePostById } from './controllers/post.config';
// Import comment controller functions
import { CreateComment, GetAllComments, GetCommentByID, EditCommentById, DeleteCommentById } from './controllers/comments.config';


dotenv.config();
console.log('Server starting...'); // Added log
const application = express()
const router = Router()
application.use(json());
const port = process.env.PORT as string
application.use(cors({
  origin:['*']
}));
application.use(helmet());

// User Routes
router.post('/users', CreateUser);
router.get('/users', GetAll);
router.get('/users/:id', GetByID);
router.put('/users/:id', EditById);
router.delete('/users/:id', DeleteById);

// Post Routes
router.post('/posts', CreatePost);
router.get('/posts', GetAllPosts);
router.get('/posts/:id', GetPostByID);
router.put('/posts/:id', EditPostById);
router.delete('/posts/:id', DeletePostById);

// Comment Routes
router.post('/comments', CreateComment);
router.get('/comments', GetAllComments);
router.get('/comments/:id', GetCommentByID);
router.put('/comments/:id', EditCommentById);
router.delete('/comments/:id', DeleteCommentById);

// Apply the router to the application
application.use('/api', router); // Using /api prefix for all routes

application.listen(port,() =>{ console.log(`Connected http://localhost:${port}`);
  console.log('Registered API Endpoints:');

  // Log routes from the router object directly
  router.stack.forEach(layer => {
    if (layer.route) {
      // Access the method from the route's stack
      const method = layer.route.stack[0].method.toUpperCase();
      console.log(`  ${method} /api${layer.route.path}`);
    }
  });

  console.log('Attempting initial user and post generation...'); // Added log
  // Automatic user and post generation
  seedUsers(1000).then(() => {
    console.log('Initial user generation complete.');
    seedPosts(1000).then(() => {
      console.log('Initial post generation complete.');
    }).catch(err => console.error('Error during initial post generation:', err));
  }).catch(err => console.error('Error during initial user generation:', err));


  console.log('Scheduling bi-hourly user and post generation...'); // Added log
  cron.schedule('0 */2 * * *', () => {
    console.log('Running bi-hourly user and post generation...');
    seedUsers(1000).then(() => {
      console.log('Bi-hourly user generation complete. Proceeding with post generation.');
      seedPosts(1000).catch(err => console.error('Error during scheduled post generation:', err));
    }).catch(err => console.error('Error during scheduled user generation:', err));
  });
  console.log('Bi-hourly generation scheduled.'); // Added log
});