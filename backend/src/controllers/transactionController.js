const mongoose = require('mongoose');
const { User, Account, Transaction } = require('../models');

// @desc    Deposit money to user's account
// @route   POST /api/transaction/deposit
// @access  Private
const deposit = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount, description } = req.body;
    const userId = req.user.id;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount greater than 0'
      });
    }

    if (amount > 1000000) {
      return res.status(400).json({
        success: false,
        message: 'Maximum deposit amount is $1,000,000'
      });
    }

    // Get user's account
    const account = await Account.findOne({ userId }).session(session);
    if (!account) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    if (!account.isActive) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Account is not active'
      });
    }

    // Store balance before transaction
    const balanceBefore = account.balance;
    const balanceAfter = balanceBefore + amount;

    // Update account balance
    account.balance = balanceAfter;
    await account.save({ session });

    // Create transaction record
    const transaction = new Transaction({
      userId,
      accountId: account._id,
      type: 'deposit',
      amount,
      balanceBefore,
      balanceAfter,
      description: description || `Deposit of $${amount}`,
      status: 'completed'
    });

    await transaction.save({ session });

    // Commit transaction
    await session.commitTransaction();

    // Populate transaction for response
    await transaction.populate('userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Deposit completed successfully',
      data: {
        transaction: {
          id: transaction._id,
          type: transaction.type,
          amount: transaction.amount,
          formattedAmount: transaction.getFormattedAmount(),
          balanceBefore: transaction.balanceBefore,
          balanceAfter: transaction.balanceAfter,
          description: transaction.description,
          transactionRef: transaction.transactionRef,
          status: transaction.status,
          createdAt: transaction.createdAt
        },
        account: {
          balance: account.balance,
          formattedBalance: account.getFormattedBalance()
        }
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Deposit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during deposit',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    session.endSession();
  }
};

// @desc    Withdraw money from user's account
// @route   POST /api/transaction/withdraw
// @access  Private
const withdraw = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount, description } = req.body;
    const userId = req.user.id;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount greater than 0'
      });
    }

    // Get user's account
    const account = await Account.findOne({ userId }).session(session);
    if (!account) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    if (!account.isActive) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Account is not active'
      });
    }

    // Check sufficient balance
    if (!account.hasSufficientBalance(amount)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance for this withdrawal'
      });
    }

    // Store balance before transaction
    const balanceBefore = account.balance;
    const balanceAfter = balanceBefore - amount;

    // Update account balance
    account.balance = balanceAfter;
    await account.save({ session });

    // Create transaction record
    const transaction = new Transaction({
      userId,
      accountId: account._id,
      type: 'withdraw',
      amount,
      balanceBefore,
      balanceAfter,
      description: description || `Withdrawal of $${amount}`,
      status: 'completed'
    });

    await transaction.save({ session });

    // Commit transaction
    await session.commitTransaction();

    // Populate transaction for response
    await transaction.populate('userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Withdrawal completed successfully',
      data: {
        transaction: {
          id: transaction._id,
          type: transaction.type,
          amount: transaction.amount,
          formattedAmount: transaction.getFormattedAmount(),
          balanceBefore: transaction.balanceBefore,
          balanceAfter: transaction.balanceAfter,
          description: transaction.description,
          transactionRef: transaction.transactionRef,
          status: transaction.status,
          createdAt: transaction.createdAt
        },
        account: {
          balance: account.balance,
          formattedBalance: account.getFormattedBalance()
        }
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during withdrawal',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    session.endSession();
  }
};

