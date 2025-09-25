import type { Request, Response } from "express";
import db from "../dbconfiguration/db.connect.configuration.controller";
import * as schema from '../drizzle/schema';
import { eq } from "drizzle-orm";

type CommentProps = {
  userId: number;
  postId: number;
  content: string;
};

// Create Comment
export const CreateComment = async (req: Request, res: Response) => {
  const { userId, postId, content } = req.body as CommentProps;

  try {
    // Check if the user exists
    const userExists = await db.select().from(schema.users).where(eq(schema.users.id, userId));
    if (userExists.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the post exists
    const postExists = await db.select().from(schema.posts).where(eq(schema.posts.id, postId));
    if (postExists.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = {
      userId,
      postId,
      content,
    };

    const result = await db.insert(schema.comments).values(newComment).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating comment" });
  }
};

// Get All Comments
export const GetAllComments = async (req: Request, res: Response) => {
  try {
    const comments = await db.select({
      id: schema.comments.id,
      userId: schema.comments.userId,
      postId: schema.comments.postId,
      content: schema.comments.content,
      createdAt: schema.comments.createdAt,
    }).from(schema.comments);
    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting comments" });
  }
};

// Get Comment By ID
export const GetCommentByID = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const comment = await db.select({
      id: schema.comments.id,
      userId: schema.comments.userId,
      postId: schema.comments.postId,
      content: schema.comments.content,
      createdAt: schema.comments.createdAt,
    }).from(schema.comments).where(eq(schema.comments.id, parseInt(id, 10)));

    if (comment.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.status(200).json(comment[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting comment" });
  }
};

// Edit Comment By ID
export const EditCommentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, postId, content } = req.body as Partial<CommentProps>; // Partial for updates

  try {
    const updateData: Partial<typeof schema.comments.$inferInsert> = {};

    if (userId !== undefined) {
      // Check if the new userId exists
      const userExists = await db.select().from(schema.users).where(eq(schema.users.id, userId));
      if (userExists.length === 0) {
        return res.status(404).json({ message: "User not found for updated userId" });
      }
      updateData.userId = userId;
    }
    if (postId !== undefined) {
      // Check if the new postId exists
      const postExists = await db.select().from(schema.posts).where(eq(schema.posts.id, postId));
      if (postExists.length === 0) {
        return res.status(404).json({ message: "Post not found for updated postId" });
      }
      updateData.postId = postId;
    }
    if (content !== undefined) updateData.content = content;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const result = await db.update(schema.comments)
      .set(updateData)
      .where(eq(schema.comments.id, parseInt(id, 10)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating comment" });
  }
};

// Delete Comment By ID
export const DeleteCommentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await db.delete(schema.comments)
      .where(eq(schema.comments.id, parseInt(id, 10)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting comment" });
  }
};
