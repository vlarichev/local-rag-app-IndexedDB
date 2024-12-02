# Local RAG Application

This is a Next.js application that implements Retrieval-Augmented Generation (RAG) entirely in the browser. It uses IndexedDB for vector storage and Transformers.js for generating embeddings locally.

## Features

- 100% browser-based vector storage using IndexedDB
- Local embedding generation using Transformers.js
- No server-side dependencies for vector operations
- Real-time semantic search
- Modern UI with Tailwind CSS

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How it Works

This application uses:
- IndexedDB for storing document vectors
- Transformers.js for generating embeddings in the browser
- Next.js for the web framework
- Tailwind CSS for styling

All vector operations happen directly in the browser, ensuring privacy and offline capability.