// @desc    Transfer money to another user's account
// @route   POST /api/transaction/transfer
// @access  Private
const transfer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount, toAccountNumber, description } = req.body;
    const userId = req.user.id;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount greater than 0'
      });
    }

    if (!toAccountNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide recipient account number'
      });
    }

    if (amount > 100000) {
      return res.status(400).json({
        success: false,
        message: 'Maximum transfer amount is $100,000'
      });
    }

    // Get sender's account
    const senderAccount = await Account.findOne({ userId }).session(session);
    if (!senderAccount) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Sender account not found'
      });
    }

    if (!senderAccount.isActive) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Sender account is not active'
      });
    }

    // Get recipient's account
    const recipientAccount = await Account.findOne({ accountNumber: toAccountNumber })
      .populate('userId', 'name email')
      .session(session);

    if (!recipientAccount) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Recipient account not found'
      });
    }

    if (!recipientAccount.isActive) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Recipient account is not active'
      });
    }

    // Check if trying to transfer to same account
    if (senderAccount._id.toString() === recipientAccount._id.toString()) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Cannot transfer to the same account'
      });
    }

    // Check sufficient balance
    if (!senderAccount.hasSufficientBalance(amount)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance for this transfer'
      });
    }

    // Store balances before transaction
    const senderBalanceBefore = senderAccount.balance;
    const recipientBalanceBefore = recipientAccount.balance;
    const senderBalanceAfter = senderBalanceBefore - amount;
    const recipientBalanceAfter = recipientBalanceBefore + amount;

    // Update sender's account balance
    senderAccount.balance = senderBalanceAfter;
    await senderAccount.save({ session });

    // Update recipient's account balance
    recipientAccount.balance = recipientBalanceAfter;
    await recipientAccount.save({ session });

    // Create outgoing transaction record for sender
    const outgoingTransaction = new Transaction({
      userId,
      accountId: senderAccount._id,
      type: 'transfer_out',
      amount,
      balanceBefore: senderBalanceBefore,
      balanceAfter: senderBalanceAfter,
      description: description || `Transfer to ${recipientAccount.userId.name} (${toAccountNumber})`,
      toUserId: recipientAccount.userId._id,
      toAccountId: recipientAccount._id,
      status: 'completed'
    });

    await outgoingTransaction.save({ session });

    // Create incoming transaction record for recipient
    const incomingTransaction = new Transaction({
      userId: recipientAccount.userId._id,
      accountId: recipientAccount._id,
      type: 'transfer_in',
      amount,
      balanceBefore: recipientBalanceBefore,
      balanceAfter: recipientBalanceAfter,
      description: description || `Transfer from ${req.user.name}`,
      toUserId: userId,
      toAccountId: senderAccount._id,
      status: 'completed'
    });

    await incomingTransaction.save({ session });

    // Commit transaction
    await session.commitTransaction();

    // Populate transactions for response
    await outgoingTransaction.populate('toUserId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Transfer completed successfully',
      data: {
        transaction: {
          id: outgoingTransaction._id,
          type: outgoingTransaction.type,
          amount: outgoingTransaction.amount,
          formattedAmount: outgoingTransaction.getFormattedAmount(),
          balanceBefore: outgoingTransaction.balanceBefore,
          balanceAfter: outgoingTransaction.balanceAfter,
          description: outgoingTransaction.description,
          transactionRef: outgoingTransaction.transactionRef,
          status: outgoingTransaction.status,
          createdAt: outgoingTransaction.createdAt,
          recipient: {
            id: recipientAccount.userId._id,
            name: recipientAccount.userId.name,
            email: recipientAccount.userId.email,
            accountNumber: recipientAccount.accountNumber
          }
        },
        account: {
          balance: senderAccount.balance,
          formattedBalance: senderAccount.getFormattedBalance()
        }
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during transfer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    session.endSession();
  }
};

