'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, Loader2 } from 'lucide-react';
import { BrowserVectorStore } from '../../lib/vectorStore';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const generatePrompt = async (query: string) => {
    if (!apiKey) {
      throw new Error('Please add your OpenAI API key in settings first.');
    }

    const vectorStore = await BrowserVectorStore.getInstance(apiKey);
    const results = await vectorStore.similaritySearch(query);
    
    // Create context from relevant documents
    const context = results
      .map(doc => doc.text)
      .join('\n\n');

    return {
      messages: [
        {
          role: "system",
          content: `You are a helpful AI assistant. Use the following context from the user's document store to answer their question. If the context doesn't contain relevant information, just say so.

Context from documents:
${context}`
        },
        {
          role: "user",
          content: query
        }
      ]
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!apiKey) {
      setError('Please add your OpenAI API key in settings first.');
      return;
    }

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const prompt = await generatePrompt(input);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: prompt.messages,
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result?.choices?.[0]?.message?.content) {
        throw new Error('Unexpected response format from the API');
      }

      const assistantMessage = {
        role: 'assistant' as const,
        content: result.choices[0].message.content.trim()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      const errorMessage = {
        role: 'assistant' as const,
        content: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again in a moment.`
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-modern-lg border border-neutral-100 dark:border-neutral-700 p-6">
      <h2 className="text-2xl font-semibold mb-4 text-neutral-900 dark:text-white flex items-center">
        <MessageSquare className="w-6 h-6 mr-2 text-purple-600 dark:text-purple-400" />
        Chat with Your Documents
      </h2>
      
      <div className="space-y-4">
        <div className="h-[400px] overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 bg-neutral-50 dark:bg-neutral-900">
          {messages.length === 0 ? (
            <div className="text-center text-neutral-500 dark:text-neutral-400 mt-32">
              Start a conversation by asking about your documents!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-2 ${
                    message.role === 'user' ? 'justify-end' : ''
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-purple-600 dark:bg-purple-500 text-white ml-4'
                        : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100'
                    }`}
                  >
                    {message.content}
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-purple-700 dark:bg-purple-600 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {isLoading && (
            <div className="flex items-center justify-center mt-4">
              <Loader2 className="w-6 h-6 text-purple-600 dark:text-purple-400 animate-spin" />
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your documents..."
            className="flex-1 p-3 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || !apiKey}
            className="px-4 py-3 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-lg disabled:opacity-50 transition-colors flex items-center space-x-2"
          >
            <Send className="w-5 h-5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
