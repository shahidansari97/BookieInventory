import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProfileSchema, insertTransactionSchema, insertUserSchema, insertSettlementSchema, insertAuditLogSchema, type UserPublic } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Profile routes
  app.get("/api/profiles", async (req, res) => {
    try {
      const profiles = await storage.getAllProfiles();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profiles" });
    }
  });

  app.get("/api/profiles/:id", async (req, res) => {
    try {
      const profile = await storage.getProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.post("/api/profiles", async (req, res) => {
    try {
      const profileData = insertProfileSchema.parse(req.body);
      const profile = await storage.createProfile(profileData);
      
      // Create audit log
      await storage.createAuditLog({
        userId: "system", // In a real app, get from session
        action: "CREATE",
        resource: "Profile",
        resourceId: profile.id,
        details: `Created profile: ${profile.name}`,
        ipAddress: req.ip,
      });

      res.status(201).json(profile);
    } catch (error) {
      console.error("Profile creation error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "Invalid profile data" });
      }
    }
  });

  app.put("/api/profiles/:id", async (req, res) => {
    try {
      const profileData = insertProfileSchema.partial().parse(req.body);
      const profile = await storage.updateProfile(req.params.id, profileData);
      
      // Create audit log
      await storage.createAuditLog({
        userId: "system", // In a real app, get from session
        action: "UPDATE",
        resource: "Profile",
        resourceId: profile.id,
        details: `Updated profile: ${profile.name}`,
        ipAddress: req.ip,
      });

      res.json(profile);
    } catch (error) {
      res.status(400).json({ error: "Failed to update profile" });
    }
  });

  app.delete("/api/profiles/:id", async (req, res) => {
    try {
      const success = await storage.deleteProfile(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Profile not found" });
      }
      
      // Create audit log
      await storage.createAuditLog({
        userId: "system", // In a real app, get from session
        action: "DELETE",
        resource: "Profile",
        resourceId: req.params.id,
        details: `Deleted profile: ${req.params.id}`,
        ipAddress: req.ip,
      });

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete profile" });
    }
  });

  // Transaction routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(transactionData);
      
      // Create audit log
      await storage.createAuditLog({
        userId: "system", // In a real app, get from session
        action: "CREATE",
        resource: "Transaction",
        resourceId: transaction.id,
        details: `Created transaction: ${transaction.type} - ${transaction.points} points`,
        ipAddress: req.ip,
      });

      res.status(201).json(transaction);
    } catch (error) {
      console.error("Transaction creation error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "Invalid transaction data" });
      }
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(req.params.id, transactionData);
      
      // Create audit log
      await storage.createAuditLog({
        userId: "system", // In a real app, get from session
        action: "UPDATE",
        resource: "Transaction",
        resourceId: transaction.id,
        details: `Updated transaction: ${transaction.type} - ${transaction.points} points`,
        ipAddress: req.ip,
      });

      res.json(transaction);
    } catch (error) {
      console.error("Transaction update error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "Failed to update transaction" });
      }
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const success = await storage.deleteTransaction(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      // Create audit log
      await storage.createAuditLog({
        userId: "system", // In a real app, get from session
        action: "DELETE",
        resource: "Transaction",
        resourceId: req.params.id,
        details: `Deleted transaction: ${req.params.id}`,
        ipAddress: req.ip,
      });

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete transaction" });
    }
  });

  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      
      // Create audit log
      await storage.createAuditLog({
        userId: "system", // In a real app, get from session
        action: "CREATE",
        resource: "User",
        resourceId: user.id,
        details: `Created user: ${user.username}`,
        ipAddress: req.ip,
      });

      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const userData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(req.params.id, userData);
      
      // Create audit log
      await storage.createAuditLog({
        userId: "system", // In a real app, get from session
        action: "UPDATE", 
        resource: "User",
        resourceId: user.id,
        details: `Updated user: ${user.username}`,
        ipAddress: req.ip,
      });

      res.json(user);
    } catch (error) {
      console.error("User update error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "Failed to update user" });
      }
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const success = await storage.deleteUser(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Create audit log
      await storage.createAuditLog({
        userId: "system", // In a real app, get from session
        action: "DELETE",
        resource: "User",
        resourceId: req.params.id,
        details: `Deleted user: ${req.params.id}`,
        ipAddress: req.ip,
      });

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Ledger routes
  app.get("/api/ledger", async (req, res) => {
    try {
      const ledgerEntries = await storage.getAllLedgerEntries();
      res.json(ledgerEntries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ledger entries" });
    }
  });

  app.post("/api/ledger/calculate", async (req, res) => {
    try {
      // In a real implementation, this would calculate balances based on transactions
      // For now, return success message
      
      // Create audit log
      await storage.createAuditLog({
        userId: "system", // In a real app, get from session
        action: "CALCULATE",
        resource: "Ledger",
        resourceId: null,
        details: "Triggered manual ledger calculation",
        ipAddress: req.ip,
      });

      res.json({ message: "Ledger calculation completed successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate ledger" });
    }
  });

  // Settlement routes
  app.get("/api/settlements", async (req, res) => {
    try {
      const settlements = await storage.getAllSettlements();
      res.json(settlements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settlements" });
    }
  });

  app.post("/api/settlements", async (req, res) => {
    try {
      const settlementData = insertSettlementSchema.parse(req.body);
      const settlement = await storage.createSettlement({
        ...settlementData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        sentAt: settlementData.status === "sent" ? new Date() : null,
      });
      
      // Create audit log
      await storage.createAuditLog({
        userId: "system", // In a real app, get from session
        action: "CREATE",
        resource: "Settlement",
        resourceId: settlement.id,
        details: `Created settlement for profile: ${settlement.profileId}`,
        ipAddress: req.ip,
      });

      res.status(201).json(settlement);
    } catch (error) {
      res.status(400).json({ error: "Invalid settlement data" });
    }
  });

  // Audit log routes
  app.get("/api/audit", async (req, res) => {
    try {
      const auditLogs = await storage.getAuditLogs();
      res.json(auditLogs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
