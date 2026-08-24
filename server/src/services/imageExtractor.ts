import Tesseract from 'tesseract.js';

/** Timeout for OCR processing (60 seconds) */
const OCR_TIMEOUT_MS = 60_000;

/**
 * Extracts text from an image buffer using Tesseract.js OCR.
 *
 * @param buffer - The raw image file buffer (PNG or JPEG)
 * @returns The extracted text content
 * @throws Error with a descriptive message if OCR fails or times out
 */
export async function extractTextFromImage(buffer: Buffer): Promise<string> {
  try {
    // Race OCR against a timeout
    const result = await Promise.race([
      Tesseract.recognize(buffer, 'eng', {
        logger: () => {}, // Suppress progress logs
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('OCR_TIMEOUT')), OCR_TIMEOUT_MS)
      ),
    ]);

    const text = result.data.text;

    if (!text || text.trim().length === 0) {
      throw new Error('No readable text was found in the image. The image may be blank, too low-resolution, or contain non-text content.');
    }

    // Clean up OCR artifacts
    const cleaned = text
      .replace(/\r\n/g, '\n')
      .replace(/\n{4,}/g, '\n\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim();

    return cleaned;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    if (message === 'OCR_TIMEOUT') {
      throw new Error('Image text extraction timed out. The image may be too large or complex. Try a smaller or clearer image.');
    }

    // Re-throw our own errors
    if (message.includes('No readable text') || message.includes('timed out')) {
      throw err;
    }

    throw new Error(`Failed to extract text from image: ${message}`);
  }
}
