import { faker } from '@faker-js/faker';
import db from '../dbconfiguration/db.connect.configuration.controller';
import { users, chatMessages } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

export async function generateAndSendChatMessage(io: any) {
  try {
    // Get all user IDs
    const allUsers = await db.select({ id: users.id }).from(users);
    if (allUsers.length < 2) {
      console.warn('Not enough users to generate a chat message.');
      return;
    }

    // Randomly select sender and receiver
    const sender = faker.helpers.arrayElement(allUsers);
    let receiver = faker.helpers.arrayElement(allUsers);
    // Ensure sender and receiver are different
    while (receiver.id === sender.id) {
      receiver = faker.helpers.arrayElement(allUsers);
    }

    // Generate a 5-word message
    const messageContent = faker.lorem.words(5);

    const chatData = {
      senderId: sender.id,
      receiverId: receiver.id,
      message: messageContent,
    };

    // Save message to database
    await db.insert(chatMessages).values({
      senderId: chatData.senderId,
      receiverId: chatData.receiverId,
      message: chatData.message,
      createdAt: Math.floor(Date.now() / 1000), // Unix timestamp
    });

    // Emit message via Socket.IO
    io.emit('chat message', chatData);
    console.log(`Generated and sent chat: User ${chatData.senderId} to User ${chatData.receiverId}: "${chatData.message}"`);

  } catch (error) {
    console.error('Error generating and sending chat message:', error);
  }
}
