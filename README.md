# Local RAG Demo

A fully client-side vector search application using Next.js and IndexedDB. This application allows you to manage documents and interact with them using a local vector database and AI-powered chat interface.

## Features

- **Local Vector Search**: Store and search through documents using a fully client-side vector database
- **AI Chat Interface**: Chat with your documents using OpenAI's GPT-3.5 Turbo
- **Modern UI**: Beautiful interface with animated particle background
- **Dark Mode Support**: Seamless switching between light and dark themes
- **Privacy-Focused**: All processing happens in your browser
- **Responsive Design**: Works great on both desktop and mobile

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/local-rag-app.git
cd local-rag-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your OpenAI API key:
```
NEXT_PUBLIC_OPENAI_API_KEY=your-openai-api-key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Adding Documents**:
   - Enter text in the "Add Document" section
   - Click "Add Document" to store it in the vector database

2. **Searching Documents**:
   - Enter a search query
   - Click "Search" to find similar documents
   - Results are displayed with similarity scores

3. **Chat Interface**:
   - Ask questions about your documents
   - The AI will respond using relevant context from your stored documents

## Technologies Used

- Next.js 13+ with App Router
- TailwindCSS for styling
- IndexedDB for local storage
- OpenAI API for chat functionality
- Canvas API for particle animations
- next-themes for dark mode

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for learning, personal, or commercial purposes.
