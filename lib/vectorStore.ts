import { openDB, IDBPDatabase } from 'idb';
import OpenAI from 'openai';

// Initialize OpenAI client with a function to ensure it's only created once
const createOpenAIClient = (apiKey: string) => {
  if (typeof window === 'undefined') return null;
  
  try {
    return new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
  } catch (error) {
    console.error('Error initializing OpenAI client:', error);
    return null;
  }
};

interface Document {
  id: string;
  text: string;
  embedding: number[];
  metadata?: any;
}

export class BrowserVectorStore {
  private static instance: BrowserVectorStore;
  private openai: OpenAI | null = null;
  private documents: Document[] = [];
  private db: IDBPDatabase | null = null;
  private apiKey: string;

  private constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.openai = createOpenAIClient(apiKey);
  }

  public static async getInstance(apiKey: string): Promise<BrowserVectorStore> {
    if (!apiKey?.trim()) {
      throw new Error('API key is required');
    }

    // Always create a new instance if the API key is different
    if (BrowserVectorStore.instance?.apiKey !== apiKey) {
      BrowserVectorStore.instance = new BrowserVectorStore(apiKey);
      await BrowserVectorStore.instance.initialize();
    }
    return BrowserVectorStore.instance;
  }

  private async initialize() {
    try {
      this.db = await openDB('vectorStore', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('documents')) {
            db.createObjectStore('documents', { keyPath: 'id' });
          }
        },
      });

      // Load documents from IndexedDB
      await this.loadDocuments();
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async loadDocuments() {
    if (!this.db) return;
    
    try {
      const documents = await this.db.getAll('documents');
      this.documents = documents;
    } catch (error) {
      console.error('Error loading documents:', error);
      throw error;
    }
  }

  public async addDocument(text: string): Promise<void> {
    if (!this.openai || !this.db) {
      throw new Error('Store not properly initialized');
    }

    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text,
      });

      const embedding = response.data[0].embedding;
      const document: Document = {
        id: Date.now().toString(),
        text,
        embedding,
      };

      // Save to IndexedDB
      await this.db.put('documents', document);
      
      // Update local cache
      this.documents.push(document);
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  }

  public async similaritySearch(query: string, k: number = 4): Promise<Array<{ text: string; score: number }>> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      const queryEmbedding = await this.getEmbedding(query);
      
      // Calculate cosine similarity with all documents
      const results = this.documents.map(doc => ({
        text: doc.text,
        score: this.cosineSimilarity(queryEmbedding, doc.embedding)
      }));

      // Sort by similarity score and return top k results
      return results
        .sort((a, b) => b.score - a.score)
        .slice(0, k);
    } catch (error) {
      console.error('Error in similarity search:', error);
      throw error;
    }
  }

  private async getEmbedding(text: string): Promise<number[]> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const response = await this.openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });

    return response.data[0].embedding;
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (normA * normB);
  }

  public async clearAllDocuments(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      await this.db.clear('documents');
      this.documents = [];
    } catch (error) {
      console.error('Error clearing documents:', error);
      throw error;
    }
  }

  public async getAllDocuments(): Promise<Document[]> {
    return this.documents;
  }

  public async testApiKey(): Promise<boolean> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      await this.getEmbedding('test');
      return true;
    } catch (error) {
      console.error('API key test failed:', error);
      throw error;
    }
  }
}
