import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertCommentSchema, insertReactionSchema, insertNFTMomentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // API Routes
  app.get("/api/comments", async (req, res) => {
    try {
      const comments = await storage.getComments();
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/comments", async (req, res) => {
    try {
      const comment = insertCommentSchema.parse(req.body);
      const createdComment = await storage.createComment(comment);
      
      // Broadcast to WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "newComment",
            comment: createdComment
          }));
        }
      });
      
      res.status(201).json(createdComment);
    } catch (error) {
      res.status(400).json({ error: "Invalid comment data" });
    }
  });

  app.get("/api/reactions", async (req, res) => {
    try {
      const reactions = await storage.getReactions();
      res.json(reactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reactions" });
    }
  });

  app.post("/api/reactions", async (req, res) => {
    try {
      const reaction = insertReactionSchema.parse(req.body);
      const createdReaction = await storage.createReaction(reaction);
      
      // Broadcast to WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "newReaction",
            reaction: createdReaction
          }));
        }
      });
      
      res.status(201).json(createdReaction);
    } catch (error) {
      res.status(400).json({ error: "Invalid reaction data" });
    }
  });

  app.get("/api/nft-moments", async (req, res) => {
    try {
      const moments = await storage.getNFTMoments();
      res.json(moments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch NFT moments" });
    }
  });

  app.post("/api/nft-moments", async (req, res) => {
    try {
      const moment = insertNFTMomentSchema.parse(req.body);
      const createdMoment = await storage.createNFTMoment(moment);
      res.status(201).json(createdMoment);
    } catch (error) {
      res.status(400).json({ error: "Invalid NFT moment data" });
    }
  });

  app.post("/api/switch-channel", (req, res) => {
    const { channel } = req.body;
    
    // Broadcast channel change to WebSocket clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: "channelChanged",
          channel: channel
        }));
      }
    });
    
    res.json({ success: true, channel });
  });

  // WebSocket Server
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    console.log("Client connected to WebSocket");

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === "join" && data.channel) {
          // Simulate periodic chat messages for the channel
          const interval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              const mockUsers = ["StreamFan", "GamerPro", "CryptoNinja", "BlockchainBuddy"];
              const mockMessages = [
                "Great stream! 🔥",
                "Amazing play!",
                "Love the blockchain integration!",
                "This is epic! 💎",
                "Future of streaming right here!"
              ];
              
              const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
              const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)];
              
              ws.send(JSON.stringify({
                type: "simulatedComment",
                comment: {
                  username: randomUser,
                  message: randomMessage,
                  timestamp: new Date()
                }
              }));
            } else {
              clearInterval(interval);
            }
          }, 3000 + Math.random() * 2000);

          ws.on("close", () => {
            clearInterval(interval);
          });
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected from WebSocket");
    });
  });

  return httpServer;
}
