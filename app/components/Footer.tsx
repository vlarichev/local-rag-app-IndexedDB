import Link from 'next/link';
import { Linkedin, GithubIcon } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white/80 backdrop-blur-md border-t border-neutral-100 shadow-modern">
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between">
        <div className="text-neutral-600 text-sm">
          &copy; {new Date().getFullYear()} Local RAG Demo. 
          Built with &hearts; using Next.js and IndexedDB. Created by 
          {' '}
          <a 
            href="https://www.linkedin.com/in/vladlarichev/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-semibold text-purple-600 hover:text-purple-700 transition-colors"
          >
            Vlad Larichev
          </a>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <a 
            href="https://www.linkedin.com/in/vladlarichev/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-neutral-600 hover:text-purple-600 transition-colors"
          >
            <Linkedin className="w-5 h-5" />
          </a>
          <a 
            href="https://github.com/your-repo" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-neutral-600 hover:text-purple-600 transition-colors"
          >
            <GithubIcon className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
