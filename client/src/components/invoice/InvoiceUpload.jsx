import React, { useCallback, useState } from "react";
import { FileUpIcon, FileIcon, CheckCircleIcon, XIcon, AlertCircleIcon, Loader2Icon } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

function InvoiceUpload({ onUpload }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setError(null);
      } else {
        setFile(null);
        setError("Please upload a valid PDF file.");
      }
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setError(null);
      } else {
        setFile(null);
        setError("Please upload a valid PDF file.");
      }
    }
  };

  const processTicket = async (file) => {
    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("ticket", file);

      const response = await axios.post(`${API_BASE_URL}/ocr/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data) {
        onUpload(response.data);
      } else {
        throw new Error("Failed to extract ticket details");
      }
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "Failed to process the ticket. Please try again.";
      console.warn("Ticket processing failed:", message);
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessInvoice = () => {
    if (!file) return;
    processTicket(file);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-slide-up { animation: fadeSlideUp 0.4s ease-out both; }
      `}</style>

      <div className="text-center sm:text-left mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Upload Air Ticket
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1.5">
          Upload an air ticket to extract flight details automatically.
        </p>
      </div>

      {!file ? (
        <div
          data-tour="invoice-upload-area"
          className={`relative border-2 border-dashed rounded-2xl p-10 md:p-14 text-center transition-all duration-300 ${
            isDragging
              ? "border-indigo-500 bg-indigo-50/70 dark:bg-indigo-500/10 scale-[1.01]"
              : "border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500/60 bg-white dark:bg-slate-800"
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div
            className={`w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
              isDragging
                ? "bg-indigo-100 dark:bg-indigo-500/20"
                : "bg-slate-50 dark:bg-slate-700"
            }`}
          >
            <FileUpIcon
              className={`w-7 h-7 transition-colors duration-300 ${
                isDragging ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-300"
              }`}
            />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">
            Drag & drop your ticket here
          </h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">or</p>
          <label className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 px-6 rounded-xl cursor-pointer shadow-sm shadow-indigo-200 hover:shadow-md hover:shadow-indigo-300/50 active:scale-[0.98] transition-all duration-200">
            Browse Files
            <input
              type="file"
              className="hidden"
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </label>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
            Supported file: PDF
          </p>
          {error && (
            <div className="mt-5 flex items-start gap-2 text-left text-sm text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 p-3.5 rounded-xl animate-fade-slide-up">
              <AlertCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 dark:bg-slate-800 dark:border-slate-700 dark:text-white animate-fade-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-slate-800 dark:text-white">
              Selected Ticket
            </h3>
            <button
              onClick={handleRemoveFile}
              title="Remove file"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-all duration-200"
            >
              <XIcon className="w-4.5 h-4.5" />
            </button>
          </div>
          <div className="flex items-center p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 rounded-xl mb-6">
            <div className="bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-xl">
              <FileIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="font-medium text-slate-800 dark:text-white truncate">{file.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-2 text-sm text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 p-3.5 rounded-xl animate-fade-slide-up">
              <AlertCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              data-tour="invoice-extract-action"
              onClick={handleProcessInvoice}
              disabled={isProcessing}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isProcessing
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 hover:shadow-md hover:shadow-indigo-300/50 active:scale-[0.98]"
              }`}
            >
              {isProcessing && <Loader2Icon className="w-4 h-4 animate-spin" />}
              {isProcessing ? "Processing..." : "Extract Details"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default InvoiceUpload;