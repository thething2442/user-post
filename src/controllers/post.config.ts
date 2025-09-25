import type { Request, Response } from "express";
import db from "../dbconfiguration/db.connect.configuration.controller";
import * as schema from '../drizzle/schema';
import { eq } from "drizzle-orm";

type PostProps = {
  userId: number;
  content: string;
};

// Create Post
export const CreatePost = async (req: Request, res: Response) => {
  const { userId, content } = req.body as PostProps;

  try {
    // Check if the user exists
    const userExists = await db.select().from(schema.users).where(eq(schema.users.id, userId));
    if (userExists.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const newPost = {
      userId,
      content,
    };

    const result = await db.insert(schema.posts).values(newPost).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating post" });
  }
};

// Get All Posts
export const GetAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await db.select({
      id: schema.posts.id,
      userId: schema.posts.userId,
      content: schema.posts.content,
      createdAt: schema.posts.createdAt,
    }).from(schema.posts);
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting posts" });
  }
};

// Get Post By ID
export const GetPostByID = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const post = await db.select({
      id: schema.posts.id,
      userId: schema.posts.userId,
      content: schema.posts.content,
      createdAt: schema.posts.createdAt,
    }).from(schema.posts).where(eq(schema.posts.id, parseInt(id, 10)));

    if (post.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting post" });
  }
};

// Edit Post By ID
export const EditPostById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, content } = req.body as Partial<PostProps>; // Partial for updates

  try {
    const updateData: Partial<typeof schema.posts.$inferInsert> = {};

    if (userId !== undefined) {
      // Optionally check if the new userId exists
      const userExists = await db.select().from(schema.users).where(eq(schema.users.id, userId));
      if (userExists.length === 0) {
        return res.status(404).json({ message: "User not found for updated userId" });
      }
      updateData.userId = userId;
    }
    if (content !== undefined) updateData.content = content;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const result = await db.update(schema.posts)
      .set(updateData)
      .where(eq(schema.posts.id, parseInt(id, 10)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating post" });
  }
};

// Delete Post By ID
export const DeletePostById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await db.delete(schema.posts)
      .where(eq(schema.posts.id, parseInt(id, 10)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting post" });
  }
};
