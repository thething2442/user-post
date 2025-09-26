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

export async function simulateChatActivity(io: any) {
  // Get all user IDs to determine the number of messages
  const allUsers = await db.select({ id: users.id }).from(users);
  if (allUsers.length === 0) {
    console.warn('No users found to simulate chat activity.');
    return;
  }

  const numberOfUsers = allUsers.length;
  // Let's aim for each user to send/receive a few messages on average
  const numberOfMessages = numberOfUsers * 5; // For example, 5 messages per user

  // Default duration: 1 hour
  const durationHours = 1;
  const totalDurationMs = durationHours * 60 * 60 * 1000; // 1 hour in milliseconds

  // Calculate delay, ensuring it's not negative or zero if numberOfMessages is very high
  const delayBetweenMessagesMs = numberOfMessages > 0 ? totalDurationMs / numberOfMessages : 0;

  console.log(`Simulating ${numberOfMessages} chat messages involving ${numberOfUsers} users over ${durationHours} hour.`);
  console.log(`Delay between each message: ${delayBetweenMessagesMs / 1000} seconds.`);

  for (let i = 0; i < numberOfMessages; i++) {
    await generateAndSendChatMessage(io);
    console.log(`Message ${i + 1} of ${numberOfMessages} sent.`);
    if (i < numberOfMessages - 1 && delayBetweenMessagesMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenMessagesMs));
    }
  }
  console.log('Chat simulation complete.');
}
