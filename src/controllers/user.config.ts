import type { Request, Response } from "express";
import db from "../dbconfiguration/db.connect.configuration.controller";
import * as schema from '../drizzle/schema';
import bcrypt from 'bcryptjs';
import { eq } from "drizzle-orm";
// import { faker } from '@faker-js/faker'; // Remove faker import

type UserProps = {
  username: string;
  email: string;
  password: string; // Make password required for CreateUser
  firstname: string;
  lastname: string;
  address: string;
  country: string;
  city: string;
  phonenumber: string;
  gender: string;
  citizenship: string;
};

// Create User
export const CreateUser = async (req: Request, res: Response) => {
  const { username, email, password, firstname, lastname, address, country, city, phonenumber, gender, citizenship } = req.body as UserProps;

  // All fields are now expected from req.body, so no need to check password specifically here
  // The type UserProps now enforces all fields as required for CreateUser

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      username,
      email,
      hashedPassword,
      firstname,
      lastname,
      address,
      country,
      city,
      phonenumber,
      gender,
      citizenship,
    };

    const result = await db.insert(schema.users).values(newUser).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating user" });
  }
};

// Get All Users
export const GetAll = async (req: Request, res: Response) => {
  try {
    const users = await db.select({
      id: schema.users.id,
      username: schema.users.username,
      email: schema.users.email,
      firstname: schema.users.firstname,
      lastname: schema.users.lastname,
      address: schema.users.address,
      country: schema.users.country,
      city: schema.users.city,
      phonenumber: schema.users.phonenumber,
      gender: schema.users.gender,
      citizenship: schema.users.citizenship,
      createdAt: schema.users.createdAt
    }).from(schema.users);
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting users" });
  }
};

// Get User By ID
export const GetByID = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await db.select({
      id: schema.users.id,
      username: schema.users.username,
      email: schema.users.email,
      firstname: schema.users.firstname,
      lastname: schema.users.lastname,
      address: schema.users.address,
      country: schema.users.country,
      city: schema.users.city,
      phonenumber: schema.users.phonenumber,
      gender: schema.users.gender,
      citizenship: schema.users.citizenship,
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

// Edit User By ID
export const EditById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, email, password, firstname, lastname, address, country, city, phonenumber, gender, citizenship } = req.body as UserProps;

  try {
    const updateData: Partial<typeof schema.users.$inferInsert> = {};

    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) updateData.hashedPassword = await bcrypt.hash(password, 10);
    if (firstname) updateData.firstname = firstname;
    if (lastname) updateData.lastname = lastname;
    if (address) updateData.address = address;
    if (country) updateData.country = country;
    if (city) updateData.city = city;
    if (phonenumber) updateData.phonenumber = phonenumber;
    if (gender) updateData.gender = gender;
    if (citizenship) updateData.citizenship = citizenship;

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

// Delete User By ID
export const DeleteById = async (req: Request, res: Response) => {
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