import { useState } from 'react';
import FileUpload from './components/FileUpload';
import './App.css';

function App() {
  const [, setSubmittedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setSubmittedFile(file);
    // Phase 3 will wire this to the backend
    console.log('File submitted for analysis:', file.name, file.type, file.size);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-logo-mark" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="28" height="28" rx="8" stroke="url(#logo-gradient)" strokeWidth="2.5"/>
            <path d="M10 21L14 11L18 19L22 13" stroke="url(#logo-gradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="logo-gradient" x1="2" y1="2" x2="30" y2="30">
                <stop stopColor="#6366f1"/>
                <stop offset="1" stopColor="#a78bfa"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 className="app-title">ViralLens</h1>
        <p className="app-subtitle">
          Upload a PDF or image to extract text and get engagement suggestions
        </p>
      </header>

      <main className="app-main">
        <FileUpload onFileSelect={handleFileSelect} />
      </main>

      <footer className="app-footer">
        <p>Built for content creators · PDF & Image analysis powered by OCR</p>
      </footer>
    </div>
  );
}

export default App;
