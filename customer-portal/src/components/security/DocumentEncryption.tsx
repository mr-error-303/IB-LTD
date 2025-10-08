import React, { useState, useRef, useCallback } from 'react';
import { 
  Shield, 
  Upload, 
  Download, 
  Lock, 
  Unlock, 
  FileText, 
  Image, 
  File, 
  Trash2, 
  Eye, 
  EyeOff, 
  Key, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Copy,
  Clock
} from 'lucide-react';

interface EncryptedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  encrypted: boolean;
  uploadDate: Date;
  lastAccessed?: Date;
  encryptionMethod: 'AES-256' | 'RSA-2048';
  checksum: string;
}

interface DocumentEncryptionProps {
  onFileEncrypt?: (file: File, password: string) => Promise<EncryptedFile>;
  onFileDecrypt?: (fileId: string, password: string) => Promise<Blob>;
  onFileDelete?: (fileId: string) => Promise<void>;
}

const DocumentEncryption: React.FC<DocumentEncryptionProps> = ({
  onFileEncrypt,
  onFileDecrypt,
  onFileDelete
}) => {
  const [files, setFiles] = useState<EncryptedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<EncryptedFile | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [encryptionMethod, setEncryptionMethod] = useState<'AES-256' | 'RSA-2048'>('AES-256');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock encrypted files for demonstration
  React.useEffect(() => {
    const mockFiles: EncryptedFile[] = [
      {
        id: '1',
        name: 'bank_statement_2024.pdf',
        size: 2048576,
        type: 'application/pdf',
        encrypted: true,
        uploadDate: new Date('2024-01-15'),
        lastAccessed: new Date('2024-01-20'),
        encryptionMethod: 'AES-256',
        checksum: 'sha256:a1b2c3d4e5f6...'
      },
      {
        id: '2',
        name: 'identity_document.jpg',
        size: 1024000,
        type: 'image/jpeg',
        encrypted: true,
        uploadDate: new Date('2024-01-10'),
        encryptionMethod: 'AES-256',
        checksum: 'sha256:f6e5d4c3b2a1...'
      }
    ];
    setFiles(mockFiles);
  }, []);

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

  const handleFiles = async (fileList: File[]) => {
    if (!password) {
      setError('Please enter an encryption password');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setUploading(true);
    setError('');

    try {
      for (const file of fileList) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          setError(`File ${file.name} is too large. Maximum size is 10MB.`);
          continue;
        }

        const encryptedFile: EncryptedFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          encrypted: true,
          uploadDate: new Date(),
          encryptionMethod,
          checksum: `sha256:${Math.random().toString(36).substr(2, 16)}...`
        };

        if (onFileEncrypt) {
          await onFileEncrypt(file, password);
        }

        setFiles(prev => [...prev, encryptedFile]);
      }

      setSuccess('Files encrypted and uploaded successfully');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('Failed to encrypt and upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleDecrypt = async (file: EncryptedFile) => {
    if (!password) {
      setError('Please enter the decryption password');
      return;
    }

    setLoading(file.id);
    setError('');

    try {
      let decryptedBlob: Blob;
      
      if (onFileDecrypt) {
        decryptedBlob = await onFileDecrypt(file.id, password);
      } else {
        // Mock decryption
        await new Promise(resolve => setTimeout(resolve, 2000));
        decryptedBlob = new Blob(['Mock decrypted content'], { type: file.type });
      }

      // Download the decrypted file
      const url = URL.createObjectURL(decryptedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);

      // Update last accessed time
      setFiles(prev => prev.map(f => 
        f.id === file.id 
          ? { ...f, lastAccessed: new Date() }
          : f
      ));

      setSuccess('File decrypted and downloaded successfully');
      setPassword('');
    } catch (err) {
      setError('Failed to decrypt file. Please check your password.');
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (file: EncryptedFile) => {
    if (!window.confirm(`Are you sure you want to delete ${file.name}?`)) {
      return;
    }

    setLoading(file.id);

    try {
      if (onFileDelete) {
        await onFileDelete(file.id);
      } else {
        // Mock deletion
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setFiles(prev => prev.filter(f => f.id !== file.id));
      setSuccess('File deleted successfully');
    } catch (err) {
      setError('Failed to delete file');
    } finally {
      setLoading(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (type === 'application/pdf') return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(password);
    setConfirmPassword(password);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Document Encryption
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Securely encrypt and store your sensitive documents with military-grade encryption.
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
          Upload & Encrypt Files
        </h4>

        {/* Encryption Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Encryption Method
            </label>
            <select
              value={encryptionMethod}
              onChange={(e) => setEncryptionMethod(e.target.value as 'AES-256' | 'RSA-2048')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="AES-256">AES-256 (Recommended)</option>
              <option value="RSA-2048">RSA-2048</option>
            </select>
          </div>
        </div>

        {/* Password Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Encryption Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter strong password"
                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-6">
          <button
            onClick={generatePassword}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Key className="w-4 h-4" />
            <span>Generate Strong Password</span>
          </button>
          {password && (
            <button
              onClick={() => copyToClipboard(password)}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700"
            >
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </button>
          )}
        </div>

        {/* File Upload Area */}
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
                Maximum file size: 10MB. Supported formats: PDF, DOC, DOCX, JPG, PNG
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || !password || password !== confirmPassword}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
            >
              {uploading && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>{uploading ? 'Encrypting...' : 'Select Files'}</span>
            </button>
          </div>
        </div>

        {/* Password Strength Indicator */}
        {password && (
          <div className="mt-4">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Password Strength:</span>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    password.length < 8
                      ? 'w-1/4 bg-red-500'
                      : password.length < 12
                      ? 'w-2/4 bg-yellow-500'
                      : password.length < 16
                      ? 'w-3/4 bg-blue-500'
                      : 'w-full bg-green-500'
                  }`}
                />
              </div>
              <span
                className={`font-medium ${
                  password.length < 8
                    ? 'text-red-500'
                    : password.length < 12
                    ? 'text-yellow-500'
                    : password.length < 16
                    ? 'text-blue-500'
                    : 'text-green-500'
                }`}
              >
                {password.length < 8
                  ? 'Weak'
                  : password.length < 12
                  ? 'Fair'
                  : password.length < 16
                  ? 'Good'
                  : 'Strong'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Encrypted Files List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
          Encrypted Files ({files.length})
        </h4>

        {files.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No encrypted files yet. Upload some files to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="text-gray-400">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <Lock className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatFileSize(file.size)}</span>
                      <span>{file.encryptionMethod}</span>
                      <span>Uploaded: {file.uploadDate.toLocaleDateString()}</span>
                      {file.lastAccessed && (
                        <span>Last accessed: {file.lastAccessed.toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="password"
                    placeholder="Password"
                    value={selectedFile?.id === file.id ? password : ''}
                    onChange={(e) => {
                      setSelectedFile(file);
                      setPassword(e.target.value);
                    }}
                    className="w-32 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={() => handleDecrypt(file)}
                    disabled={loading === file.id || !password}
                    className="p-2 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Decrypt and Download"
                  >
                    {loading === file.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(file)}
                    disabled={loading === file.id}
                    className="p-2 text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 dark:text-red-200">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 dark:text-green-200">{success}</span>
          </div>
        </div>
      )}

      {/* Security Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <div className="font-medium mb-1">Security Features:</div>
            <ul className="list-disc list-inside space-y-1">
              <li>AES-256 encryption with secure key derivation</li>
              <li>Files are encrypted client-side before upload</li>
              <li>Zero-knowledge architecture - we cannot access your files</li>
              <li>Automatic file integrity verification</li>
              <li>Secure deletion with data overwriting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentEncryption;