'use client';

import Link from 'next/link';
import { Pyramid , GithubIcon, Linkedin } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-700 shadow-modern sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <Pyramid  
            className="w-8 h-8 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300 transform group-hover:scale-110" 
          />
          <span className="text-xl font-bold text-neutral-800 dark:text-neutral-100 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">
          VectorVault - Vector Database in your Browser
          </span>
        </Link>
        <nav className="flex items-center space-x-4">
          <a 
            href="https://www.linkedin.com/in/vladlarichev/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-neutral-600 dark:text-neutral-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300 flex items-center space-x-2"
          >
            <Linkedin className="w-5 h-5" />
            <span className="font-medium">Let's connect on LinkedIn 👋</span>
          </a>
          <a 
            href="https://github.com/vlarichev/local-rag-app-IndexedDB" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-neutral-600 dark:text-neutral-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300 flex items-center space-x-2"
          >
            <GithubIcon className="w-5 h-5" />
            <span className="font-medium">GitHub</span>
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
