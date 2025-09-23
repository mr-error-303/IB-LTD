// Input validation utilities for enhanced security

export const validateAmount = (amount, options = {}) => {
  const { min = 0.01, max = 1000000, required = true } = options;
  
  if (required && (!amount || amount === '')) {
    return { isValid: false, error: 'Amount is required' };
  }
  
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Please enter a valid amount' };
  }
  
  if (numAmount < min) {
    return { isValid: false, error: `Amount must be at least $${min}` };
  }
  
  if (numAmount > max) {
    return { isValid: false, error: `Amount cannot exceed $${max.toLocaleString()}` };
  }
  
  // Check for reasonable decimal places (max 2)
  if (amount.toString().includes('.') && amount.toString().split('.')[1].length > 2) {
    return { isValid: false, error: 'Amount cannot have more than 2 decimal places' };
  }
  
  return { isValid: true, error: null };
};

export const validateAccountNumber = (accountNumber, options = {}) => {
  const { required = true, minLength = 10, maxLength = 12 } = options;
  
  if (required && (!accountNumber || accountNumber === '')) {
    return { isValid: false, error: 'Account number is required' };
  }
  
  if (!accountNumber) {
    return { isValid: true, error: null };
  }
  
  // Remove any spaces or dashes
  const cleanAccountNumber = accountNumber.replace(/[\s-]/g, '');
  
  if (!/^\d+$/.test(cleanAccountNumber)) {
    return { isValid: false, error: 'Account number must contain only digits' };
  }
  
  if (cleanAccountNumber.length < minLength || cleanAccountNumber.length > maxLength) {
    return { isValid: false, error: `Account number must be between ${minLength} and ${maxLength} digits` };
  }
  
  return { isValid: true, error: null };
};

export const validateDescription = (description, options = {}) => {
  const { required = false, maxLength = 500, minLength = 0 } = options;
  
  if (required && (!description || description.trim() === '')) {
    return { isValid: false, error: 'Description is required' };
  }
  
  if (!description) {
    return { isValid: true, error: null };
  }
  
  const trimmedDescription = description.trim();
  
  if (trimmedDescription.length < minLength) {
    return { isValid: false, error: `Description must be at least ${minLength} characters` };
  }
  
  if (trimmedDescription.length > maxLength) {
    return { isValid: false, error: `Description cannot exceed ${maxLength} characters` };
  }
  
  // Check for potentially harmful content
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmedDescription)) {
      return { isValid: false, error: 'Description contains invalid characters' };
    }
  }
  
  return { isValid: true, error: null };
};

export const validateEmail = (email, options = {}) => {
  const { required = true } = options;
  
  if (required && (!email || email === '')) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!email) {
    return { isValid: true, error: null };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  if (email.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }
  
  return { isValid: true, error: null };
};

export const validatePassword = (password, options = {}) => {
  const { 
    required = true, 
    minLength = 8, 
    requireUppercase = true, 
    requireLowercase = true, 
    requireNumbers = true, 
    requireSpecialChars = true 
  } = options;
  
  if (required && (!password || password === '')) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (!password) {
    return { isValid: true, error: null };
  }
  
  if (password.length < minLength) {
    return { isValid: false, error: `Password must be at least ${minLength} characters long` };
  }
  
  if (requireUppercase && !/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }
  
  if (requireLowercase && !/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }
  
  if (requireNumbers && !/\d/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }
  
  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character' };
  }
  
  return { isValid: true, error: null };
};

export const validatePhoneNumber = (phoneNumber, options = {}) => {
  const { required = false } = options;
  
  if (required && (!phoneNumber || phoneNumber === '')) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  if (!phoneNumber) {
    return { isValid: true, error: null };
  }
  
  // Remove all non-digit characters
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Check for valid length (10-15 digits)
  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }
  
  return { isValid: true, error: null };
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
};

export const validateFormData = (formData, validationRules) => {
  const errors = {};
  let isValid = true;
  
  for (const [field, rules] of Object.entries(validationRules)) {
    const value = formData[field];
    
    for (const rule of rules) {
      const result = rule.validator(value, rule.options);
      
      if (!result.isValid) {
        errors[field] = result.error;
        isValid = false;
        break; // Stop at first error for this field
      }
    }
  }
  
  return { isValid, errors };
};

// Rate limiting helper for client-side
export const createRateLimiter = (maxRequests, windowMs) => {
  const requests = [];
  
  return () => {
    const now = Date.now();
    
    // Remove old requests outside the window
    while (requests.length > 0 && requests[0] <= now - windowMs) {
      requests.shift();
    }
    
    // Check if we've exceeded the limit
    if (requests.length >= maxRequests) {
      return false;
    }
    
    // Add current request
    requests.push(now);
    return true;
  };
};