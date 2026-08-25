import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, X, ShieldCheck } from 'lucide-react';
import { validateFileUpload } from '../../lib/security/fileUploadSecurity';
import { SECURITY_CONFIG } from '../../lib/security/securityConfig';

interface FileUploadProps {
  userId: string;
  onFileValidated: (file: File, validation: { storagePath: string; sanitizedFilename: string }) => void;
  currentUrl?: string;
  onRemoveCurrent?: () => void;
  disabled?: boolean;
}

export default function FileUpload({
  userId,
  onFileValidated,
  currentUrl,
  onRemoveCurrent,
  disabled = false,
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [validating, setValidating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [verifiedType, setVerifiedType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxMb = (SECURITY_CONFIG.FILE_UPLOAD.MAX_SIZE_BYTES / (1024 * 1024)).toFixed(0);

  async function handleFile(file: File) {
    setError(null);
    setValidating(true);

    try {
      const result = await validateFileUpload(file, userId);
      if (!result.isValid) {
        setError(result.error ?? 'Invalid file selected.');
        setSelectedFile(null);
        setVerifiedType(null);
      } else {
        setSelectedFile(file);
        setVerifiedType(result.detectedType ?? 'Document');
        onFileValidated(file, {
          storagePath: result.storagePath!,
          sanitizedFilename: result.sanitizedFilename!,
        });
      }
    } catch {
      setError('An error occurred during file security inspection.');
      setSelectedFile(null);
    } finally {
      setValidating(false);
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (disabled || validating) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void handleFile(e.dataTransfer.files[0]);
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      void handleFile(e.target.files[0]);
    }
  }

  function clearSelected() {
    setSelectedFile(null);
    setVerifiedType(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleChange}
        className="hidden"
        disabled={disabled || validating}
      />

      {/* Existing Upload Preview */}
      {currentUrl && !selectedFile && (
        <div className="flex items-center justify-between p-3.5 bg-brand-50/70 border border-brand-200 rounded-2xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-brand-100 rounded-xl flex items-center justify-center text-brand-700 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-brand-900 truncate">Current Resume Document</p>
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-brand-600 hover:text-brand-700 font-semibold hover:underline truncate block"
              >
                View Uploaded Resume
              </a>
            </div>
          </div>
          {onRemoveCurrent && (
            <button
              type="button"
              onClick={onRemoveCurrent}
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors cursor-pointer"
              title="Remove existing file"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Selected & Verified File Banner */}
      {selectedFile && (
        <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-emerald-900 truncate">{selectedFile.name}</p>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-200/80 text-emerald-800 px-1.5 py-0.2 rounded">
                  {verifiedType} Verified
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 font-medium">
                {(selectedFile.size / 1024).toFixed(1)} KB • Magic byte binary signature validated
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={clearSelected}
            className="text-emerald-700 hover:text-rose-600 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      {!selectedFile && (
        <div
          onDragOver={e => { e.preventDefault(); if (!disabled) setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => { if (!disabled && !validating) fileInputRef.current?.click(); }}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
            dragOver
              ? 'border-brand-500 bg-brand-50/50'
              : 'border-slate-300 hover:border-brand-400 bg-slate-50/50 hover:bg-slate-50'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-brand-600 mb-1">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                <span className="text-brand-600 hover:underline">Click to upload</span> or drag and drop
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                PDF or Word DOCX (Max {maxMb}MB)
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-medium bg-white px-2.5 py-1 rounded-full border border-slate-200 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>Binary magic byte & script defense inspection enabled</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
