'use client';

import Link from 'next/link';
import { Linkedin, GithubIcon } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border-t border-neutral-100 dark:border-neutral-700 shadow-modern">
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between">
        <div className="text-neutral-600 dark:text-neutral-300 text-sm">
          &copy; {new Date().getFullYear()} Local RAG Demo. 
          Built with &hearts; using Next.js and IndexedDB. Created by 
          {' '}
          <a 
            href="https://www.linkedin.com/in/vladlarichev/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
          >
            Vlad Larichev
          </a>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <a 
            href="https://www.linkedin.com/in/vladlarichev/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-neutral-600 dark:text-neutral-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            <Linkedin className="w-5 h-5" />
          </a>
          <a 
            href="https://github.com/vlarichev/local-rag-app-IndexedDB" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-neutral-600 dark:text-neutral-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            <GithubIcon className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
