import type { Request, Response } from "express";
import db from "../dbconfiguration/db.connect.configuration.controller";
import * as schema from '../drizzle/schema';
import bcrypt from 'bcryptjs';
import { eq } from "drizzle-orm";

type UserProps = {
  username: string;
  email: string;
  password?: string; // Password is not always required, e.g., for updates
};

// Create User
export const createUser = async (req: Request, res: Response) => {
  const { username, email, password } = req.body as UserProps;

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      username,
      email,
      hashedPassword,
    };

    const result = await db.insert(schema.users).values(newUser).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating user" });
  }
};

// Get all Users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await db.select({
      id: schema.users.id,
      username: schema.users.username,
      email: schema.users.email,
      createdAt: schema.users.createdAt
    }).from(schema.users);
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting users" });
  }
};

// Get User by ID
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await db.select({
      id: schema.users.id,
      username: schema.users.username,
      email: schema.users.email,
      createdAt: schema.users.createdAt
    }).from(schema.users).where(eq(schema.users.id, parseInt(id, 10)));

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting user" });
  }
};

// Update User
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, email, password } = req.body as UserProps;

  try {
    const updateData: { username?: string; email?: string; hashedPassword?: string } = {};

    if (username) {
      updateData.username = username;
    }
    if (email) {
      updateData.email = email;
    }
    if (password) {
      updateData.hashedPassword = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const result = await db.update(schema.users)
      .set(updateData)
      .where(eq(schema.users.id, parseInt(id, 10)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user" });
  }
};

// Delete User
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await db.delete(schema.users)
      .where(eq(schema.users.id, parseInt(id, 10)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting user" });
  }
};
