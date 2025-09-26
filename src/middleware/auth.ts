import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from '../dbconfiguration/db.connect.configuration.controller';
import { users, posts, comments } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || 'your_default_secret';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }
    (req as any).user = user;
    next();
  });
};

export const isOwner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedUser = (req as any).user;
    const resourceId = parseInt(req.params.id, 10);

    if (!authenticatedUser || !resourceId) {
      return res.sendStatus(400); // Bad Request
    }

    const authenticatedUserId = authenticatedUser.id;

    if (req.originalUrl.includes('/users/')) {
      if (authenticatedUserId === resourceId) {
        return next();
      }
    } else if (req.originalUrl.includes('/posts/')) {
      const post = await db.select().from(posts).where(eq(posts.id, resourceId));
      if (post[0] && post[0].userId === authenticatedUserId) {
        return next();
      }
    } else if (req.originalUrl.includes('/comments/')) {
      const comment = await db.select().from(comments).where(eq(comments.id, resourceId));
      if (comment[0] && comment[0].userId === authenticatedUserId) {
        return next();
      }
    }

    return res.sendStatus(403); // Forbidden
  } catch (error) {
    console.error('Error in isOwner middleware:', error);
    return res.sendStatus(500);
  }
};