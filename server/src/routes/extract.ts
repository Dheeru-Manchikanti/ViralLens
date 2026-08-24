import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { extractTextFromPdf } from '../services/pdfExtractor.js';
import { extractTextFromImage } from '../services/imageExtractor.js';

/** Accepted MIME types */
const ACCEPTED_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
]);

/** Max file size: 10 MB */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Multer configuration — stores files in memory (no disk persistence).
 * Files are buffers that live only for the duration of the request.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (ACCEPTED_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Accepted types: PDF, PNG, JPEG.`));
    }
  },
});

const router = Router();

/**
 * POST /api/extract
 *
 * Accepts a single file upload (multipart/form-data, field name: "file").
 * Extracts text from PDF or image and returns it.
 *
 * Success response: { success: true, text: string, sourceType: "pdf" | "image" }
 * Error response:   { success: false, error: string }
 */
router.post('/', (req: Request, res: Response): void => {
  // Use multer as middleware within the handler for clean error catching
  upload.single('file')(req, res, async (multerErr: unknown) => {
    // Handle multer-level errors (file too large, wrong type, etc.)
    if (multerErr) {
      const message = multerErr instanceof Error ? multerErr.message : 'File upload failed.';

      // Multer uses a specific error code for file size limit
      if (multerErr instanceof multer.MulterError && multerErr.code === 'LIMIT_FILE_SIZE') {
        res.status(413).json({
          success: false,
          error: `File is too large. Maximum allowed size is 10 MB.`,
        });
        return;
      }

      res.status(400).json({ success: false, error: message });
      return;
    }

    // Ensure a file was actually provided
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No file was uploaded. Please select a PDF or image file.',
      });
      return;
    }

    const { mimetype, buffer } = req.file;

    try {
      let text: string;
      let sourceType: 'pdf' | 'image';

      if (mimetype === 'application/pdf') {
        sourceType = 'pdf';
        text = await extractTextFromPdf(buffer);
      } else {
        // image/png or image/jpeg
        sourceType = 'image';
        text = await extractTextFromImage(buffer);
      }

      res.json({
        success: true,
        text,
        sourceType,
      });
    } catch (err: unknown) {
      const message = err instanceof Error
        ? err.message
        : 'An unexpected error occurred during text extraction.';

      console.error(`[extract] Error processing ${mimetype}:`, message);

      res.status(422).json({
        success: false,
        error: message,
      });
    }
  });
});

export default router;
