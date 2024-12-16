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
      setShowSettings(false);
    } catch (error) {
      console.error('Error validating API key:', error);
      alert('Invalid API key. Please check your OpenAI API key and try again.');
      return;
    }
  };

  const handleAddDocument = async () => {
    if (!vectorStore || !inputText.trim()) return;
    
    setIsLoading(true);
    setLoadingMessage('Adding document...');
    try {
      await vectorStore.addDocument(inputText);
      setInputText('');
      
      // Update document count
      const documents = await vectorStore.getAllDocuments();
      setDocumentCount(documents.length);
    } catch (error) {
      console.error('Error adding document:', error);
      alert('Error adding document. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleSearch = async () => {
    if (!vectorStore || !searchQuery.trim()) return;
    
    setIsLoading(true);
    setLoadingMessage('Searching...');
    try {
      const searchResults = await vectorStore.similaritySearch(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('Error searching:', error);
      alert('Error performing search. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleClearDocuments = async () => {
    if (!vectorStore) return;
    
    if (confirm('Are you sure you want to clear all documents? This action cannot be undone.')) {
      setIsLoading(true);
      setLoadingMessage('Clearing documents...');
      try {
        await vectorStore.clearAllDocuments();
        setDocumentCount(0);
        setResults([]);
      } catch (error) {
        console.error('Error clearing documents:', error);
        alert('Error clearing documents. Please try again.');
      } finally {
        setIsLoading(false);
        setLoadingMessage('');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50 dark:from-neutral-900 dark:to-purple-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <ProfileWidget />
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-modern-lg border border-neutral-100 dark:border-neutral-700 p-6">
            <h2 className="text-2xl font-semibold mb-4 text-neutral-900 dark:text-white flex items-center">
              <Upload className="w-6 h-6 mr-2 text-purple-600 dark:text-purple-400" />
              Add Document
            </h2>
            <div className="space-y-4">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all resize-y min-h-[120px] bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                placeholder="Enter text to add to the vector store..."
              />
              <button
                onClick={handleAddDocument}
                disabled={isLoading || !inputText.trim()}
                className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span>Add Document</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-modern-lg border border-neutral-100 dark:border-neutral-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white flex items-center">
                <Search className="w-6 h-6 mr-2 text-purple-600 dark:text-purple-400" />
                Search Documents
              </h2>
              <div className="flex items-center space-x-2">
                <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center space-x-2">
                  <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">
                    {documentCount} documents
                  </span>
                </div>
                <button
                  onClick={handleClearDocuments}
                  className="p-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  title="Clear all documents"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-grow p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                  placeholder="Enter search query..."
                />
                <button
                  onClick={handleSearch}
                  disabled={isLoading || !searchQuery.trim()}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                >
                  <Search className="w-5 h-5" />
                  <span>Search</span>
                </button>
              </div>

              {results.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Results:</h3>
                  <div className="space-y-4">
                    {results.map((result, index) => (
                      <div
                        key={index}
                        className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg border border-neutral-200 dark:border-neutral-600"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                            Similarity: {(result.score * 100).toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                          {result.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <ChatInterface />
        </div>
      </div>

      {showSettings && (
        <SettingsDialog
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onSave={handleSaveSettings}
          currentApiKey={apiKey}
        />
      )}

      {isLoading && <LoadingOverlay message={loadingMessage} progress={loadingProgress} />}
    </div>
  );
}
