'use client';

import { useState, useEffect } from 'react';
import { BrowserVectorStore } from '../../lib/vectorStore';
import { Upload, Search, Trash2, Database, Layers } from 'lucide-react';
import ProfileWidget from './ProfileWidget';
import ChatInterface from './ChatInterface';

export default function VectorStoreApp() {
  const [vectorStore, setVectorStore] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Array<{ text: string; score: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [documentCount, setDocumentCount] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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

  const handleClearAll = async () => {
    if (!vectorStore) return;
    
    setIsLoading(true);
    try {
      await vectorStore.clearStore();
      setResults([]);
      setDocumentCount(0);
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Error clearing store:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 shadow-modern">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-4 text-neutral-900 dark:text-white flex items-center">
              <Layers className="w-8 h-8 mr-3 text-purple-600 dark:text-purple-400 animate-subtle-bounce" />
              Local Vector Database
            </h1>
            <p className="text-neutral-700 dark:text-neutral-300 mb-4 max-w-2xl">
              Create, store, and search through your documents using a fully client-side vector database. 
              All processing happens directly in your browser, ensuring privacy and offline functionality.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">
                <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="font-medium text-neutral-700 dark:text-neutral-300">Documents: {documentCount}</span>
              </div>
              {documentCount > 0 && (
                <button
                  onClick={() => setShowConfirmDialog(true)}
                  className="flex items-center space-x-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="font-medium">Clear All</span>
                </button>
              )}
            </div>
          </div>
          <ProfileWidget />
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">Clear All Documents?</h3>
            <p className="text-neutral-600 dark:text-neutral-300 mb-6">
              This action will permanently delete all stored documents. This cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleClearAll}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Clearing...' : 'Yes, Clear All'}
              </button>
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 py-2 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 rounded-lg transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-modern-lg border border-neutral-100 dark:border-neutral-700 p-6">
          <h2 className="text-2xl font-semibold mb-4 text-neutral-900 dark:text-white flex items-center">
            <Upload className="w-6 h-6 mr-2 text-purple-600 dark:text-purple-400" />
            Add Document
          </h2>
          <div className="space-y-4">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all resize-y min-h-[120px] text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
              placeholder="Enter text to add to the vector store..."
            />
            <button
              onClick={handleAddDocument}
              disabled={isLoading || !inputText.trim()}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center space-x-2 group"
            >
              <Upload className="w-5 h-5 group-hover:animate-bounce" />
              <span>Add Document</span>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-modern-lg border border-neutral-100 dark:border-neutral-700 p-6">
          <h2 className="text-2xl font-semibold mb-4 text-neutral-900 dark:text-white flex items-center">
            <Search className="w-6 h-6 mr-2 text-purple-600 dark:text-purple-400" />
            Search Vector Store
          </h2>
          <div className="space-y-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
              placeholder="Enter search query..."
            />
            <div className="flex space-x-4">
              <button
                onClick={handleSearch}
                disabled={isLoading || !searchQuery.trim()}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center space-x-2 group"
              >
                <Search className="w-5 h-5 group-hover:animate-pulse" />
                <span>Search</span>
              </button>
              <button
                onClick={handleClearAll}
                disabled={isLoading}
                className="py-3 px-4 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 rounded-lg transition-colors flex items-center"
              >
                <Trash2 className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {results.length > 0 && (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-modern-lg border border-neutral-100 dark:border-neutral-700 p-6">
          <h2 className="text-2xl font-semibold mb-4 text-neutral-900 dark:text-white flex items-center">
            <Search className="w-6 h-6 mr-2 text-purple-600 dark:text-purple-400" />
            Search Results
          </h2>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div 
                key={index} 
                className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                <div className="font-medium text-neutral-800 dark:text-neutral-200 mb-2">{result.text}</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  Similarity: 
                  <span className="ml-2 text-purple-600 dark:text-purple-400 font-semibold">
                    {(result.score * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Interface */}
      <ChatInterface />
    </div>
  );
}
