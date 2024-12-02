'use client';

import { useState, useEffect } from 'react';
import { BrowserVectorStore } from '../../lib/vectorStore';
import { Upload, Search, Trash2, Database, Layers } from 'lucide-react';

export default function VectorStoreApp() {
  const [vectorStore, setVectorStore] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Array<{ text: string; score: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [documentCount, setDocumentCount] = useState(0);

  useEffect(() => {
    const initVectorStore = async () => {
      const store = await BrowserVectorStore.getInstance();
      setVectorStore(store);
      
      // Get initial document count
      const documents = await store.getAllDocuments();
      setDocumentCount(documents.length);
    };
    initVectorStore();
  }, []);

  const handleAddDocument = async () => {
    if (!vectorStore || !inputText.trim()) return;
    
    setIsLoading(true);
    try {
      await vectorStore.addDocument(inputText);
      setInputText('');
      
      // Update document count
      const documents = await vectorStore.getAllDocuments();
      setDocumentCount(documents.length);
    } catch (error) {
      console.error('Error adding document:', error);
    }
    setIsLoading(false);
  };

  const handleSearch = async () => {
    if (!vectorStore || !searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const searchResults = await vectorStore.similaritySearch(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('Error searching:', error);
    }
    setIsLoading(false);
  };

  const handleClear = async () => {
    if (!vectorStore) return;
    
    setIsLoading(true);
    try {
      await vectorStore.clearStore();
      setResults([]);
      setDocumentCount(0);
    } catch (error) {
      console.error('Error clearing store:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-modern">
        <h1 className="text-3xl font-bold mb-4 text-neutral-900 flex items-center">
          <Layers className="w-8 h-8 mr-3 text-purple-600 animate-subtle-bounce" />
          Local Vector Database
        </h1>
        <p className="text-neutral-700 mb-4 max-w-2xl">
          Create, store, and search through your documents using a fully client-side vector database. 
          All processing happens directly in your browser, ensuring privacy and offline functionality.
        </p>
        <div className="flex items-center space-x-4 text-neutral-700">
          <div className="flex items-center space-x-2 bg-purple-100 px-3 py-1 rounded-full">
            <Database className="w-5 h-5 text-purple-600" />
            <span className="font-medium">Documents: {documentCount}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-modern-lg border border-neutral-100 p-6">
          <h2 className="text-2xl font-semibold mb-4 text-neutral-900 flex items-center">
            <Upload className="w-6 h-6 mr-2 text-purple-600" />
            Add Document
          </h2>
          <div className="space-y-4">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-y min-h-[120px]"
              placeholder="Enter text to add to the vector store..."
            />
            <button
              onClick={handleAddDocument}
              disabled={isLoading || !inputText.trim()}
              className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2 group"
            >
              <Upload className="w-5 h-5 group-hover:animate-bounce" />
              <span>Add Document</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-modern-lg border border-neutral-100 p-6">
          <h2 className="text-2xl font-semibold mb-4 text-neutral-900 flex items-center">
            <Search className="w-6 h-6 mr-2 text-purple-600" />
            Search Documents
          </h2>
          <div className="space-y-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              placeholder="Enter search query..."
            />
            <div className="flex space-x-4">
              <button
                onClick={handleSearch}
                disabled={isLoading || !searchQuery.trim()}
                className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2 group"
              >
                <Search className="w-5 h-5 group-hover:animate-pulse" />
                <span>Search</span>
              </button>
              <button
                onClick={handleClear}
                disabled={isLoading}
                className="py-3 px-4 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 disabled:opacity-50 transition-colors flex items-center"
              >
                <Trash2 className="w-5 h-5 text-neutral-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {results.length > 0 && (
        <div className="bg-white rounded-2xl shadow-modern-lg border border-neutral-100 p-6">
          <h2 className="text-2xl font-semibold mb-4 text-neutral-900 flex items-center">
            <Search className="w-6 h-6 mr-2 text-purple-600" />
            Search Results
          </h2>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div 
                key={index} 
                className="p-4 bg-purple-50 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors"
              >
                <div className="font-medium text-neutral-800 mb-2">{result.text}</div>
                <div className="text-sm text-neutral-600">
                  Similarity: 
                  <span className="ml-2 text-purple-600 font-semibold">
                    {(result.score * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
