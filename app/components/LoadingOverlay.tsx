'use client';

import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  message: string;
  progress?: {
    current: number;
    total: number;
  };
}

export default function LoadingOverlay({ message, progress }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <div className="space-y-2 w-full">
            <p className="text-neutral-700 dark:text-neutral-200 text-center">
              {message}
            </p>
            {progress && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 dark:bg-neutral-700 rounded-full h-2.5">
                  <div 
                    className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                  Processing document {progress.current} of {progress.total}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
