import { PrismaClient } from '@prisma/client';

export class Database {
  private static instance: Database;
  private prismaClient: PrismaClient;

  // Private constructor ensures the class cannot be instantiated from outside
  private constructor() {
    this.prismaClient = new PrismaClient();
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
    console.log('✅ Connected to SQLite database via Prisma (Singleton Instance)');
  }
}

// Export the client instance directly for convenience, or the class
export const dbClient = Database.getInstance().getClient();
