import Link from 'next/link';
import { BookOpenText, GithubIcon, Linkedin } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-neutral-100 shadow-modern sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <BookOpenText 
            className="w-8 h-8 text-purple-600 group-hover:text-purple-700 transition-colors duration-300 transform group-hover:scale-110" 
          />
          <span className="text-xl font-bold text-neutral-800 group-hover:text-purple-700 transition-colors duration-300">
            Local Vector DB
          </span>
        </Link>
        <nav>
          <ul className="flex items-center space-x-4">
            <li>
              <Link 
                href="/" 
                className="text-neutral-600 hover:text-purple-600 transition-colors duration-300 font-medium"
              >
                Home
              </Link>
            </li>
            <li>
              <a 
                href="https://www.linkedin.com/in/vladlarichev/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-neutral-600 hover:text-purple-600 transition-colors duration-300 flex items-center space-x-2"
              >
                <Linkedin className="w-5 h-5" />
                <span className="font-medium">LinkedIn</span>
              </a>
            </li>
            <li>
              <a 
                href="https://github.com/your-repo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-neutral-600 hover:text-purple-600 transition-colors duration-300 flex items-center space-x-2"
              >
                <GithubIcon className="w-5 h-5" />
                <span className="font-medium">GitHub</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
