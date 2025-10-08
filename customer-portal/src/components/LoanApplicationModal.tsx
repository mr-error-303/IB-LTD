import React from 'react';
import { CheckCircleIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface LoanApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationData: {
    applicationId: string;
    applicantName: string;
    loanAmount: string;
    loanType: string;
    status: 'In Review' | 'Pending';
    submissionDate: string;
  };
  onTrackStatus: () => void;
}

const LoanApplicationModal: React.FC<LoanApplicationModalProps> = ({
  isOpen,
  onClose,
  applicationData,
  onTrackStatus
}) => {
  if (!isOpen) return null;

  const getStatusIcon = () => {
    switch (applicationData.status) {
      case 'In Review':
        return <ClockIcon className="h-8 w-8 text-blue-500" />;
      case 'Pending':
        return <ClockIcon className="h-8 w-8 text-yellow-500" />;
      default:
        return <CheckCircleIcon className="h-8 w-8 text-green-500" />;
    }
  };

  const getStatusColor = () => {
    switch (applicationData.status) {
      case 'In Review':
        return 'text-blue-600 bg-blue-50';
      case 'Pending':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-green-600 bg-green-50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <h3 className="text-lg font-semibold text-gray-900">
                Application Submitted Successfully
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Status Badge */}
            <div className="mb-6 text-center">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor()}`}>
                Current Status: {applicationData.status}
              </span>
            </div>

            {/* Application Details */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Application Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Application ID:</span>
                    <span className="font-medium text-gray-900">{applicationData.applicationId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Applicant Name:</span>
                    <span className="font-medium text-gray-900">{applicationData.applicantName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loan Type:</span>
                    <span className="font-medium text-gray-900">{applicationData.loanType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loan Amount:</span>
                    <span className="font-medium text-gray-900">৳{applicationData.loanAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Submission Date:</span>
                    <span className="font-medium text-gray-900">{applicationData.submissionDate}</span>
                  </div>
                </div>
              </div>

              {/* Information Section */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Our team will review your application within 2-3 business days</li>
                  <li>• You will receive updates via email and SMS</li>
                  <li>• Additional documents may be requested if needed</li>
                  <li>• Final decision will be communicated within 5-7 business days</li>
                </ul>
              </div>

              {/* Important Notes */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-yellow-900 mb-2">Important Notes</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Keep your application ID safe for future reference</li>
                  <li>• Ensure your contact information is up to date</li>
                  <li>• Check your email regularly for updates</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex space-x-3">
              <button
                onClick={onTrackStatus}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Track Loan Status
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanApplicationModal;