import { PrismaClient } from '@prisma/client';

export class Database {
  private static instance: Database;
  private prismaClient: PrismaClient;

  private constructor() {
    this.prismaClient = new PrismaClient();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public getClient(): PrismaClient {
    return this.prismaClient;
  }

  public async connect(): Promise<void> {
    await this.prismaClient.$connect();
    console.log('✅ Connected to SQLite via Prisma');
  }
}

export const dbClient = Database.getInstance().getClient();

