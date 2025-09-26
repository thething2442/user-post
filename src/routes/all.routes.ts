
import { Router } from 'express';
import { authenticateToken, isOwner } from '../middleware/auth';
import { validateUser, validatePost, validateComment } from '../middleware/validation';

// Import user controller functions
import { CreateUser, GetAll, GetByID, EditById, DeleteById } from '../controllers/user.config';
// Import post controller functions
import { CreatePost, GetAllPosts, GetPostByID, EditPostById, DeletePostById } from '../controllers/post.config';
// Import comment controller functions
import { CreateComment, GetAllComments, GetCommentByID, EditCommentById, DeleteCommentById } from '../controllers/comments.config';

const router = Router();

// User Routes
router.post('/users', validateUser, CreateUser);
router.get('/users', authenticateToken, GetAll);
router.get('/users/:id', authenticateToken, GetByID);
router.put('/users/:id', authenticateToken, isOwner, validateUser, EditById);
router.delete('/users/:id', authenticateToken, isOwner, DeleteById);

// Post Routes
router.post('/posts', authenticateToken, validatePost, CreatePost);
router.get('/posts', GetAllPosts);
router.get('/posts/:id', GetPostByID);
router.put('/posts/:id', authenticateToken, isOwner, validatePost, EditPostById);
router.delete('/posts/:id', authenticateToken, isOwner, DeletePostById);

// Comment Routes
router.post('/comments', authenticateToken, validateComment, CreateComment);
router.get('/comments', GetAllComments);
router.get('/comments/:id', GetCommentByID);
router.put('/comments/:id', authenticateToken, isOwner, validateComment, EditCommentById);
router.delete('/comments/:id', authenticateToken, isOwner, DeleteCommentById);

export default router;
