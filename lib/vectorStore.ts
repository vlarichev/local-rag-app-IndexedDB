import { openDB, IDBPDatabase } from 'idb';

// Simplified embedding simulation for browser compatibility
function simpleEmbedding(text: string): number[] {
  // Very basic embedding simulation
  const hash = text.split('').reduce((acc, char) => {
    const code = char.charCodeAt(0);
    return ((acc << 5) - acc) + code;
  }, 0);
  
  // Convert hash to a fixed-length vector
  return Array.from({ length: 10 }, (_, i) => 
    ((hash >> (i * 3)) & 0xFF) / 255
  );
}

interface Document {
  id: string;
  text: string;
  embedding: number[];
  metadata?: any;
}

export class BrowserVectorStore {
  private db: IDBPDatabase | null = null;
  private static instance: BrowserVectorStore;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  static async getInstance(): Promise<BrowserVectorStore> {
    if (!BrowserVectorStore.instance) {
      BrowserVectorStore.instance = new BrowserVectorStore();
      await BrowserVectorStore.instance.initialize();
    }
    return BrowserVectorStore.instance;
  }

  private async initialize(): Promise<void> {
    // If initialization is already in progress, wait for it
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // Create a promise that resolves when initialization is complete
    this.initializationPromise = new Promise<void>(async (resolve, reject) => {
      try {
        // Ensure IndexedDB is available in the browser environment
        if (typeof window === 'undefined' || !window.indexedDB) {
          throw new Error('IndexedDB is not supported in this environment');
        }

        this.db = await openDB('vectorstore', 1, {
          upgrade(db) {
            if (!db.objectStoreNames.contains('documents')) {
              const store = db.createObjectStore('documents', { keyPath: 'id' });
              store.createIndex('embedding', 'embedding', { unique: false });
            }
          },
        });

        resolve();
      } catch (error) {
        console.error('Vector store initialization failed:', error);
        reject(error);
      }
    });

    return this.initializationPromise;
  }

  async addDocument(text: string, metadata?: any): Promise<string> {
    await this.ensureInitialized();

    const id = crypto.randomUUID();
    const embedding = simpleEmbedding(text);

    const document: Document = {
      id,
      text,
      embedding,
      metadata,
    };

    await this.db!.put('documents', document);
    return id;
  }

  async getAllDocuments(): Promise<Document[]> {
    await this.ensureInitialized();
    return await this.db!.getAll('documents');
  }

  async similaritySearch(query: string, topK: number = 5): Promise<Array<{ text: string; score: number; metadata?: any }>> {
    await this.ensureInitialized();

    const queryEmbedding = simpleEmbedding(query);
    const documents = await this.db!.getAll('documents');

    const results = documents.map(doc => ({
      text: doc.text,
      metadata: doc.metadata,
      score: this.cosineSimilarity(queryEmbedding, doc.embedding),
    }));

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  async clearStore(): Promise<void> {
    await this.ensureInitialized();
    await this.db!.clear('documents');
  }
}
