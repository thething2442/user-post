import { faker } from '@faker-js/faker';
import db from '../dbconfiguration/db.connect.configuration.controller';
import * as schema from '../drizzle/schema';
export const seedPosts = async (count: number) => {
  console.log(`Seeding ${count} posts...`);
  try {
    // Fetch all existing user IDs
    const users = await db.select({ id: schema.users.id }).from(schema.users);

    if (users.length === 0) {
      console.warn('No users found to link posts to. Please generate some users first.');
      return;
    }

    const postsToInsert = [];
    for (let i = 0; i < count; i++) {
      const randomUser = faker.helpers.arrayElement(users);
      const content = faker.lorem.sentence(); // Generate a sentence

      postsToInsert.push({
        userId: randomUser.id,
        content: content,
      });
    }

    if (postsToInsert.length > 0) {
      await db.insert(schema.posts).values(postsToInsert);
      console.log('Post seeding complete!');
    } else {
      console.log('No posts to insert.');
    }
  } catch (error) {
    console.error('Error seeding posts:', error);
  }
};