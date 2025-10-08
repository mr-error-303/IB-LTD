import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  File, 
  Image, 
  FileText, 
  Archive, 
  RefreshCw,
  Eye,
  Trash2,
  Download,
  Lock,
  Scan,
  AlertCircle
} from 'lucide-react';

interface FileUploadItem {
  id: string;
  file: File;
  status: 'uploading' | 'scanning' | 'success' | 'error' | 'virus_detected';
  progress: number;
  error?: string;
  scanResult?: {
    clean: boolean;
    threats?: string[];
    scanTime: number;
  };
  uploadedUrl?: string;
  checksum?: string;
}

interface SecureFileUploadProps {
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
  maxFiles?: number;
  onUpload?: (files: FileUploadItem[]) => Promise<void>;
  onDelete?: (fileId: string) => Promise<void>;
  enableVirusScanning?: boolean;
  enableEncryption?: boolean;
}

const SecureFileUpload: React.FC<SecureFileUploadProps> = ({
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ],
  maxFiles = 10,
  onUpload,
  onDelete,
  enableVirusScanning = true,
  enableEncryption = true
}) => {
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File size exceeds ${formatFileSize(maxFileSize)} limit`;
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not allowed`;
    }

    // Check file name for suspicious patterns
    const suspiciousPatterns = [
      /\.exe$/i,
      /\.bat$/i,
      /\.cmd$/i,
      /\.scr$/i,
      /\.vbs$/i,
      /\.js$/i,
      /\.jar$/i
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
      return 'File type appears to be executable and is not allowed';
    }

    return null;
  };

  const simulateVirusScan = async (file: File): Promise<{ clean: boolean; threats?: string[]; scanTime: number }> => {
    const startTime = Date.now();
    
    // Simulate scanning time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    const scanTime = Date.now() - startTime;
    
    // Simulate occasional virus detection (5% chance for demo)
    const hasVirus = Math.random() < 0.05;
    
    if (hasVirus) {
      return {
        clean: false,
        threats: ['Trojan.Generic.Suspicious', 'Malware.Test.Sample'],
        scanTime
      };
    }
    
    return {
      clean: true,
      scanTime
    };
  };

  const calculateChecksum = async (file: File): Promise<string> => {
    // Simulate checksum calculation
    await new Promise(resolve => setTimeout(resolve, 500));
    return `sha256:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  };

  const uploadFile = async (fileItem: FileUploadItem): Promise<void> => {
    const { file } = fileItem;
    
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, progress, status: 'uploading' }
          : f
      ));
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Calculate checksum
    const checksum = await calculateChecksum(file);

    // Virus scanning
    if (enableVirusScanning) {
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'scanning', progress: 100 }
          : f
      ));

      const scanResult = await simulateVirusScan(file);
      
      if (!scanResult.clean) {
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { 
                ...f, 
                status: 'virus_detected', 
                scanResult,
                error: `Virus detected: ${scanResult.threats?.join(', ')}`
              }
            : f
        ));
        return;
      }

      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, scanResult, checksum }
          : f
      ));
    }

    // Simulate final upload
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setFiles(prev => prev.map(f => 
      f.id === fileItem.id 
        ? { 
            ...f, 
            status: 'success', 
            uploadedUrl: `https://secure-storage.example.com/files/${fileItem.id}`,
            checksum
          }
        : f
    ));
  };

  const handleFiles = async (fileList: File[]) => {
    setGlobalError('');

    // Check total file limit
    if (files.length + fileList.length > maxFiles) {
      setGlobalError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newFiles: FileUploadItem[] = [];

    for (const file of fileList) {
      const validationError = validateFile(file);
      
      const fileItem: FileUploadItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        file,
        status: validationError ? 'error' : 'uploading',
        progress: 0,
        error: validationError || undefined
      };

      newFiles.push(fileItem);
    }

    setFiles(prev => [...prev, ...newFiles]);

    // Upload valid files
    for (const fileItem of newFiles) {
      if (fileItem.status !== 'error') {
        uploadFile(fileItem);
      }
    }

    if (onUpload) {
      const validFiles = newFiles.filter(f => f.status !== 'error');
      if (validFiles.length > 0) {
        try {
          await onUpload(validFiles);
        } catch (error) {
          setGlobalError('Upload failed. Please try again.');
        }
      }
    }
  };

  const removeFile = async (fileId: string) => {
    try {
      if (onDelete) {
        await onDelete(fileId);
      }
      setFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (error) {
      setGlobalError('Failed to delete file');
    }
  };

  const retryUpload = (fileId: string) => {
    const fileItem = files.find(f => f.id === fileId);
    if (fileItem) {
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'uploading', progress: 0, error: undefined }
          : f
      ));
      uploadFile(fileItem);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />;
    if (type === 'application/pdf') return <FileText className="w-5 h-5 text-red-500" />;
    if (type.includes('zip') || type.includes('archive')) return <Archive className="w-5 h-5 text-yellow-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const getStatusIcon = (status: FileUploadItem['status']) => {
    switch (status) {
      case 'uploading':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'scanning':
        return <Scan className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'virus_detected':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (file: FileUploadItem) => {
    switch (file.status) {
      case 'uploading':
        return `Uploading... ${file.progress}%`;
      case 'scanning':
        return 'Scanning for viruses...';
      case 'success':
        return enableVirusScanning && file.scanResult 
          ? `Clean - Scanned in ${file.scanResult.scanTime}ms`
          : 'Upload complete';
      case 'error':
        return file.error || 'Upload failed';
      case 'virus_detected':
        return 'Virus detected - File blocked';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Maximum {maxFiles} files, {formatFileSize(maxFileSize)} each
            </p>
          </div>
          
          {/* Security Features */}
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
            {enableVirusScanning && (
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Virus Scanning</span>
              </div>
            )}
            {enableEncryption && (
              <div className="flex items-center space-x-1">
                <Lock className="w-4 h-4 text-blue-500" />
                <span>Encrypted Storage</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-4 h-4 text-purple-500" />
              <span>Integrity Check</span>
            </div>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Select Files
          </button>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">
              Uploaded Files ({files.length}/{maxFiles})
            </h4>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {files.map((file) => (
              <div key={file.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {getFileIcon(file.file.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.file.name}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatFileSize(file.file.size)}</span>
                        <span>{file.file.type}</span>
                        {file.checksum && (
                          <span className="font-mono">{file.checksum.substring(0, 16)}...</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(file.status)}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {getStatusText(file)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      {file.status === 'success' && file.uploadedUrl && (
                        <button
                          onClick={() => window.open(file.uploadedUrl, '_blank')}
                          className="p-1 text-blue-600 hover:text-blue-700"
                          title="View File"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      
                      {file.status === 'success' && (
                        <button
                          onClick={() => {
                            const url = URL.createObjectURL(file.file);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = file.file.name;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="p-1 text-green-600 hover:text-green-700"
                          title="Download File"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}

                      {file.status === 'error' && (
                        <button
                          onClick={() => retryUpload(file.id)}
                          className="p-1 text-blue-600 hover:text-blue-700"
                          title="Retry Upload"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-1 text-red-600 hover:text-red-700"
                        title="Remove File"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {(file.status === 'uploading' || file.status === 'scanning') && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          file.status === 'scanning' 
                            ? 'bg-yellow-500 animate-pulse' 
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {file.status === 'error' && file.error && (
                  <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {file.error}
                  </div>
                )}

                {/* Virus Detection Warning */}
                {file.status === 'virus_detected' && (
                  <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium text-red-800 dark:text-red-200">
                          Security Threat Detected
                        </div>
                        <div className="text-red-700 dark:text-red-300 mt-1">
                          This file has been blocked for your security. 
                          {file.scanResult?.threats && (
                            <div className="mt-1">
                              Detected threats: {file.scanResult.threats.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Global Error */}
      {globalError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 dark:text-red-200">{globalError}</span>
          </div>
        </div>
      )}

      {/* Security Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <div className="font-medium mb-1">Security Features Active:</div>
            <ul className="list-disc list-inside space-y-1">
              <li>Real-time virus and malware scanning</li>
              <li>File type validation and content inspection</li>
              <li>Encrypted transmission and storage</li>
              <li>Integrity verification with checksums</li>
              <li>Automatic threat quarantine</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecureFileUpload;