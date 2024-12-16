'use client';

import { useState, useEffect } from 'react';
import { BrowserVectorStore } from '../../lib/vectorStore';
import { Upload, Search, Trash2, Database, Layers, Settings } from 'lucide-react';
import ProfileWidget from './ProfileWidget';
import ChatInterface from './ChatInterface';
import LoadingOverlay from './LoadingOverlay';
import SettingsDialog from './SettingsDialog';
import Image from 'next/image';

export default function VectorStoreApp() {
  const [vectorStore, setVectorStore] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Array<{ text: string; score: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingProgress, setLoadingProgress] = useState<{ current: number; total: number } | null>(null);
  const [documentCount, setDocumentCount] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    // Load API key from localStorage on mount
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleSaveSettings = async (newApiKey: string) => {
    try {
      // Test the API key before saving
      const store = await BrowserVectorStore.getInstance(newApiKey);
      // Try to create a test embedding to verify the API key works
      await store.testApiKey();
      
      setApiKey(newApiKey);
      localStorage.setItem('openai_api_key', newApiKey);
      
      // Reinitialize vectorStore with new API key
      setVectorStore(store);
    } catch (error) {
      console.error('Error validating API key:', error);
      alert('Invalid API key. Please check your OpenAI API key and try again.');
      return;
    }
  };

  const initVectorStore = async (key: string) => {
    if (!key) return;
    
    try {
      const store = await BrowserVectorStore.getInstance(key);
      setVectorStore(store);
      
      // Get initial document count
      const documents = await store.getAllDocuments();
      setDocumentCount(documents.length);
    } catch (error) {
      console.error('Error initializing vector store:', error);
      alert('Error initializing vector store. Please check your API key.');
    }
  };

  useEffect(() => {
    if (apiKey) {
      initVectorStore(apiKey);
    }
  }, [apiKey]);

  const handleAddDocument = async () => {
    if (!inputText.trim()) return;
    if (!vectorStore) {
      alert('Please add your OpenAI API key in settings first.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Processing and embedding documents...');
    try {
      console.log('Adding documents:', inputText.substring(0, 100) + '...');
      const documents = inputText
        .split(/\s*XXXX\s*/)
        .map(doc => doc.trim())
        .filter(doc => doc.length > 0);

      setLoadingProgress({ current: 0, total: documents.length });

      for (let i = 0; i < documents.length; i++) {
        await vectorStore.addDocument(documents[i]);
        setLoadingProgress({ current: i + 1, total: documents.length });
      }

      console.log('Documents added successfully');
      setInputText('');
      const allDocuments = await vectorStore.getAllDocuments();
      console.log(`Total documents in store: ${allDocuments.length}`);
      setDocumentCount(allDocuments.length);
    } catch (error) {
      console.error('Error adding document:', error);
      alert('Error adding document. Please try again.');
    }
    setIsLoading(false);
    setLoadingMessage('');
    setLoadingProgress(null);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setLoadingMessage('Searching through documents...');
    try {
      const searchResults = await vectorStore.similaritySearch(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('Error searching:', error);
      alert('Error performing search. Please try again.');
    }
    setIsLoading(false);
    setLoadingMessage('');
  };

  const handleClearDocuments = async () => {
    setShowConfirmDialog(true);
  };

  const confirmClearDocuments = async () => {
    setIsLoading(true);
    setLoadingMessage('Clearing documents...');
    try {
      await vectorStore.clearDocuments();
      setResults([]);
      setDocumentCount(0);
    } catch (error) {
      console.error('Error clearing documents:', error);
      alert('Error clearing documents. Please try again.');
    }
    setIsLoading(false);
    setLoadingMessage('');
    setShowConfirmDialog(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {isLoading && loadingMessage && (
        <LoadingOverlay 
          message={loadingMessage} 
          progress={loadingProgress}
        />
      )}
      
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 shadow-lg mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden">
              <Image
                src="/vlad-larichev.jpg"
                alt="Vlad Larichev"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                Local Vector Database
              </h1>
              <p className="text-neutral-700 dark:text-neutral-300">
                by Vlad Larichev | Industrial Data & AI
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center px-4 py-2 bg-purple-100 hover:bg-purple-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
              <span className="text-neutral-700 dark:text-neutral-200">Settings</span>
            </button>
          </div>
        </div>
      </div>

      {!apiKey && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-4">
          <p className="text-yellow-800 dark:text-yellow-200">
            Please add your OpenAI API key in settings to use the application.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-neutral-900 dark:text-white">
            <Database className="mr-2 text-purple-600 dark:text-purple-400" /> Document Management
          </h2>
          
          <div className="mb-4">
            <textarea
              className="w-full p-2 border rounded bg-white dark:bg-neutral-700 border-neutral-200 dark:border-neutral-600 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter document text..."
              rows={4}
            />
          </div>
          
          <div className="flex gap-2 mb-4">
            <button
              className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded disabled:opacity-50 transition-colors"
              onClick={handleAddDocument}
              disabled={isLoading || !inputText.trim()}
            >
              <Upload className="mr-2" /> Add Document
            </button>
            
            <button
              className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded disabled:opacity-50 transition-colors"
              onClick={handleClearDocuments}
              disabled={isLoading || documentCount === 0}
            >
              <Trash2 className="mr-2" /> Clear All ({documentCount})
            </button>
          </div>
          
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 p-2 border rounded bg-white dark:bg-neutral-700 border-neutral-200 dark:border-neutral-600 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter search query..."
              />
              <button
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded disabled:opacity-50 transition-colors"
                onClick={handleSearch}
                disabled={isLoading || !searchQuery.trim()}
              >
                <Search className="mr-2" /> Search
              </button>
            </div>
          </div>
          
          {results.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center text-neutral-900 dark:text-white">
                <Layers className="mr-2 text-purple-600 dark:text-purple-400" /> Search Results ({results.length})
              </h3>
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div key={index} className="p-2 border rounded bg-white dark:bg-neutral-700 border-neutral-200 dark:border-neutral-600">
                    <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                      Score: {result.score.toFixed(4)}
                    </div>
                    <div className="text-neutral-900 dark:text-white">{result.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <ChatInterface />
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-white">Confirm Clear Documents</h3>
            <p className="mb-4 text-neutral-700 dark:text-neutral-300">Are you sure you want to clear all documents? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-neutral-500 hover:bg-neutral-600 dark:bg-neutral-600 dark:hover:bg-neutral-700 text-white rounded transition-colors"
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded transition-colors"
                onClick={confirmClearDocuments}
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      <SettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSaveSettings}
        currentApiKey={apiKey}
      />
    </div>
  );
}
