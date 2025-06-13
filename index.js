// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// server/storage.ts
var MemStorage = class {
  users;
  comments;
  reactions;
  nftMoments;
  currentId;
  commentId;
  reactionId;
  momentId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.comments = /* @__PURE__ */ new Map();
    this.reactions = /* @__PURE__ */ new Map();
    this.nftMoments = /* @__PURE__ */ new Map();
    this.currentId = 1;
    this.commentId = 1;
    this.reactionId = 1;
    this.momentId = 1;
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.currentId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async getComments() {
    return Array.from(this.comments.values()).sort(
      (a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
    );
  }
  async createComment(insertComment) {
    const id = this.commentId++;
    const comment = {
      ...insertComment,
      id,
      timestamp: /* @__PURE__ */ new Date()
    };
    this.comments.set(id, comment);
    return comment;
  }
  async getReactions() {
    return Array.from(this.reactions.values()).sort(
      (a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
    );
  }
  async createReaction(insertReaction) {
    const id = this.reactionId++;
    const reaction = {
      ...insertReaction,
      id,
      timestamp: /* @__PURE__ */ new Date()
    };
    this.reactions.set(id, reaction);
    return reaction;
  }
  async getNFTMoments() {
    return Array.from(this.nftMoments.values()).sort(
      (a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
    );
  }
  async createNFTMoment(insertMoment) {
    const id = this.momentId++;
    const moment = {
      ...insertMoment,
      id,
      timestamp: /* @__PURE__ */ new Date()
    };
    this.nftMoments.set(id, moment);
    return moment;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  message: text("message").notNull(),
  txHash: text("tx_hash").notNull(),
  timestamp: timestamp("timestamp").defaultNow()
});
var reactions = pgTable("reactions", {
  id: serial("id").primaryKey(),
  emojiType: text("emoji_type").notNull(),
  txHash: text("tx_hash").notNull(),
  timestamp: timestamp("timestamp").defaultNow()
});
var nftMoments = pgTable("nft_moments", {
  id: serial("id").primaryKey(),
  imageData: text("image_data").notNull(),
  txHash: text("tx_hash").notNull(),
  timestamp: timestamp("timestamp").defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  timestamp: true
});
var insertReactionSchema = createInsertSchema(reactions).omit({
  id: true,
  timestamp: true
});
var insertNFTMomentSchema = createInsertSchema(nftMoments).omit({
  id: true,
  timestamp: true
});

// server/routes.ts
async function registerRoutes(app2) {
  const httpServer = createServer(app2);
  app2.get("/api/comments", async (req, res) => {
    try {
      const comments2 = await storage.getComments();
      res.json(comments2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });
  app2.post("/api/comments", async (req, res) => {
    try {
      const comment = insertCommentSchema.parse(req.body);
      const createdComment = await storage.createComment(comment);
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
  app2.get("/api/reactions", async (req, res) => {
    try {
      const reactions2 = await storage.getReactions();
      res.json(reactions2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reactions" });
    }
  });
  app2.post("/api/reactions", async (req, res) => {
    try {
      const reaction = insertReactionSchema.parse(req.body);
      const createdReaction = await storage.createReaction(reaction);
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
  app2.get("/api/nft-moments", async (req, res) => {
    try {
      const moments = await storage.getNFTMoments();
      res.json(moments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch NFT moments" });
    }
  });
  app2.post("/api/nft-moments", async (req, res) => {
    try {
      const moment = insertNFTMomentSchema.parse(req.body);
      const createdMoment = await storage.createNFTMoment(moment);
      res.status(201).json(createdMoment);
    } catch (error) {
      res.status(400).json({ error: "Invalid NFT moment data" });
    }
  });
  app2.post("/api/switch-channel", (req, res) => {
    const { channel } = req.body;
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: "channelChanged",
          channel
        }));
      }
    });
    res.json({ success: true, channel });
  });
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  wss.on("connection", (ws) => {
    console.log("Client connected to WebSocket");
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === "join" && data.channel) {
          const interval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              const mockUsers = ["StreamFan", "GamerPro", "CryptoNinja", "BlockchainBuddy"];
              const mockMessages = [
                "Great stream! \u{1F525}",
                "Amazing play!",
                "Love the blockchain integration!",
                "This is epic! \u{1F48E}",
                "Future of streaming right here!"
              ];
              const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
              const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)];
              ws.send(JSON.stringify({
                type: "simulatedComment",
                comment: {
                  username: randomUser,
                  message: randomMessage,
                  timestamp: /* @__PURE__ */ new Date()
                }
              }));
            } else {
              clearInterval(interval);
            }
          }, 3e3 + Math.random() * 2e3);
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

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var vite_config_default = defineConfig({
  plugins: [react(), runtimeErrorOverlay()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      buffer: "buffer"
    }
  },
  root: path.resolve(__dirname, "./client"),
  define: {
    global: "globalThis"
  },
  optimizeDeps: {
    include: ["buffer"],
    exclude: ["lucide-react"]
  },
  server: {
    proxy: {
      "/api": "http://localhost:3000"
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "..", "dist");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    const indexPath = path2.resolve(distPath, "index.html");
    if (!fs.existsSync(indexPath)) {
      throw new Error(`Could not find index.html in ${distPath}`);
    }
    res.sendFile(indexPath);
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 3e3;
  const host = "127.0.0.1";
  server.listen(port, host, () => {
    log(`serving on http://${host}:${port}`);
  });
})();
