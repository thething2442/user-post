import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { json } from 'body-parser';
import { Router } from 'express';
import { desc } from 'drizzle-orm';
import cron from 'node-cron';
import http from 'http'; // Import http module
import { Server } from 'socket.io'; // Import Server from socket.io

import db from './dbconfiguration/db.connect.configuration.controller';
import { chatMessages } from './drizzle/schema';
import { eq } from 'drizzle-orm';

import { seedUsers } from './utils/user-generator';
import { seedPosts } from './utils/post-generator';
import { generateAndSendChatMessage } from './utils/chat-generator'; // Import the chat generator

// Import user controller functions
import { CreateUser, GetAll, GetByID, EditById, DeleteById } from './controllers/user.config';
// Import post controller functions
import { CreatePost, GetAllPosts, GetPostByID, EditPostById, DeletePostById } from './controllers/post.config';
// Import comment controller functions
import { CreateComment, GetAllComments, GetCommentByID, EditCommentById, DeleteCommentById } from './controllers/comments.config';


dotenv.config();
console.log('Server starting...');
const app = express(); // Renamed to app for standard convention
const router = Router();
app.use(json());
const port = process.env.PORT as string;
app.use(cors({
  origin: ['*']
}));
app.use(helmet());

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for WebSocket connections
    methods: ["GET", "POST"]
  }
});

// Socket.IO event handling
io.on('connection', async (socket) => {
  console.log('A user connected:', socket.id);

  // Fetch and emit last 50 chat messages on connection
  try {
    const messages = await db.select().from(chatMessages).orderBy(desc(chatMessages.createdAt)).limit(50);
    socket.emit('past messages', messages);
  } catch (error) {
    console.error('Error fetching past messages:', error);
  }

  socket.on('chat message', async (data: { senderId: number, message: string }) => {
    console.log('message from user', data.senderId, ':', data.message);
    try {
      // Save message to database
      await db.insert(chatMessages).values({
        senderId: data.senderId,
        message: data.message,
        createdAt: Math.floor(Date.now() / 1000) // Unix timestamp
      });
      // Broadcast message to all connected clients
      io.emit('chat message', data); // Broadcast the message data including senderId
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


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
app.use('/api', router);

server.listen(port, async () => {
  console.log(`Connected http://localhost:${port}`);
  console.log('Registered API Endpoints:');

  router.stack.forEach(layer => {
    if (layer.route) {
      const method = layer.route.stack[0].method.toUpperCase();
      console.log(`  ${method} /api${layer.route.path}`);
    }
  });

  console.log('Attempting initial user and post generation...');
  seedUsers(1000).then(() => {
    console.log('Initial user generation complete.');
    seedPosts(1000).then(async () => {
      console.log('Initial post generation complete.');
      // Generate 50 chat messages over 10 hours for initial run
      console.log('Generating 50 chat messages over the next 10 hours for initial run...');
      const initialNumberOfMessages = 50;
      const initialDurationHours = 10;
      const initialTotalDurationMs = initialDurationHours * 60 * 60 * 1000;
      const initialDelayBetweenMessagesMs = initialTotalDurationMs / initialNumberOfMessages;

      for (let i = 0; i < initialNumberOfMessages; i++) {
        await generateAndSendChatMessage(io);
        if (i < initialNumberOfMessages - 1 && initialDelayBetweenMessagesMs > 0) {
          await new Promise(resolve => setTimeout(resolve, initialDelayBetweenMessagesMs));
        }
      }
      console.log('Initial chat message generation complete.');
    }).catch(err => console.error('Error during initial post generation:', err));
  }).catch(err => console.error('Error during initial user generation:', err));

  console.log('Scheduling bi-hourly user and post generation...');
  cron.schedule('0 */2 * * *', () => {
    console.log('Running bi-hourly user and post generation...');
    seedUsers(1000).then(() => {
      console.log('Bi-hourly user generation complete. Proceeding with post generation.');
      seedPosts(1000).catch(err => console.error('Error during scheduled post generation:', err));
    }).catch(err => console.error('Error during scheduled user generation:', err));
  });
  console.log('Bi-hourly generation scheduled.');

  // Schedule recurring chat message generation (50 messages over 1 hour, every hour)
  console.log('Scheduling hourly chat message generation...');
  cron.schedule('0 * * * *', async () => { // Every hour at minute 0
    console.log('Generating 50 chat messages over the next hour...');
    const numberOfMessages = 50;
    const durationHours = 10;
    const totalDurationMs = durationHours * 60 * 60 * 1000; // 1 hour in milliseconds
    const delayBetweenMessagesMs = totalDurationMs / numberOfMessages;

    for (let i = 0; i < numberOfMessages; i++) {
      await generateAndSendChatMessage(io);
      if (i < numberOfMessages - 1 && delayBetweenMessagesMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenMessagesMs));
      }
    }
    console.log('Hourly chat message generation complete.');
  });
  console.log('Hourly chat message generation scheduled.');
});
