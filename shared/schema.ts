import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'bookie' | 'assistant'
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'uplink' | 'downline'
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email"),
  ratePerPoint: decimal("rate_per_point", { precision: 10, scale: 2 }).notNull(),
  commissionPercentage: decimal("commission_percentage", { precision: 5, scale: 2 }),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'taken' | 'given'
  profileId: varchar("profile_id").notNull(),
  date: timestamp("date").notNull(),
  points: integer("points").notNull(),
  ratePerPoint: decimal("rate_per_point", { precision: 10, scale: 2 }).notNull(),
  commissionPercentage: decimal("commission_percentage", { precision: 5, scale: 2 }),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ledgerEntries = pgTable("ledger_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull(),
  period: text("period").notNull(), // e.g., "2024-01-08_2024-01-14"
  totalPoints: integer("total_points").notNull(),
  averageRate: decimal("average_rate", { precision: 10, scale: 2 }).notNull(),
  commission: decimal("commission", { precision: 12, scale: 2 }),
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull(), // 'pending' | 'settled'
  calculatedAt: timestamp("calculated_at").defaultNow(),
});

export const settlements = pgTable("settlements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull(),
  period: text("period").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  message: text("message").notNull(),
  status: text("status").notNull(), // 'sent' | 'pending' | 'failed'
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  action: text("action").notNull(), // 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'CALCULATE'
  resource: text("resource").notNull(), // 'Profile' | 'Transaction' | 'Ledger' | 'System'
  resourceId: varchar("resource_id"),
  details: text("details").notNull(),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
}).extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["bookie", "assistant"]),
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  type: z.enum(["uplink", "downline"]),
  name: z.string().min(3, "Name must be at least 3 characters"),
  phone: z.string().regex(/^\+\d{10,15}$/, "Invalid phone number format"),
  email: z.string().email().optional().or(z.literal("")),
  ratePerPoint: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
  commissionPercentage: z.union([z.string(), z.number()]).optional().transform(val => val ? (typeof val === 'string' ? parseFloat(val) : val) : undefined),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  totalAmount: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  type: z.enum(["taken", "given"]),
  profileId: z.string().min(1, "Profile is required"),
  date: z.string().transform(val => new Date(val)),
  points: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseInt(val) : val),
  ratePerPoint: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
  commissionPercentage: z.union([z.string(), z.number()]).optional().transform(val => val ? (typeof val === 'string' ? parseFloat(val) : val) : undefined),
});

export const insertSettlementSchema = createInsertSchema(settlements).omit({
  id: true,
  createdAt: true,
  sentAt: true,
}).extend({
  amount: z.string().transform(val => parseFloat(val)),
  status: z.enum(["sent", "pending", "failed"]),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
}).extend({
  action: z.enum(["CREATE", "UPDATE", "DELETE", "LOGIN", "CALCULATE"]),
});

// Types
export type User = typeof users.$inferSelect;
export type UserPublic = Omit<User, 'password'>;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type LedgerEntry = typeof ledgerEntries.$inferSelect;
export type InsertLedgerEntry = typeof ledgerEntries.$inferInsert;

export type Settlement = typeof settlements.$inferSelect;
export type InsertSettlement = z.infer<typeof insertSettlementSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
