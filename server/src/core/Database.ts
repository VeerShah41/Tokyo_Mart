import { PrismaClient } from '@prisma/client';

// Use Turso (LibSQL) in production, plain SQLite in development
function createPrismaClient(): PrismaClient {
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    // Production: Turso cloud SQLite
    const { createClient } = require('@libsql/client');
    const { PrismaLibSQL } = require('@prisma/adapter-libsql');

    const libsql = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({ adapter } as any);
  }

  // Development: local SQLite file (DATABASE_URL=file:./dev.db)
  return new PrismaClient();
}

export class Database {
  private static instance: Database;
  private prismaClient: PrismaClient;

  // Private constructor ensures the class cannot be instantiated from outside
  private constructor() {
    this.prismaClient = createPrismaClient();
  }

  // Static method to control access to the singleton instance
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  // Public method to expose Prisma client
  public getClient(): PrismaClient {
    return this.prismaClient;
  }

  // Add DB specific operations if needed safely
  public async connect(): Promise<void> {
    await this.prismaClient.$connect();
    const dbType = process.env.TURSO_DATABASE_URL ? 'Turso (LibSQL cloud)' : 'SQLite (local file)';
    console.log(`✅ Connected to ${dbType} via Prisma (Singleton Instance)`);
  }
}

// Export the client instance directly for convenience, or the class
export const dbClient = Database.getInstance().getClient();
