import { type User, type InsertUser, type Profile, type InsertProfile, type Transaction, type InsertTransaction, type LedgerEntry, type Settlement, type AuditLog, type InsertAuditLog } from "@shared/schema";
import { randomUUID } from "crypto";

// Comprehensive storage interface for the Bookie Inventory Management System
export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

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
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      isActive: true,
      lastLogin: null,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
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
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.profiles.set(id, profile);
    return profile;
  }

  async updateProfile(id: string, profileData: Partial<InsertProfile>): Promise<Profile> {
    const profile = this.profiles.get(id);
    if (!profile) throw new Error("Profile not found");
    
    const updatedProfile = { ...profile, ...profileData, updatedAt: new Date() };
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
    
    const updatedTransaction = { ...transaction, ...transactionData, updatedAt: new Date() };
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
      createdAt: new Date()
    };
    this.auditLogs.set(id, log);
    return log;
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getAuditLogsByUser(userId: string): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values()).filter(l => l.userId === userId);
  }

  async getAuditLogsByDateRange(startDate: Date, endDate: Date): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values()).filter(l => 
      l.createdAt >= startDate && l.createdAt <= endDate
    );
  }
}

export const storage = new MemStorage();
