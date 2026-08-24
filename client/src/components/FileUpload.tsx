import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';
import './FileUpload.css';

/** Accepted MIME types for upload */
const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];
const ACCEPTED_EXTENSIONS = '.pdf, .png, .jpg, .jpeg';

/** Maximum file size in bytes (10 MB) */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

/**
 * Formats a byte count into a human-readable string (KB or MB).
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Returns a user-friendly label for the file type.
 */
function getFileTypeLabel(type: string): string {
  switch (type) {
    case 'application/pdf': return 'PDF Document';
    case 'image/png': return 'PNG Image';
    case 'image/jpeg': return 'JPEG Image';
    default: return 'Unknown';
  }
}

/**
 * FileUpload component — supports drag-and-drop and click-to-browse.
 * Validates file type and size client-side before staging.
 */
export default function FileUpload({ onFileSelect }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Validates a file against accepted types and max size.
   * Returns an error message string, or null if valid.
   */
  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `Unsupported file type "${file.type || 'unknown'}". Please upload a PDF, PNG, or JPEG file.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File is too large (${formatFileSize(file.size)}). Maximum allowed size is ${formatFileSize(MAX_FILE_SIZE)}.`;
    }
    if (file.size === 0) {
      return 'The selected file is empty. Please choose a valid file.';
    }
    return null;
  }, []);

  /**
   * Processes a selected file — validates and stages it, or shows an error.
   */
  const handleFile = useCallback((file: File) => {
    setError(null);
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setError(null);
  }, [validateFile]);

  // --- Drag-and-drop handlers ---

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  // --- Click-to-browse handler ---

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
    // Reset input value so re-selecting the same file triggers onChange
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [handleFile]);

  const handleBrowseClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  // --- Remove staged file ---

  const handleRemove = useCallback(() => {
    setSelectedFile(null);
    setError(null);
  }, []);

  // --- Submit staged file ---

  const handleSubmit = useCallback(() => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  }, [selectedFile, onFileSelect]);

  return (
    <div className="file-upload-wrapper">
      {/* Drop zone */}
      <div
        className={`file-upload-dropzone ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={selectedFile ? undefined : handleBrowseClick}
        role="button"
        tabIndex={0}
        aria-label="Upload file area"
        id="file-upload-dropzone"
      >
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleInputChange}
          className="file-upload-input"
          id="file-upload-input"
          aria-hidden="true"
          tabIndex={-1}
        />

        {!selectedFile ? (
          /* Empty state — invite user to drag or browse */
          <div className="file-upload-empty">
            <div className="file-upload-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 32V16M24 16L18 22M24 16L30 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 32C8 36.4183 11.5817 40 16 40H32C36.4183 40 40 36.4183 40 32V28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M40 20V16C40 11.5817 36.4183 8 32 8H16C11.5817 8 8 11.5817 8 16V20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="file-upload-title">
              Drag & drop your file here
            </p>
            <p className="file-upload-subtitle">
              or <span className="file-upload-browse">browse files</span>
            </p>
            <p className="file-upload-hint">
              Supports PDF, PNG, JPEG — up to 10 MB
            </p>
          </div>
        ) : (
          /* File staged — show details */
          <div className="file-upload-staged">
            <div className="file-upload-file-icon">
              {selectedFile.type === 'application/pdf' ? (
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="3" width="24" height="30" rx="3" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 13H24M12 18H24M12 23H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="5" y="5" width="26" height="26" rx="4" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="14" cy="14" r="3" stroke="currentColor" strokeWidth="2"/>
                  <path d="M5 25L13 19L19 25L25 19L31 25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div className="file-upload-file-details">
              <p className="file-upload-file-name" title={selectedFile.name}>
                {selectedFile.name}
              </p>
              <p className="file-upload-file-meta">
                {getFileTypeLabel(selectedFile.type)} · {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <button
              className="file-upload-remove-btn"
              onClick={(e) => { e.stopPropagation(); handleRemove(); }}
              aria-label="Remove selected file"
              id="file-upload-remove-btn"
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="file-upload-error" role="alert" id="file-upload-error">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9 5V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="9" cy="13" r="1" fill="currentColor"/>
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Submit button */}
      {selectedFile && (
        <button
          className="file-upload-submit-btn"
          onClick={handleSubmit}
          id="file-upload-submit-btn"
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 10L8 15L17 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Analyze Content
        </button>
      )}
    </div>
  );
}
