// Export all models from a single file for easier importing
const User = require('./User');
const Account = require('./Account');
const Transaction = require('./Transaction');
const Beneficiary = require('./Beneficiary');
const BillPayment = require('./BillPayment');
const AdminRole = require('./AdminRole');
const ActivityLog = require('./ActivityLog');
const Permission = require('./Permission');

module.exports = {
  User,
  Account,
  Transaction,
  Beneficiary,
  BillPayment,
  AdminRole,
  ActivityLog,
  Permission
};