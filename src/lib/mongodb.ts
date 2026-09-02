import "server-only";
import { MongoClient, Db } from "mongodb";
import dns from "node:dns";
import { env } from "./env";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {}

declare global {
  // eslint-disable-next-line no-var
  var __jixu_mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | null = null;

export function isMongoConfigured(): boolean {
  const uri = env.MONGODB_URI();
  return Boolean(uri && uri.trim().length > 0);
}

export async function getMongoClient(): Promise<MongoClient | null> {
  const uri = env.MONGODB_URI();
  if (!uri || !uri.trim()) {
    return null;
  }

  if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so the MongoClient is preserved across module reloads caused by HMR
    if (!globalThis.__jixu_mongoClientPromise) {
      const client = new MongoClient(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      });
      globalThis.__jixu_mongoClientPromise = client.connect();
    }
    clientPromise = globalThis.__jixu_mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable, but we still cache clientPromise per container
    if (!clientPromise) {
      const client = new MongoClient(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      });
      clientPromise = client.connect();
    }
  }

  try {
    return await clientPromise;
  } catch (err) {
    console.error("[MongoDB] Connection error:", err);
    // Reset cache so future requests can retry connecting
    clientPromise = null;
    if (process.env.NODE_ENV === "development") {
      globalThis.__jixu_mongoClientPromise = undefined;
    }
    return null;
  }
}

export async function getMongoDb(dbName = "jixu_db"): Promise<Db | null> {
  const client = await getMongoClient();
  if (!client) return null;
  return client.db(dbName);
}
