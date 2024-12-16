import { openDB, IDBPDatabase } from 'idb';
import OpenAI from 'openai';
import * as HNSWLib from 'hnswlib';

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
    if (typeof window === 'undefined') return;

    try {
      this.db = await openDB('vectorstore', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('documents')) {
            db.createObjectStore('documents', { keyPath: 'id' });
          }
        },
      });

      // Load existing documents from IndexedDB
      const store = this.db.transaction('documents', 'readonly').objectStore('documents');
      this.documents = await store.getAll();
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  async getAllDocuments(): Promise<Document[]> {
    return this.documents;
  }

  async clearDocuments(): Promise<void> {
    if (!this.db) return;

    try {
      const tx = this.db.transaction('documents', 'readwrite');
      await tx.objectStore('documents').clear();
      this.documents = [];
    } catch (error) {
      console.error('Error clearing documents:', error);
      throw error;
    }
  }

  async addDocument(text: string, metadata?: any): Promise<string> {
    if (!this.openai) throw new Error('OpenAI client not initialized');

    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text,
      });

      const id = crypto.randomUUID();
      const document: Document = {
        id,
        text,
        embedding: response.data[0].embedding,
        metadata,
      };

      // Save to IndexedDB
      if (this.db) {
        const tx = this.db.transaction('documents', 'readwrite');
        await tx.objectStore('documents').add(document);
      }

      this.documents.push(document);
      return id;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  }

  async addDocuments(text: string, metadata?: any): Promise<string[]> {
    // Split the text by XXXX and trim each segment
    const documents = text
      .split(/\s*XXXX\s*/)
      .map(doc => doc.trim())
      .filter(doc => doc.length > 0);
    
    console.log(`Found ${documents.length} documents to process`);
    
    const documentIds: string[] = [];
    
    // Process documents sequentially
    for (let i = 0; i < documents.length; i++) {
      try {
        console.log(`Processing document ${i + 1}/${documents.length}`);
        console.log(`Document preview: ${documents[i].substring(0, 50)}...`);
        
        const id = await this.addDocument(documents[i], metadata);
        documentIds.push(id);
        
        console.log(`Successfully added document ${i + 1} with ID: ${id}`);
      } catch (error) {
        console.error(`Error adding document ${i + 1}:`, error);
        throw error;
      }
    }

    console.log(`Successfully added ${documentIds.length} documents`);
    return documentIds;
  }

  async similaritySearch(query: string, topK: number = 5): Promise<Array<{ text: string; score: number; metadata?: any }>> {
    if (!this.openai) throw new Error('OpenAI client not initialized');

    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: query,
      });

      const queryEmbedding = response.data[0].embedding;

      // Calculate cosine similarity between query and all documents
      const results = this.documents.map(doc => ({
        text: doc.text,
        metadata: doc.metadata,
        score: this.cosineSimilarity(queryEmbedding, doc.embedding)
      }));

      // Sort by similarity score and return top K results
      return results
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
    } catch (error) {
      console.error('Error performing similarity search:', error);
      throw error;
    }
  }

  async testApiKey(): Promise<boolean> {
    if (!this.openai) throw new Error('OpenAI client not initialized');

    try {
      // Try to create an embedding with a simple test string
      await this.openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: "test",
      });
      return true;
    } catch (error: any) {
      if (error?.response?.status === 401) {
        throw new Error('Invalid API key');
      }
      throw error;
    }
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}
