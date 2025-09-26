import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateUser = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
];

export const validatePost = [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
];

export const validateComment = [
  body('content').isString().isLength({ min: 1 }).withMessage('Comment content is required and must be a string'),
];