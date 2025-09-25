import { faker } from '@faker-js/faker';
import db from '../dbconfiguration/db.connect.configuration.controller';
import * as schema from '../drizzle/schema';
import bcrypt from 'bcryptjs';

const createUser = async () => {
  const hashedPassword = await bcrypt.hash('password123', 10); // Generic password for all faked users
  return {
    username: faker.internet.username(),
    email: faker.internet.email(),
    hashedPassword,
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    address: faker.location.streetAddress(),
    country: faker.location.country(),
    city: faker.location.city(),
    phonenumber: faker.phone.number(),
    gender: faker.person.gender(),
    citizenship: faker.location.country(),
  };
};

export const seedUsers = async (count: number) => {
  console.log(`Seeding ${count} users...`);
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push(await createUser());
  }

  try {
    await db.insert(schema.users).values(users);
    console.log('Seeding complete!');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};