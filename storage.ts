import { users, comments, reactions, nftMoments, type User, type InsertUser, type Comment, type InsertComment, type Reaction, type InsertReaction, type NFTMoment, type InsertNFTMoment } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getComments(): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  getReactions(): Promise<Reaction[]>;
  createReaction(reaction: InsertReaction): Promise<Reaction>;
  
  getNFTMoments(): Promise<NFTMoment[]>;
  createNFTMoment(moment: InsertNFTMoment): Promise<NFTMoment>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private comments: Map<number, Comment>;
  private reactions: Map<number, Reaction>;
  private nftMoments: Map<number, NFTMoment>;
  private currentId: number;
  private commentId: number;
  private reactionId: number;
  private momentId: number;

  constructor() {
    this.users = new Map();
    this.comments = new Map();
    this.reactions = new Map();
    this.nftMoments = new Map();
    this.currentId = 1;
    this.commentId = 1;
    this.reactionId = 1;
    this.momentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getComments(): Promise<Comment[]> {
    return Array.from(this.comments.values()).sort((a, b) => 
      new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
    );
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.commentId++;
    const comment: Comment = { 
      ...insertComment, 
      id, 
      timestamp: new Date() 
    };
    this.comments.set(id, comment);
    return comment;
  }

  async getReactions(): Promise<Reaction[]> {
    return Array.from(this.reactions.values()).sort((a, b) => 
      new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
    );
  }

  async createReaction(insertReaction: InsertReaction): Promise<Reaction> {
    const id = this.reactionId++;
    const reaction: Reaction = { 
      ...insertReaction, 
      id, 
      timestamp: new Date() 
    };
    this.reactions.set(id, reaction);
    return reaction;
  }

  async getNFTMoments(): Promise<NFTMoment[]> {
    return Array.from(this.nftMoments.values()).sort((a, b) => 
      new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
    );
  }

  async createNFTMoment(insertMoment: InsertNFTMoment): Promise<NFTMoment> {
    const id = this.momentId++;
    const moment: NFTMoment = { 
      ...insertMoment, 
      id, 
      timestamp: new Date() 
    };
    this.nftMoments.set(id, moment);
    return moment;
  }
}

export const storage = new MemStorage();
