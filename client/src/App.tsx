import { useState } from 'react';
import FileUpload from './components/FileUpload';
import './App.css';

interface AnalysisSuggestion {
  id: string;
  type: 'length' | 'hashtag' | 'cta' | 'readability' | 'emoji';
  label: string;
  message: string;
  status: 'good' | 'warning' | 'info';
}

function App() {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<AnalysisSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsExtracting(true);
    setError(null);
    setExtractedText(null);
    setSuggestions([]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract text. Please try again.');
      }

      setExtractedText(data.text);
      setSuggestions(data.suggestions || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleReset = () => {
    setExtractedText(null);
    setSuggestions([]);
    setError(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="status-icon good">
            <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2"/>
            <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'warning':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="status-icon warning">
            <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2"/>
            <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="16" r="1" fill="currentColor"/>
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="status-icon info">
            <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2"/>
            <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="8" r="1" fill="currentColor"/>
          </svg>
        );
    }
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
        {/* Error Alert */}
        {error && (
          <div className="app-alert error-alert" role="alert">
            <div className="alert-content">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 3L3 17H17L10 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 9V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="10" cy="15" r="1" fill="currentColor"/>
              </svg>
              <span>{error}</span>
            </div>
            <button className="alert-dismiss" onClick={() => setError(null)} aria-label="Dismiss error">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}

        {/* Loading State */}
        {isExtracting ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Analyzing document...</p>
            <span className="loading-subtext">This might take a few moments for large files or images.</span>
          </div>
        ) : !extractedText ? (
          /* Upload State */
          <FileUpload onFileSelect={handleFileSelect} />
        ) : (
          /* Success State - Show Extracted Text and Analysis */
          <div className="results-container">
            <div className="results-header">
              <h2>Analysis Results</h2>
              <button className="btn-secondary" onClick={handleReset}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 8C3 5.23858 5.23858 3 8 3C10.7614 3 13 5.23858 13 8C13 10.7614 10.7614 13 8 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M2.5 5.5L3 3L5.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Try another file
              </button>
            </div>
            
            <div className="results-grid">
              <div className="extracted-text-section">
                <h3>Extracted Content</h3>
                <div className="extracted-text-panel">
                  <pre>{extractedText}</pre>
                </div>
              </div>
              
              <div className="analysis-section">
                <h3>Engagement Suggestions</h3>
                <div className="suggestions-list">
                  {suggestions.length > 0 ? (
                    suggestions.map((suggestion) => (
                      <div key={suggestion.id} className={`suggestion-card ${suggestion.status}`}>
                        {getStatusIcon(suggestion.status)}
                        <div className="suggestion-content">
                          <h4>{suggestion.label}</h4>
                          <p>{suggestion.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="suggestion-card info">
                      <div className="suggestion-content">
                        <p>No actionable suggestions found for this content.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Built for content creators · PDF & Image analysis powered by OCR</p>
      </footer>
    </div>
  );
}

export default App;
