import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  language: 'bn' | 'en';
  setLanguage: (lang: 'bn' | 'en') => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation data
const translations = {
  bn: {
    // Navigation
    'nav.dashboard': 'ড্যাশবোর্ড',
    'nav.transactions': 'লেনদেন',
    'nav.transfer': 'স্থানান্তর',
    'nav.billPayment': 'বিল পেমেন্ট',
    'nav.profile': 'প্রোফাইল',
    'nav.account': 'অ্যাকাউন্ট',
    'nav.beneficiaries': 'সুবিধাভোগী',
    'nav.logout': 'লগআউট',
    
    // Login
    'login.title': 'লগইন',
    'login.accountNumber': 'অ্যাকাউন্ট নম্বর',
    'login.password': 'পাসওয়ার্ড',
    'login.submit': 'লগইন',
    'login.forgotPassword': 'পাসওয়ার্ড ভুলে গেছেন?',
    
    // Dashboard
    'dashboard.title': 'ড্যাশবোর্ড',
    'dashboard.accountBalance': 'অ্যাকাউন্ট ব্যালেন্স',
    'dashboard.availableBalance': 'উপলব্ধ ব্যালেন্স',
    'dashboard.recentTransactions': 'সাম্প্রতিক লেনদেন',
    'dashboard.viewAll': 'সব দেখুন',
    'dashboard.quickActions': 'দ্রুত কার্যক্রম',
    'dashboard.sendMoney': 'টাকা পাঠান',
    'dashboard.payBills': 'বিল পরিশোধ',
    'dashboard.addMoney': 'টাকা যোগ করুন',
    'dashboard.mobileRecharge': 'মোবাইল রিচার্জ',
    
    // Transactions
    'transactions.title': 'লেনদেন',
    'transactions.all': 'সব',
    'transactions.sent': 'পাঠানো',
    'transactions.received': 'প্রাপ্ত',
    'transactions.pending': 'অপেক্ষমাণ',
    'transactions.date': 'তারিখ',
    'transactions.amount': 'পরিমাণ',
    'transactions.type': 'ধরন',
    'transactions.status': 'অবস্থা',
    'transactions.reference': 'রেফারেন্স',
    
    // Transfer
    'transfer.title': 'টাকা স্থানান্তর',
    'transfer.recipientAccount': 'প্রাপকের অ্যাকাউন্ট',
    'transfer.amount': 'পরিমাণ',
    'transfer.description': 'বিবরণ',
    'transfer.submit': 'স্থানান্তর করুন',
    'transfer.success': 'স্থানান্তর সফল হয়েছে',
    'amount': 'পরিমাণ',
    'date': 'তারিখ',
    'time': 'সময়',
    'newTransfer': 'নতুন স্থানান্তর',
    'printReceipt': 'রসিদ প্রিন্ট করুন',
    'startNewTransaction': 'নতুন লেনদেন শুরু করুন',
    
    // Account
    'account': 'অ্যাকাউন্ট বিবরণ',
    'accountSubtitle': 'আপনার অ্যাকাউন্টের তথ্য এবর বিবরণ দেখুন',
    'accountNumber': 'অ্যাকাউন্ট নম্বর',
    'availableBalance': 'উপলব্ধ ব্যালেন্স',
    'accountInformation': 'অ্যাকাউন্ট তথ্য',
    'accountType': 'অ্যাকাউন্টের ধরন',
    'currency': 'মুদ্রা',
    'openDate': 'অ্যাকাউন্ট খোলার তারিখ',
    'status': 'অবস্থা',
    'branchDetails': 'শাখার বিবরণ',
    'branchName': 'শাখার নাম',
    'ifscCode': 'IFSC কোড',
    'quickActions': 'দ্রুত কার্যক্রম',
    'downloadStatement': 'স্টেটমেন্ট ডাউনলোড',
    'requestCheckbook': 'চেকবুক অনুরোধ',
    'updateKyc': 'KYC আপডেট',
    'blockCard': 'কার্ড ব্লক/আনব্লক',
    
    // Dashboard
    'welcome': 'স্বাগতম',
    'welcomeMessage': 'আপনার ব্যাংকিং ড্যাশবোর্ডে আপনাকে স্বাগতম',
    'savingsAccount': 'সঞ্চয় অ্যাকাউন্ট',
    'transfer': 'ট্রান্সফার',
    'sendMoney': 'টাকা পাঠান',
    'transactions': 'লেনদেন',
    'viewHistory': 'ইতিহাস দেখুন',
    'billPayment': 'বিল পেমেন্ট',
    'payBills': 'বিল পরিশোধ',
    'accountDetails': 'বিস্তারিত দেখুন',
    'totalCredits': 'মোট জমা',
    'totalDebits': 'মোট খরচ',
    'totalTransactions': 'মোট লেনদেন',
    'recentTransactions': 'সাম্প্রতিক লেনদেন',
    'viewAll': 'সব দেখুন',
    'noTransactions': 'কোন লেনদেন পাওয়া যায়নি',
    
    // Transfer
    'fillAllFields': 'সকল প্রয়োজনীয় তথ্য পূরণ করুন।',
    'cannotTransferToSelf': 'নিজের অ্যাকাউন্টে টাকা পাঠাতে পারবেন না।',
    'invalidAccount': 'অ্যাকাউন্ট নম্বরটি সঠিক নয়।',
    'amountTooHigh': 'একবারে সর্বোচ্চ ১,০০,০০০ টাকা পাঠাতে পারবেন।',
    'enterPin': 'পিন নম্বর লিখুন।',
    'pinMustBe4Digits': 'পিন নম্বর ৪ সংখ্যার হতে হবে।',
    'transferSuccessful': 'টাকা সফলভাবে পাঠানো হয়েছে!',
    'transferFailed': 'টাকা পাঠাতে সমস্যা হয়েছে।',
    'transferError': 'টাকা পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
    'sendMoneyDescription': 'অন্য অ্যাকাউন্টে টাকা পাঠান',
    'enterDetails': 'তথ্য দিন',
    'confirm': 'নিশ্চিত করুন',
    'verify': 'যাচাই করুন',
    'recipientAccount': 'প্রাপকের অ্যাকাউন্ট নম্বর',
    'recipientAccountPlaceholder': 'প্রাপকের অ্যাকাউন্ট নম্বর লিখুন',
    'validAccount': 'বৈধ অ্যাকাউন্ট',
    'invalidAccountNumber': 'অবৈধ অ্যাকাউন্ট নম্বর',
    'currencyType': 'টাকা',
    'amountPlaceholder': 'পাঠানোর পরিমাণ লিখুন',
    'maxTransferLimit': 'সর্বোচ্চ সীমা: ১,০০,০০০ টাকা',
    'description': 'বিবরণ',
    'optional': 'ঐচ্ছিক',
    'descriptionPlaceholder': 'লেনদেনের বিবরণ লিখুন (ঐচ্ছিক)',
    'next': 'পরবর্তী',
    'transferSuccessMessage': 'আপনার লেনদেন সফলভাবে সম্পন্ন হয়েছে।',
    'transactionId': 'লেনদেন আইডি',
    
    // Transactions
    'transactionDetails': 'লেনদেনের বিস্তারিত',
    'type': 'ধরন',
    'credit': 'জমা',
    'debit': 'খরচ',
    'transactionHistory': 'লেনদেনের ইতিহাস',
    'transactionHistoryDesc': 'আপনার সকল লেনদেনের বিস্তারিত',
    'download': 'ডাউনলোড',
    'searchPlaceholder': 'খুঁজুন...',
    'allTypes': 'সব ধরনের',
    'fromDate': 'শুরুর তারিখ',
    'toDate': 'শেষের তারিখ',
    'clearFilters': 'সব ফিল্টার মুছুন',
    'transactionList': 'লেনদেনের তালিকা',
    'showingResults': 'দেখানো হচ্ছে',
    'of': 'এর মধ্যে',
    'noTransactionsMessage': 'আপনার ফিল্টার অনুযায়ী কোন লেনদেন খুঁজে পাওয়া যায়নি।',
    'to': 'থেকে',
    'results': 'ফলাফল',
    'transactionSummary': 'লেনদেনের সারসংক্ষেপ',
    'totalCredit': 'মোট জমা',
    'totalDebit': 'মোট খরচ',
    'netBalance': 'নেট ব্যালেন্স',
    
    // Beneficiaries
    'beneficiaries': 'সুবিধাভোগী',
    'beneficiariesSubtitle': 'দ্রুত স্থানান্তরের জন্য আপনার সংরক্ষিত প্রাপকদের পরিচালনা করুন',
    'searchBeneficiaries': 'সুবিধাভোগী খুঁজুন...',
    'addBeneficiary': 'সুবিধাভোগী যোগ করুন',
    'editBeneficiary': 'সুবিধাভোগী সম্পাদনা',
    'addNewBeneficiary': 'নতুন সুবিধাভোগী যোগ করুন',
    'fullName': 'পূর্ণ নাম',
    'bankName': 'ব্যাংকের নাম',
    'nickname': 'ডাকনাম',
    'personal': 'ব্যক্তিগত',
    'business': 'ব্যবসায়িক',
    'cancel': 'বাতিল',
    'update': 'আপডেট',
    'add': 'যোগ করুন',
    'noBeneficiaries': 'কোন সুবিধাভোগী পাওয়া যায়নি',
    'noSearchResults': 'আপনার অনুসন্ধানের সাথে কোন সুবিধাভোগী মিলেনি।',
    'addFirstBeneficiary': 'শুরু করতে আপনার প্রথম সুবিধাভোগী যোগ করুন।',
    'addedOn': 'যোগ করা হয়েছে',
    'confirmDelete': 'আপনি কি নিশ্চিত যে এই সুবিধাভোগীকে মুছে ফেলতে চান?',
    
    // Bill Payment
    'electricity': 'বিদ্যুৎ',
    'water': 'পানি',
    'mobile': 'মোবাইল রিচার্জ',
    'internet': 'ইন্টারনেট',
    'paymentSuccessful': 'পেমেন্ট সফল হয়েছে!',
    'billPaymentSubtitle': 'দ্রুত এবং নিরাপদে আপনার ইউটিলিটি বিল পরিশোধ করুন',
    'selectProvider': 'প্রদানকারী নির্বাচন করুন',
    'enterBillDetails': 'বিবরণ লিখুন',
    'backButton': 'পিছনে',
    'continueButton': 'চালিয়ে যান',
    'confirmPayment': 'পেমেন্ট নিশ্চিত করুন',
    'serviceProvider': 'প্রদানকারী',
    'totalAmountDue': 'মোট পরিমাণ',
    'payNow': 'এখনই পরিশোধ করুন',
    
    // Common
    'common.loading': 'লোড হচ্ছে...',
    'common.error': 'ত্রুটি',
    'common.success': 'সফল',
    'common.cancel': 'বাতিল',
    'common.confirm': 'নিশ্চিত করুন',
    'common.save': 'সংরক্ষণ',
    'common.edit': 'সম্পাদনা',
    'common.delete': 'মুছুন',
    'common.search': 'খুঁজুন',
    'common.filter': 'ফিল্টার',
    'common.date': 'তারিখ',
    'common.amount': 'পরিমাণ',
    'common.status': 'অবস্থা',
    'common.actions': 'কার্যক্রম',
    
    // Language
    'language.bengali': 'বাংলা',
    'language.english': 'English',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.transactions': 'Transactions',
    'nav.transfer': 'Transfer',
    'nav.billPayment': 'Bill Payment',
    'nav.profile': 'Profile',
    'nav.account': 'Account',
    'nav.beneficiaries': 'Beneficiaries',
    'nav.logout': 'Logout',
    
    // Login
    'login.title': 'Login',
    'login.accountNumber': 'Account Number',
    'login.password': 'Password',
    'login.submit': 'Login',
    'login.forgotPassword': 'Forgot Password?',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.accountBalance': 'Account Balance',
    'dashboard.availableBalance': 'Available Balance',
    'dashboard.recentTransactions': 'Recent Transactions',
    'dashboard.viewAll': 'View All',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.sendMoney': 'Send Money',
    'dashboard.payBills': 'Pay Bills',
    'dashboard.addMoney': 'Add Money',
    'dashboard.mobileRecharge': 'Mobile Recharge',
    
    // Transactions
    'transactions.title': 'Transactions',
    'transactions.all': 'All',
    'transactions.sent': 'Sent',
    'transactions.received': 'Received',
    'transactions.pending': 'Pending',
    'transactions.date': 'Date',
    'transactions.amount': 'Amount',
    'transactions.type': 'Type',
    'transactions.status': 'Status',
    'transactions.reference': 'Reference',
    
    // Transfer
    'transfer.title': 'Transfer Money',
    'transfer.recipientAccount': 'Recipient Account',
    'transfer.amount': 'Amount',
    'transfer.description': 'Description',
    'transfer.submit': 'Transfer',
    'transfer.success': 'Transfer Successful',
    'amount': 'Amount',
    'date': 'Date',
    'time': 'Time',
    'newTransfer': 'New Transfer',
    'printReceipt': 'Print Receipt',
    'startNewTransaction': 'Start New Transaction',
    
    // Account
    'account': 'Account Details',
    'accountSubtitle': 'View your account information and details',
    'accountNumber': 'Account Number',
    'availableBalance': 'Available Balance',
    'accountInformation': 'Account Information',
    'accountType': 'Account Type',
    'currencyType': 'Currency',
    'openDate': 'Account Opening Date',
    'status': 'Status',
    'branchDetails': 'Branch Details',
    'branchName': 'Branch Name',
    'ifscCode': 'IFSC Code',
    'quickActions': 'Quick Actions',
    'downloadStatement': 'Download Statement',
    'requestCheckbook': 'Request Checkbook',
    'updateKyc': 'Update KYC',
    'blockCard': 'Block/Unblock Card',
    
    // Dashboard
    'welcome': 'Welcome',
    'welcomeMessage': 'Welcome to your banking dashboard',
    'savingsAccount': 'Savings Account',
    'transfer': 'Transfer',
    'sendMoney': 'Send Money',
    'transactions': 'Transactions',
    'viewHistory': 'View History',
    'billPayment': 'Bill Payment',
    'payBills': 'Pay Bills',
    'accountDetails': 'View Details',
    'totalCredits': 'Total Credits',
    'totalDebits': 'Total Debits',
    'totalTransactions': 'Total Transactions',
    'recentTransactions': 'Recent Transactions',
    'viewAll': 'View All',
    'noTransactions': 'No transactions found',
    
    // Transfer
    'fillAllFields': 'Please fill all required fields.',
    'cannotTransferToSelf': 'Cannot transfer to your own account.',
    'invalidAccount': 'Invalid account number.',
    'amountTooHigh': 'Maximum transfer limit is ৳1,00,000.',
    'enterPin': 'Please enter your PIN.',
    'pinMustBe4Digits': 'PIN must be 4 digits.',
    'transferSuccessful': 'Transfer successful!',
    'transferFailed': 'Transfer failed.',
    'transferError': 'Transfer failed. Please try again.',
    'sendMoneyDescription': 'Send money to another account',
    'enterBillDetails': 'Enter Details',
    'confirm': 'Confirm',
    'verify': 'Verify',
    'recipientAccount': 'Recipient Account Number',
    'recipientAccountPlaceholder': 'Enter recipient account number',
    'validAccount': 'Valid Account',
    'invalidAccountNumber': 'Invalid Account Number',
    'currencySymbol': 'Amount',
    'amountPlaceholder': 'Enter amount to send',
    'maxTransferLimit': 'Maximum limit: ৳1,00,000',
    'description': 'Description',
    'optional': 'Optional',
    'descriptionPlaceholder': 'Enter transaction description (optional)',
    'next': 'Next',
    'transferSuccessMessage': 'Your transaction has been completed successfully.',
    'transactionId': 'Transaction ID',
    
    // Transactions
    'transactionDetails': 'Transaction Details',
    'type': 'Type',
    'credit': 'Credit',
    'debit': 'Debit',
    'transactionHistory': 'Transaction History',
    'transactionHistoryDesc': 'View all your transaction details',
    'download': 'Download',
    'searchPlaceholder': 'Search...',
    'allTypes': 'All Types',
    'fromDate': 'From Date',
    'toDate': 'To Date',
    'clearFilters': 'Clear Filters',
    'transactionList': 'Transaction List',
    'showingResults': 'Showing',
    'of': 'of',
    'noTransactionsMessage': 'No transactions found matching your filters.',
    'to': 'to',
    'results': 'results',
    'transactionSummary': 'Transaction Summary',
    'totalCredit': 'Total Credit',
    'totalDebit': 'Total Debit',
    'netBalance': 'Net Balance',
    
    // Beneficiaries
    'beneficiaries': 'Beneficiaries',
    'beneficiariesSubtitle': 'Manage your saved recipients for quick transfers',
    'searchBeneficiaries': 'Search beneficiaries...',
    'addBeneficiary': 'Add Beneficiary',
    'editBeneficiary': 'Edit Beneficiary',
    'addNewBeneficiary': 'Add New Beneficiary',
    'fullName': 'Full Name',
    'bankName': 'Bank Name',
    'nickname': 'Nickname',
    'personal': 'Personal',
    'business': 'Business',
    'cancel': 'Cancel',
    'update': 'Update',
    'add': 'Add',
    'noBeneficiaries': 'No beneficiaries found',
    'noSearchResults': 'No beneficiaries match your search.',
    'addFirstBeneficiary': 'Add your first beneficiary to get started.',
    'addedOn': 'Added on',
    'confirmDelete': 'Are you sure you want to delete this beneficiary?',
    
    // Bill Payment
    'electricity': 'Electricity',
    'water': 'Water',
    'mobile': 'Mobile Recharge',
    'internet': 'Internet',
    'paymentSuccessful': 'Payment Successful!',
    'billPaymentSubtitle': 'Pay your utility bills quickly and securely',
    'selectProvider': 'Select Provider',
    'enterDetails': 'Enter Details',
    'backButton': 'Back',
    'continueButton': 'Continue',
    'confirmPayment': 'Confirm Payment',
    'serviceProvider': 'Provider',
    'totalAmountDue': 'Total Amount',
    'payNow': 'Pay Now',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.date': 'Date',
    'common.amount': 'Amount',
    'common.status': 'Status',
    'common.actions': 'Actions',
    
    // Language
    'language.bengali': 'বাংলা',
    'language.english': 'English',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<'bn' | 'en'>(() => {
    const saved = localStorage.getItem('language');
    return (saved as 'bn' | 'en') || 'bn';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    const currentTranslations = translations[language] as any;
    return currentTranslations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};