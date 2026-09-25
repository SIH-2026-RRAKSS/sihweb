import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, CheckCircle2, AlertCircle } from 'lucide-react';

export interface UploadedFileItem {
  id: string;
  file: File;
  name: string;
  size: string;
  progress: number;
  status: 'UPLOADING' | 'COMPLETED' | 'ERROR';
}

interface EvidenceDropzoneProps {
  files: UploadedFileItem[];
  onFilesChange: (files: UploadedFileItem[]) => void;
  maxFiles?: number;
}

export const EvidenceDropzone: React.FC<EvidenceDropzoneProps> = ({
  files,
  onFilesChange,
  maxFiles = 5,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleProcessFiles = (newFiles: FileList | File[]) => {
    setErrorMessage(null);
    const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.csv'];
    const arrayFiles = Array.from(newFiles);

    if (files.length + arrayFiles.length > maxFiles) {
      setErrorMessage(`You can upload a maximum of ${maxFiles} evidence documents.`);
      return;
    }

    const items: UploadedFileItem[] = [];

    for (const f of arrayFiles) {
      const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();
      if (!validExtensions.includes(ext)) {
        setErrorMessage(`File "${f.name}" is not supported. Allowed: PDF, JPG, PNG, CSV.`);
        return;
      }
      if (f.size > 10 * 1024 * 1024) {
        setErrorMessage(`File "${f.name}" exceeds the 10 MB maximum size limit.`);
        return;
      }

      items.push({
        id: `FILE-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file: f,
        name: f.name,
        size: formatFileSize(f.size),
        progress: 100,
        status: 'COMPLETED',
      });
    }

    onFilesChange([...files, ...items]);
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-3 font-sans text-xs">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-xl flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Drop area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) handleProcessFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-[#FF5500] bg-orange-50/40'
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.csv"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleProcessFiles(e.target.files);
          }}
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="p-2.5 bg-orange-50 text-[#FF5500] rounded-xl">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-800 text-xs">
              Upload Bank SMS / UPI Screenshots / Account Statement
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Drag & drop files or browse (PDF, PNG, JPG up to 10MB each)
            </div>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((fileItem) => (
            <div
              key={fileItem.id}
              className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 flex-shrink-0">
                  <File className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="font-medium text-slate-800 text-xs truncate max-w-[260px]">
                    {fileItem.name}
                  </div>
                  <div className="text-[10px] text-slate-400">{fileItem.size}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <button
                  type="button"
                  onClick={() => removeFile(fileItem.id)}
                  className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
