import { PDFParse } from 'pdf-parse';

/**
 * Extracts text from a PDF file buffer.
 * Uses pdf-parse v2 (PDFParse class) to read text content,
 * preserving paragraph and line breaks.
 *
 * @param buffer - The raw PDF file buffer
 * @returns The extracted text content
 * @throws Error with a descriptive message if extraction fails
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  let parser: PDFParse | null = null;

  try {
    // Convert Node.js Buffer to Uint8Array for pdf-parse v2
    const uint8 = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);

    parser = new PDFParse({ data: uint8 });
    const result = await parser.getText();

    if (!result.text || result.text.trim().length === 0) {
      throw new Error('The PDF file appears to be empty or contains no readable text. It may be a scanned document — try uploading it as an image instead.');
    }

    // Normalize excessive whitespace while preserving paragraph structure
    const cleaned = result.text
      .replace(/\r\n/g, '\n')                  // Normalize line endings
      .replace(/\n*-- \d+ of \d+ --\n*/g, '\n') // Remove pdf-parse page markers
      .replace(/\n{4,}/g, '\n\n\n')            // Cap consecutive newlines at 3
      .replace(/[ \t]+/g, ' ')                 // Collapse horizontal whitespace
      .trim();

    return cleaned;
  } catch (err: unknown) {
    // Re-throw our own errors
    if (err instanceof Error && err.message.includes('PDF file appears to be empty')) {
      throw err;
    }

    // Handle pdf-parse specific errors
    const message = err instanceof Error ? err.message : String(err);

    if (message.includes('Invalid') || message.includes('password')) {
      throw new Error('The PDF file is invalid or password-protected. Please upload an unprotected PDF.');
    }

    throw new Error(`Failed to extract text from PDF: ${message}`);
  } finally {
    // Clean up parser resources
    if (parser) {
      try {
        await parser.destroy();
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}
