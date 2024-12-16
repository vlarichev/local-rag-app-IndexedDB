'use client';

import Image from 'next/image';
import { Linkedin } from 'lucide-react';

export default function ProfileWidget() {
  return (
    <div className="flex items-center space-x-4 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm rounded-xl p-3 shadow-modern">
      <div className="relative w-16 h-16 rounded-full overflow-hidden">
        <Image
          src="/vlad-larichev.jpg"
          alt="Vlad Larichev"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Vlad Larichev</h2>
        <p className="text-sm text-neutral-600 dark:text-white/90 mb-1">Industrial Data & AI</p>
        <a 
          href="https://www.linkedin.com/in/vladlarichev/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-purple-600 dark:text-white hover:text-purple-700 dark:hover:text-purple-300 text-sm transition-colors"
        >
          <Linkedin className="w-4 h-4" />
          <span>Connect on LinkedIn</span>
        </a>
      </div>
    </div>
  );
}
