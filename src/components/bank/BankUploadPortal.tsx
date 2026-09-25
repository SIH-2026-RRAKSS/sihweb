import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldCheck,
  Building2,
  RefreshCw,
  Eye,
  Download,
  FileText,
  FileCheck
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { BankUploadBatch } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const BankUploadPortal: React.FC = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [batches, setBatches] = useState<BankUploadBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Review modal
  const [selectedBatch, setSelectedBatch] = useState<BankUploadBatch | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getBankUploads();
      setBatches(data);
    } catch (err) {
      console.error('Failed to load bank uploads', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setErrorMessage('Only CSV format transaction statement files are supported.');
      return;
    }

    setErrorMessage(null);
    setUploading(true);
    setUploadProgress(20);

    const interval = setInterval(() => {
      setUploadProgress((prev) => (prev < 90 ? prev + 15 : prev));
    }, 200);

    try {
      const newBatch = await ApiService.uploadBankStatementCsv(file, user?.bankId || 'BNK-HDFC-01');
      clearInterval(interval);
      setUploadProgress(100);
      setSuccessMessage(`File "${file.name}" ingested successfully! ${newBatch.flaggedCount} mule accounts detected.`);
      setTimeout(() => setSuccessMessage(null), 5000);
      setBatches((prev) => [newBatch, ...prev]);
    } catch (err: any) {
      clearInterval(interval);
      setErrorMessage(err.message || 'CSV Ingestion failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleReviewSubmit = async (status: 'ACCEPTED' | 'REJECTED') => {
    if (!selectedBatch) return;
    try {
      setSubmittingReview(true);
      const updated = await ApiService.reviewBankUpload(selectedBatch.id, status, reviewNotes);
      setSuccessMessage(`Batch #${selectedBatch.id} marked as ${status}.`);
      setTimeout(() => setSuccessMessage(null), 4000);
      setBatches((prev) => prev.map((b) => (b.id === selectedBatch.id ? updated : b)));
      setSelectedBatch(null);
      setReviewNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const downloadSampleCsv = () => {
    const csvContent =
      'TRANSACTION_ID,SENDER_ACCOUNT,RECEIVER_ACCOUNT,AMOUNT,TIMESTAMP,SENDER_IFSC,RECEIVER_IFSC,CHANNEL,TERMINAL_ID\n' +
      'TX_901928,HDFC00991283,ICIC99882711,250000,2026-09-25T10:15:00Z,HDFC0001,ICIC0002,IMPS,ATM-DEL-01\n' +
      'TX_901929,ICIC99882711,SBIN88719283,248000,2026-09-25T10:22:00Z,ICIC0002,SBIN0001,RTGS,ATM-DEL-02\n' +
      'TX_901930,SBIN88719283,KKBK11992834,120000,2026-09-25T10:35:00Z,SBIN0001,KKBK0001,UPI,ATM-NOI-09';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_bank_statement_ingest.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* ── ALERTS ── */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl flex items-center gap-2 font-medium shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-2xl flex items-center gap-2 font-medium shadow-sm animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ── HEADER BANNER ── */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-saas-card">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-700">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span>BANK TRANSACTION STATEMENT CSV INGESTION PORTAL</span>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                BATCH PIPELINE
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Bulk ingestion for automated graph layer construction, node embedding generation, and mule anomaly detection
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadSampleCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sample CSV Format</span>
          </button>

          <button
            onClick={fetchBatches}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── DRAG & DROP ZONE ── */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all bg-white shadow-saas-card ${
          isDragging
            ? 'border-[#FF5500] bg-orange-50/30'
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-3 bg-orange-50 text-[#FF5500] rounded-2xl border border-orange-100 shadow-sm">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div>
            <div className="font-bold text-slate-900 text-sm">
              Click to select or drag & drop Bank Statement CSV
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Supports Core Banking System export CSVs with up to 50,000 transactions per batch
            </div>
          </div>

          {uploading && (
            <div className="w-full max-w-xs space-y-1.5 pt-2">
              <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                <span>Ingesting & Running GraphSAGE Inference...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-500 to-[#FF5500] h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── BATCH HISTORY TABLE ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-saas-card">
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between">
          <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
            <span>INGESTION BATCH AUDIT LOG</span>
          </div>
          <span className="text-[10px] text-slate-400 font-bold">
            {batches.length} BATCHES PROCESSED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">BATCH ID</th>
                <th className="p-3">BANK NAME</th>
                <th className="p-3">FILE NAME</th>
                <th className="p-3 text-right">TOTAL TXS</th>
                <th className="p-3 text-right">MULE ANOMALIES</th>
                <th className="p-3">TIMESTAMP</th>
                <th className="p-3">STATUS</th>
                <th className="p-3 text-center">AUDIT REVIEW</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                    <span>Loading ingestion audit logs...</span>
                  </td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No transaction statement batches uploaded yet.
                  </td>
                </tr>
              ) : (
                batches.map((batch) => {
                  const isAccepted = batch.status === 'ACCEPTED';
                  const isRejected = batch.status === 'REJECTED';
                  const isPending = batch.status === 'PENDING_REVIEW';

                  return (
                    <tr key={batch.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Batch ID */}
                      <td className="p-3 font-mono font-bold text-blue-600">
                        {batch.id}
                      </td>

                      {/* Bank */}
                      <td className="p-3 font-medium text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{batch.bankName}</span>
                        </div>
                      </td>

                      {/* File */}
                      <td className="p-3 font-mono text-slate-700">
                        {batch.fileName}
                        <div className="text-[10px] text-slate-400 font-sans">
                          {(batch.fileSizeBytes / 1024).toFixed(1)} KB · by {batch.uploadedByUserName}
                        </div>
                      </td>

                      {/* Total TX */}
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        {batch.totalTransactions.toLocaleString()}
                      </td>

                      {/* Flagged */}
                      <td className="p-3 text-right">
                        <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                          batch.flaggedCount > 0
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {batch.flaggedCount}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="p-3 text-slate-500 text-[11px]">
                        {new Date(batch.uploadedAt).toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                          isAccepted
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isRejected
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {batch.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedBatch(batch)}
                          className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── REVIEW MODAL ── */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl p-5 space-y-4 font-sans animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Batch Compliance Audit & Ingestion Review</div>
                  <div className="text-[10px] text-slate-500 font-mono">{selectedBatch.id}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedBatch(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Source Bank</span>
                <span className="font-bold text-slate-800">{selectedBatch.bankName}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">File Name</span>
                <span className="font-mono text-slate-800 truncate block">{selectedBatch.fileName}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Transactions Ingested</span>
                <span className="font-mono font-bold text-slate-900">{selectedBatch.totalTransactions.toLocaleString()}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Flagged Mule Nodes</span>
                <span className="font-mono font-bold text-red-600">{selectedBatch.flaggedCount} Accounts</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase">
                Compliance Review Auditor Notes
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add verification notes regarding bank ledger reconciliation..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setSelectedBatch(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Close
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => handleReviewSubmit('REJECTED')}
                  disabled={submittingReview}
                  className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all"
                >
                  Reject Batch
                </button>

                <button
                  onClick={() => handleReviewSubmit('ACCEPTED')}
                  disabled={submittingReview}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  Accept & Merge into Master Graph
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
