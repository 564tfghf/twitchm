import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  message: text("message").notNull(),
  txHash: text("tx_hash").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const reactions = pgTable("reactions", {
  id: serial("id").primaryKey(),
  emojiType: text("emoji_type").notNull(),
  txHash: text("tx_hash").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const nftMoments = pgTable("nft_moments", {
  id: serial("id").primaryKey(),
  imageData: text("image_data").notNull(),
  txHash: text("tx_hash").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  timestamp: true,
});

export const insertReactionSchema = createInsertSchema(reactions).omit({
  id: true,
  timestamp: true,
});

export const insertNFTMomentSchema = createInsertSchema(nftMoments).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertReaction = z.infer<typeof insertReactionSchema>;
export type Reaction = typeof reactions.$inferSelect;
export type InsertNFTMoment = z.infer<typeof insertNFTMomentSchema>;
export type NFTMoment = typeof nftMoments.$inferSelect;