// @desc    Get user's transaction history
// @route   GET /api/transaction/history
// @access  Private
const getTransactionHistory = async (req, res) => {
  try {
    // Development mode - return mock transaction data
    if (process.env.MONGODB_URI === 'memory') {
      const mockTransactions = [
        {
          _id: 'mock-transaction-1',
          type: 'deposit',
          amount: 1000.00,
          balanceBefore: 4000.00,
          balanceAfter: 5000.00,
          description: 'Mock deposit transaction',
          status: 'completed',
          createdAt: new Date(Date.now() - 86400000), // 1 day ago
          transactionRef: 'TXN001'
        },
        {
          _id: 'mock-transaction-2',
          type: 'withdraw',
          amount: 200.00,
          balanceBefore: 5200.00,
          balanceAfter: 5000.00,
          description: 'Mock withdrawal transaction',
          status: 'completed',
          createdAt: new Date(Date.now() - 172800000), // 2 days ago
          transactionRef: 'TXN002'
        },
        {
          _id: 'mock-transaction-3',
          type: 'transfer_out',
          amount: 500.00,
          balanceBefore: 5500.00,
          balanceAfter: 5000.00,
          description: 'Transfer to John Doe',
          status: 'completed',
          createdAt: new Date(Date.now() - 259200000), // 3 days ago
          transactionRef: 'TXN003'
        },
        {
          _id: 'mock-transaction-4',
          type: 'bill_payment',
          amount: 150.00,
          balanceBefore: 5150.00,
          balanceAfter: 5000.00,
          description: 'Electricity Bill Payment',
          status: 'completed',
          createdAt: new Date(Date.now() - 345600000), // 4 days ago
          transactionRef: 'TXN004'
        }
      ];

      const { limit = 10 } = req.query;
      const limitedTransactions = mockTransactions.slice(0, parseInt(limit));

      return res.status(200).json({
        success: true,
        message: 'Transaction history retrieved successfully',
        data: {
          transactions: limitedTransactions,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalTransactions: mockTransactions.length,
            hasNextPage: false,
            hasPrevPage: false
          }
        }
      });
    }
    const userId = req.user.id;
    const { page = 1, limit = 20, type, startDate, endDate } = req.query;

    // Build query
    const query = { userId };

    if (type && ['deposit', 'withdraw', 'transfer_in', 'transfer_out'].includes(type)) {
      query.type = type;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get transactions
    const transactions = await Transaction.find(query)
      .populate('toUserId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalTransactions = await Transaction.countDocuments(query);
    const totalPages = Math.ceil(totalTransactions / limit);

    res.status(200).json({
      success: true,
      message: 'Transaction history retrieved successfully',
      data: {
        transactions: transactions.map(transaction => ({
          id: transaction._id,
          type: transaction.type,
          amount: transaction.amount,
          formattedAmount: transaction.getFormattedAmount(),
          balanceBefore: transaction.balanceBefore,
          balanceAfter: transaction.balanceAfter,
          description: transaction.description,
          transactionRef: transaction.transactionRef,
          status: transaction.status,
          createdAt: transaction.createdAt,
          toUser: transaction.toUserId ? {
            id: transaction.toUserId._id,
            name: transaction.toUserId.name,
            email: transaction.toUserId.email
          } : null
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalTransactions,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching transaction history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get transaction by ID
// @route   GET /api/transaction/:id
// @access  Private
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const transaction = await Transaction.findOne({ _id: id, userId })
      .populate('toUserId', 'name email')
      .populate('userId', 'name email');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction retrieved successfully',
      data: {
        transaction: {
          id: transaction._id,
          type: transaction.type,
          amount: transaction.amount,
          formattedAmount: transaction.getFormattedAmount(),
          balanceBefore: transaction.balanceBefore,
          balanceAfter: transaction.balanceAfter,
          description: transaction.description,
          transactionRef: transaction.transactionRef,
          status: transaction.status,
          createdAt: transaction.createdAt,
          user: {
            id: transaction.userId._id,
            name: transaction.userId.name,
            email: transaction.userId.email
          },
          toUser: transaction.toUserId ? {
            id: transaction.toUserId._id,
            name: transaction.toUserId.name,
            email: transaction.toUserId.email
          } : null
        }
      }
    });

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching transaction',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Pay bill
// @route   POST /api/transaction/bill-payment
// @access  Private
const payBill = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { billType, amount, accountNumber, description, dueDate } = req.body;
    const userId = req.user.id;

    // Validation
    if (!billType || !amount || !accountNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bill type, amount, and account number'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount greater than 0'
      });
    }

    const validBillTypes = ['electricity', 'water', 'gas', 'internet', 'phone', 'credit_card', 'loan', 'insurance'];
    if (!validBillTypes.includes(billType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bill type'
      });
    }

    // Get user's account
    const account = await Account.findOne({ userId }).session(session);
    if (!account) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    if (!account.isActive) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Account is not active'
      });
    }

    // Check sufficient balance
    if (!account.hasSufficientBalance(amount)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance for this bill payment'
      });
    }

    // Store balance before transaction
    const balanceBefore = account.balance;
    const balanceAfter = balanceBefore - amount;

    // Update account balance
    account.balance = balanceAfter;
    await account.save({ session });

    // Create transaction record
    const transaction = new Transaction({
      userId,
      accountId: account._id,
      type: 'bill_payment',
      amount,
      balanceBefore,
      balanceAfter,
      description: description || `${billType.charAt(0).toUpperCase() + billType.slice(1)} bill payment - ${accountNumber}`,
      status: 'completed',
      metadata: {
        billType,
        billAccountNumber: accountNumber,
        dueDate: dueDate || null
      }
    });

    await transaction.save({ session });

    // Commit transaction
    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Bill payment completed successfully',
      data: {
        transaction: {
          id: transaction._id,
          type: transaction.type,
          amount: transaction.amount,
          formattedAmount: transaction.getFormattedAmount(),
          balanceBefore: transaction.balanceBefore,
          balanceAfter: transaction.balanceAfter,
          description: transaction.description,
          transactionRef: transaction.transactionRef,
          status: transaction.status,
          createdAt: transaction.createdAt,
          billType,
          billAccountNumber: accountNumber
        },
        account: {
          balance: account.balance,
          formattedBalance: account.getFormattedBalance()
        }
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Bill payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during bill payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    session.endSession();
  }
};

// @desc    Get transaction statistics
// @route   GET /api/transaction/stats
// @access  Private
const getTransactionStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get user's account
    const account = await Account.findOne({ userId });
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    const stats = await Transaction.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Calculate income vs expenses
    const income = await Transaction.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          type: { $in: ['deposit', 'transfer_in'] },
          createdAt: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const expenses = await Transaction.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          type: { $in: ['withdraw', 'transfer_out', 'bill_payment'] },
          createdAt: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period: `${period} days`,
        currentBalance: account.balance,
        formattedBalance: account.getFormattedBalance(),
        transactionTypes: stats,
        summary: {
          totalIncome: income[0]?.total || 0,
          totalExpenses: expenses[0]?.total || 0,
          netFlow: (income[0]?.total || 0) - (expenses[0]?.total || 0)
        }
      }
    });

  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching transaction statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  deposit,
  withdraw,
  transfer,
  getTransactionHistory,
  getTransactionById,
  payBill,
  getTransactionStats
};