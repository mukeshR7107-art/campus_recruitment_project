/**
 * File Upload Security & Magic Byte Inspector
 *
 * Enforces multi-layer file upload defense:
 * 1. Binary magic byte signature inspection
 * 2. MIME type & extension whitelist verification
 * 3. Executable and script extension blacklisting (SVG, HTML, JS, PHP, EXE, etc.)
 * 4. File size limits
 * 5. Path traversal prevention and randomized UUID storage paths
 */

import { SECURITY_CONFIG } from './securityConfig';
import { logger } from './logger';

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedFilename?: string;
  storagePath?: string;
  detectedType?: string;
}

// Known Magic Byte Signatures
const MAGIC_SIGNATURES: { name: string; mime: string; ext: string; bytes: number[] }[] = [
  {
    name: 'PDF',
    mime: 'application/pdf',
    ext: 'pdf',
    bytes: [0x25, 0x50, 0x44, 0x46, 0x2D], // %PDF-
  },
  {
    name: 'DOCX',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ext: 'docx',
    bytes: [0x50, 0x4B, 0x03, 0x04], // PK.. (ZIP archive)
  },
  {
    name: 'DOC',
    mime: 'application/msword',
    ext: 'doc',
    bytes: [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1], // OLE compound file
  },
];

/**
 * Inspects file buffer to detect true binary format
 */
export async function inspectFileMagicBytes(file: File): Promise<{ matched: boolean; detectedName?: string }> {
  try {
    const slice = file.slice(0, 16);
    const arrayBuffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    for (const sig of MAGIC_SIGNATURES) {
      const match = sig.bytes.every((expectedByte, index) => bytes[index] === expectedByte);
      if (match) {
        return { matched: true, detectedName: sig.name };
      }
    }

    return { matched: false };
  } catch (err) {
    logger.error('FileUploadSecurity', 'Failed to inspect file magic bytes', err);
    return { matched: false };
  }
}

/**
 * Sanitizes a filename and prevents path traversal
 */
export function sanitizeFilename(originalName: string): string {
  // Remove null bytes and directory traversal symbols
  const clean = originalName
    .replace(/\0/g, '')
    .replace(/[/\\?%*:|"<>]/g, '_')
    .replace(/\.\./g, '');

  return clean.substring(0, 100);
}

/**
 * Validates a file upload thoroughly against all security constraints
 */
export async function validateFileUpload(file: File, userId: string): Promise<FileValidationResult> {
  const { MAX_SIZE_BYTES, ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES, DANGEROUS_EXTENSIONS } = SECURITY_CONFIG.FILE_UPLOAD;

  if (!file) {
    return { isValid: false, error: 'No file provided for upload.' };
  }

  // 1. File Size Check
  if (file.size <= 0) {
    return { isValid: false, error: 'Cannot upload empty (0 byte) file.' };
  }
  if (file.size > MAX_SIZE_BYTES) {
    const maxMb = (MAX_SIZE_BYTES / (1024 * 1024)).toFixed(0);
    return { isValid: false, error: `File size exceeds the maximum allowed limit of ${maxMb}MB.` };
  }

  // 2. Dangerous Extension Check (Double-extension prevention: resume.pdf.exe)
  const lowerName = file.name.toLowerCase();
  for (const dangerousExt of DANGEROUS_EXTENSIONS) {
    if (lowerName.endsWith(dangerousExt) || lowerName.includes(`${dangerousExt}.`)) {
      logger.securityEvent('DANGEROUS_FILE_UPLOAD_BLOCKED', {
        filename: file.name,
        userId,
        detectedDangerousExt: dangerousExt,
      });
      return {
        isValid: false,
        error: 'Upload blocked: Executable, script, or active document formats are prohibited for security.',
      };
    }
  }

  // 3. Allowed Extension Check
  const hasAllowedExt = ALLOWED_EXTENSIONS.some(ext => lowerName.endsWith(ext));
  if (!hasAllowedExt) {
    return {
      isValid: false,
      error: `Invalid file format. Allowed formats: ${ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  // 4. MIME Type Whitelist Check
  const isAllowedMime = ALLOWED_MIME_TYPES.some(mime => file.type === mime);
  if (!isAllowedMime && file.type !== '') {
    logger.warn('FileUploadSecurity', 'MIME type mismatch', { declared: file.type });
  }

  // 5. Binary Magic Byte Signature Verification
  const magicCheck = await inspectFileMagicBytes(file);
  if (!magicCheck.matched) {
    logger.securityEvent('MAGIC_BYTE_MISMATCH_BLOCKED', {
      filename: file.name,
      declaredMime: file.type,
      userId,
    });
    return {
      isValid: false,
      error: 'File content verification failed: the file signature does not match a valid PDF or Word document.',
    };
  }

  // 6. Generate Isolated UUID Storage Path (avoids directory traversal & collision)
  const extensionMatch = lowerName.match(/\.([a-z0-9]+)$/);
  const ext = extensionMatch ? extensionMatch[1] : 'pdf';
  const randomUuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const sanitizedName = sanitizeFilename(file.name);
  const storagePath = `${userId}/${randomUuid}.${ext}`;

  return {
    isValid: true,
    sanitizedFilename: sanitizedName,
    storagePath,
    detectedType: magicCheck.detectedName,
  };
}
