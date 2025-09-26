import { sqliteTable, AnySQLiteColumn, foreignKey, integer, text, uniqueIndex } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

export const comments = sqliteTable("comments", {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer("user_id").notNull().references(() => users.id),
	postId: integer("post_id").notNull().references(() => posts.id),
	content: text().notNull(),
	createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const friends = sqliteTable("friends", {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId1: integer("user_id_1").notNull().references(() => users.id),
	userId2: integer("user_id_2").notNull().references(() => users.id),
	status: text().notNull(),
	createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const posts = sqliteTable("posts", {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer("user_id").notNull().references(() => users.id),
	content: text().notNull(),
	createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const users = sqliteTable("users", {
	id: integer('id').primaryKey({ autoIncrement: true }),
	username: text().notNull(),
	email: text().notNull(),
	createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`),
	hashedPassword: text(),
	firstname:text().notNull(),
	lastname:text().notNull(),
	address:text().notNull(),
	country:text().notNull(),
	city:text().notNull(),
	phonenumber:text().notNull(),
	gender:text().notNull(),
	citizenship:text().notNull(),
},
(table) => [
	uniqueIndex("users_email_unique").on(table.email),
	uniqueIndex("users_username_unique").on(table.username),
]);