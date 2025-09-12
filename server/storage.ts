import { type User, type UserPublic, type InsertUser, type Profile, type InsertProfile, type Transaction, type InsertTransaction, type LedgerEntry, type Settlement, type AuditLog, type InsertAuditLog } from "@shared/schema";
import { randomUUID } from "crypto";
import * as bcrypt from "bcrypt";

// Comprehensive storage interface for the Bookie Inventory Management System
export interface IStorage {
  // User management
  getUser(id: string): Promise<UserPublic | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>; // Keep internal for auth
  createUser(user: InsertUser): Promise<UserPublic>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<UserPublic>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<UserPublic[]>;

  // Profile management
  getProfile(id: string): Promise<Profile | undefined>;
  getAllProfiles(): Promise<Profile[]>;
  getProfilesByType(type: "uplink" | "downline"): Promise<Profile[]>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: string, profile: Partial<InsertProfile>): Promise<Profile>;
  deleteProfile(id: string): Promise<boolean>;

  // Transaction management
  getTransaction(id: string): Promise<Transaction | undefined>;
  getAllTransactions(): Promise<Transaction[]>;
  getTransactionsByProfile(profileId: string): Promise<Transaction[]>;
  getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction>;
  deleteTransaction(id: string): Promise<boolean>;

  // Ledger management
  getLedgerEntry(id: string): Promise<LedgerEntry | undefined>;
  getAllLedgerEntries(): Promise<LedgerEntry[]>;
  getLedgerEntriesByPeriod(period: string): Promise<LedgerEntry[]>;
  createLedgerEntry(entry: LedgerEntry): Promise<LedgerEntry>;
  updateLedgerEntry(id: string, entry: Partial<LedgerEntry>): Promise<LedgerEntry>;

  // Settlement management
  getSettlement(id: string): Promise<Settlement | undefined>;
  getAllSettlements(): Promise<Settlement[]>;
  getSettlementsByProfile(profileId: string): Promise<Settlement[]>;
  createSettlement(settlement: Settlement): Promise<Settlement>;
  updateSettlement(id: string, settlement: Partial<Settlement>): Promise<Settlement>;

  // Audit log management
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(): Promise<AuditLog[]>;
  getAuditLogsByUser(userId: string): Promise<AuditLog[]>;
  getAuditLogsByDateRange(startDate: Date, endDate: Date): Promise<AuditLog[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private profiles: Map<string, Profile>;
  private transactions: Map<string, Transaction>;
  private ledgerEntries: Map<string, LedgerEntry>;
  private settlements: Map<string, Settlement>;
  private auditLogs: Map<string, AuditLog>;

  constructor() {
    this.users = new Map();
    this.profiles = new Map();
    this.transactions = new Map();
    this.ledgerEntries = new Map();
    this.settlements = new Map();
    this.auditLogs = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
    this.initializeSampleTransactions();
  }

  // Helper method to convert User to UserPublic (remove password)
  private toUserPublic(user: User): UserPublic {
    const { password, ...userPublic } = user;
    return userPublic;
  }

  // Helper method to hash password
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  private initializeSampleData() {
    // Create sample profiles for testing
    const sampleProfiles: Profile[] = [
      {
        id: "uplink-1",
        type: "uplink",
        name: "Super Exchange",
        phone: "+919876543210",
        email: "contact@superexchange.com",
        ratePerPoint: "1.50",
        commissionPercentage: null,
        notes: "Primary uplink partner",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "uplink-2",
        type: "uplink",
        name: "Premium Exchange",
        phone: "+919876543211",
        email: "info@premiumexchange.com",
        ratePerPoint: "1.45",
        commissionPercentage: null,
        notes: "Secondary uplink partner",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "downline-1",
        type: "downline",
        name: "Agent Kumar",
        phone: "+919876543212",
        email: "kumar@agents.com",
        ratePerPoint: "1.65",
        commissionPercentage: "5.0",
        notes: "Top performing agent",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "downline-2",
        type: "downline",
        name: "Agent Sharma",
        phone: "+919876543213",
        email: "sharma@agents.com",
        ratePerPoint: "1.70",
        commissionPercentage: "8.0",
        notes: "Reliable downline agent",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Add sample profiles to storage
    sampleProfiles.forEach(profile => {
      this.profiles.set(profile.id, profile);
    });
  }

  private initializeSampleTransactions() {
    const now = new Date();
    
    // Sample uplink transaction
    const uplinkTransaction: Transaction = {
      id: randomUUID(),
      date: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Yesterday
      type: "taken",
      profileId: "uplink-1",
      points: 1000,
      ratePerPoint: "1.50",
      commissionPercentage: null,
      totalAmount: "1500.00",
      notes: "Sample uplink transaction",
      createdAt: now,
      updatedAt: now
    };
    
    // Sample downline transaction 1
    const downlineTransaction1: Transaction = {
      id: randomUUID(),
      date: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Yesterday
      type: "given", 
      profileId: "downline-1",
      points: 800,
      ratePerPoint: "1.65",
      commissionPercentage: "5.0",
      totalAmount: "1320.00",
      notes: "Sample downline transaction",
      createdAt: now,
      updatedAt: now
    };
    
    // Sample downline transaction 2
    const downlineTransaction2: Transaction = {
      id: randomUUID(),
      date: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Yesterday
      type: "given",
      profileId: "downline-2", 
      points: 500,
      ratePerPoint: "1.70",
      commissionPercentage: "8.0",
      totalAmount: "850.00",
      notes: "Sample downline transaction 2",
      createdAt: now,
      updatedAt: now
    };
    
    this.transactions.set(uplinkTransaction.id, uplinkTransaction);
    this.transactions.set(downlineTransaction1.id, downlineTransaction1);
    this.transactions.set(downlineTransaction2.id, downlineTransaction2);
  }

  // User methods
  async getUser(id: string): Promise<UserPublic | undefined> {
    const user = this.users.get(id);
    return user ? this.toUserPublic(user) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<UserPublic> {
    const id = randomUUID();
    const hashedPassword = await this.hashPassword(insertUser.password);
    const user: User = { 
      ...insertUser,
      password: hashedPassword,
      id, 
      isActive: true,
      lastLogin: null,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return this.toUserPublic(user);
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<UserPublic> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    // Hash password if it's being updated
    let updatedData = { ...userData };
    if (userData.password) {
      updatedData.password = await this.hashPassword(userData.password);
    }
    
    const updatedUser = { ...user, ...updatedData };
    this.users.set(id, updatedUser);
    return this.toUserPublic(updatedUser);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(): Promise<UserPublic[]> {
    return Array.from(this.users.values()).map(user => this.toUserPublic(user));
  }

  // Profile methods
  async getProfile(id: string): Promise<Profile | undefined> {
    return this.profiles.get(id);
  }

  async getAllProfiles(): Promise<Profile[]> {
    return Array.from(this.profiles.values());
  }

  async getProfilesByType(type: "uplink" | "downline"): Promise<Profile[]> {
    return Array.from(this.profiles.values()).filter(p => p.type === type);
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const id = randomUUID();
    const profile: Profile = { 
      ...insertProfile, 
      id,
      isActive: true,
      email: insertProfile.email || null,
      notes: insertProfile.notes || null,
      ratePerPoint: insertProfile.ratePerPoint.toString(),
      commissionPercentage: insertProfile.commissionPercentage ? insertProfile.commissionPercentage.toString() : null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.profiles.set(id, profile);
    return profile;
  }

  async updateProfile(id: string, profileData: Partial<InsertProfile>): Promise<Profile> {
    const profile = this.profiles.get(id);
    if (!profile) throw new Error("Profile not found");
    
    // Convert numeric fields to strings and handle null/undefined properly
    const convertedData: Partial<Profile> = {};
    
    // Copy all properties except the ones we need to convert
    Object.keys(profileData).forEach(key => {
      if (key !== 'ratePerPoint' && key !== 'commissionPercentage' && key !== 'email') {
        (convertedData as any)[key] = (profileData as any)[key];
      }
    });
    if (profileData.ratePerPoint !== undefined) {
      convertedData.ratePerPoint = profileData.ratePerPoint.toString();
    }
    if (profileData.commissionPercentage !== undefined) {
      convertedData.commissionPercentage = profileData.commissionPercentage ? profileData.commissionPercentage.toString() : null;
    }
    if (profileData.email !== undefined) {
      convertedData.email = profileData.email || null;
    }
    
    const updatedProfile = { ...profile, ...convertedData, updatedAt: new Date() };
    this.profiles.set(id, updatedProfile);
    return updatedProfile;
  }

  async deleteProfile(id: string): Promise<boolean> {
    return this.profiles.delete(id);
  }

  // Transaction methods
  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async getTransactionsByProfile(profileId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(t => t.profileId === profileId);
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(t => 
      t.date >= startDate && t.date <= endDate
    );
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    
    // Calculate total amount
    const points = Number(insertTransaction.points);
    const rate = Number(insertTransaction.ratePerPoint);
    const commission = insertTransaction.commissionPercentage ? Number(insertTransaction.commissionPercentage) : 0;
    
    let totalAmount = points * rate;
    if (insertTransaction.type === "given" && commission > 0) {
      totalAmount = totalAmount * (1 + commission / 100);
    }
    
    const transaction: Transaction = { 
      ...insertTransaction,
      id,
      notes: insertTransaction.notes || null,
      ratePerPoint: insertTransaction.ratePerPoint.toString(),
      commissionPercentage: insertTransaction.commissionPercentage ? insertTransaction.commissionPercentage.toString() : null,
      totalAmount: totalAmount.toFixed(2),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: string, transactionData: Partial<InsertTransaction>): Promise<Transaction> {
    const transaction = this.transactions.get(id);
    if (!transaction) throw new Error("Transaction not found");
    
    // Convert numeric fields to strings and handle null/undefined properly
    const convertedData: Partial<Transaction> = {};
    
    // Copy all properties except the ones we need to convert
    Object.keys(transactionData).forEach(key => {
      if (key !== 'ratePerPoint' && key !== 'commissionPercentage') {
        (convertedData as any)[key] = (transactionData as any)[key];
      }
    });
    
    if (transactionData.ratePerPoint !== undefined) {
      convertedData.ratePerPoint = transactionData.ratePerPoint.toString();
    }
    if (transactionData.commissionPercentage !== undefined) {
      convertedData.commissionPercentage = transactionData.commissionPercentage ? transactionData.commissionPercentage.toString() : null;
    }
    
    const updatedTransaction = { ...transaction, ...convertedData, updatedAt: new Date() };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    return this.transactions.delete(id);
  }

  // Ledger methods
  async getLedgerEntry(id: string): Promise<LedgerEntry | undefined> {
    return this.ledgerEntries.get(id);
  }

  async getAllLedgerEntries(): Promise<LedgerEntry[]> {
    return Array.from(this.ledgerEntries.values());
  }

  async getLedgerEntriesByPeriod(period: string): Promise<LedgerEntry[]> {
    return Array.from(this.ledgerEntries.values()).filter(e => e.period === period);
  }

  async createLedgerEntry(entry: LedgerEntry): Promise<LedgerEntry> {
    this.ledgerEntries.set(entry.id, entry);
    return entry;
  }

  async updateLedgerEntry(id: string, entryData: Partial<LedgerEntry>): Promise<LedgerEntry> {
    const entry = this.ledgerEntries.get(id);
    if (!entry) throw new Error("Ledger entry not found");
    
    const updatedEntry = { ...entry, ...entryData };
    this.ledgerEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteLedgerEntry(id: string): Promise<boolean> {
    return this.ledgerEntries.delete(id);
  }

  // Settlement methods
  async getSettlement(id: string): Promise<Settlement | undefined> {
    return this.settlements.get(id);
  }

  async getAllSettlements(): Promise<Settlement[]> {
    return Array.from(this.settlements.values());
  }

  async getSettlementsByProfile(profileId: string): Promise<Settlement[]> {
    return Array.from(this.settlements.values()).filter(s => s.profileId === profileId);
  }

  async createSettlement(settlement: Settlement): Promise<Settlement> {
    this.settlements.set(settlement.id, settlement);
    return settlement;
  }

  async updateSettlement(id: string, settlementData: Partial<Settlement>): Promise<Settlement> {
    const settlement = this.settlements.get(id);
    if (!settlement) throw new Error("Settlement not found");
    
    const updatedSettlement = { ...settlement, ...settlementData };
    this.settlements.set(id, updatedSettlement);
    return updatedSettlement;
  }

  // Audit log methods
  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const id = randomUUID();
    const log: AuditLog = { 
      ...insertLog, 
      id,
      resourceId: insertLog.resourceId || null,
      ipAddress: insertLog.ipAddress || null,
      createdAt: new Date()
    };
    this.auditLogs.set(id, log);
    return log;
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values()).sort((a, b) => {
      const aTime = a.createdAt?.getTime() || 0;
      const bTime = b.createdAt?.getTime() || 0;
      return bTime - aTime;
    });
  }

  async getAuditLogsByUser(userId: string): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values()).filter(l => l.userId === userId);
  }

  async getAuditLogsByDateRange(startDate: Date, endDate: Date): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values()).filter(l => 
      l.createdAt && l.createdAt >= startDate && l.createdAt <= endDate
    );
  }
}

export const storage = new MemStorage();
