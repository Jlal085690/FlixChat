import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles
export enum UserRole {
  USER = "user",
  MODERATOR = "moderator",
  ADMIN = "admin",
  OWNER = "owner",
}

// User status
export enum UserStatus {
  ONLINE = "online",
  OFFLINE = "offline",
  AWAY = "away",
}

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  coverUrl: text("cover_url"),
  role: text("role").notNull().default(UserRole.USER),
  status: text("status").notNull().default(UserStatus.OFFLINE),
  isGuest: boolean("is_guest").notNull().default(false),
});

// Chat model
export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "private" or "group"
  name: text("name"), // For group chats
  avatarUrl: text("avatar_url"), // For group chats
  createdBy: integer("created_by").notNull(), // User ID who created this chat
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Chat participants model (for both private and group chats)
export const chatParticipants = pgTable("chat_participants", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").notNull(),
  userId: integer("user_id").notNull(),
  role: text("role").notNull().default(UserRole.USER), // Only relevant for group chats
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

// Message model
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").notNull(),
  senderId: integer("sender_id").notNull(),
  content: text("content").notNull(),
  attachmentUrl: text("attachment_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isDeleted: boolean("is_deleted").notNull().default(false),
});

// Story model
export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content"),
  mediaUrl: text("media_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(), // Set to 24 hours after creation by default
});

// Story views
export const storyViews = pgTable("story_views", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").notNull(),
  viewerId: integer("viewer_id").notNull(),
  viewedAt: timestamp("viewed_at").notNull().defaultNow(),
});

// Call logs
export const calls = pgTable("calls", {
  id: serial("id").primaryKey(),
  callerId: integer("caller_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  chatId: integer("chat_id"), // Optional, linked to a group chat for group calls
  type: text("type").notNull(), // "audio" or "video"
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  status: text("status").notNull(), // "missed", "answered", "declined"
});

// Insert schemas using drizzle-zod
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertChatSchema = createInsertSchema(chats).omit({
  id: true,
  createdAt: true,
});

export const insertChatParticipantSchema = createInsertSchema(chatParticipants).omit({
  id: true,
  joinedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isDeleted: true,
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  createdAt: true,
});

export const insertStoryViewSchema = createInsertSchema(storyViews).omit({
  id: true,
  viewedAt: true,
});

export const insertCallSchema = createInsertSchema(calls).omit({
  id: true,
  endTime: true,
});

// Login schema (for form validation)
export const loginSchema = z.object({
  username: z.string().min(3, { message: "اسم المستخدم يجب أن يكون 3 أحرف على الأقل" }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
});

// Register schema (for form validation)
export const registerSchema = z.object({
  username: z.string().min(3, { message: "اسم المستخدم يجب أن يكون 3 أحرف على الأقل" }),
  password: z
    .string()
    .min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
  confirmPassword: z.string(),
  fullName: z.string().min(2, { message: "الاسم الكامل مطلوب" }),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Chat = typeof chats.$inferSelect;
export type InsertChat = z.infer<typeof insertChatSchema>;
export type ChatParticipant = typeof chatParticipants.$inferSelect;
export type InsertChatParticipant = z.infer<typeof insertChatParticipantSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Story = typeof stories.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;
export type StoryView = typeof storyViews.$inferSelect;
export type InsertStoryView = z.infer<typeof insertStoryViewSchema>;
export type Call = typeof calls.$inferSelect;
export type InsertCall = z.infer<typeof insertCallSchema>;
export type Login = z.infer<typeof loginSchema>;
export type Register = z.infer<typeof registerSchema>;

// WebSocket message types
export enum WebSocketMessageType {
  NEW_MESSAGE = "new_message",
  MESSAGE_READ = "message_read",
  USER_STATUS = "user_status",
  NEW_STORY = "new_story",
  STORY_VIEWED = "story_viewed",
  CALL_INITIATED = "call_initiated",
  CALL_ANSWERED = "call_answered",
  CALL_DECLINED = "call_declined",
  CALL_ENDED = "call_ended",
}

export type WebSocketMessage<T = any> = {
  type: WebSocketMessageType;
  payload: T;
};
