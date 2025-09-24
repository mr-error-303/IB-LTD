const cache = require('../config/cache');
const { User, Transaction, Account } = require('../models');

/**
 * Query Optimizer Service
 * Provides optimized database queries with caching and performance improvements
 */
class QueryOptimizer {
  constructor() {
    this.defaultCacheTTL = 300; // 5 minutes
    this.shortCacheTTL = 60;    // 1 minute for frequently changing data
    this.longCacheTTL = 1800;   // 30 minutes for stable data
  }

  /**
   * Optimized user queries with caching
   */
  async getUsers(query = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
      populate = [],
      select = '-password'
    } = options;

    const cacheKey = cache.generateQueryKey('User', { query, page, limit, sort, select });
    
    return await cache.wrap(
      cacheKey,
      async () => {
        const skip = (page - 1) * limit;
        
        let queryBuilder = User.find(query)
          .select(select)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(); // Use lean() for better performance

        // Add population if specified
        if (populate.length > 0) {
          populate.forEach(pop => {
            queryBuilder = queryBuilder.populate(pop);
          });
        }

        const [users, total] = await Promise.all([
          queryBuilder.exec(),
          User.countDocuments(query)
        ]);

        return {
          users,
          total,
          page,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + users.length < total
        };
      },
      this.shortCacheTTL,
      ['users', `users:page:${page}`]
    );
  }

  /**
   * Optimized transaction queries with caching
   */
  async getTransactions(query = {}, options = {}) {
    const {
      page = 1,
      limit = 20,
      sort = { createdAt: -1 },
      populate = ['userId', 'accountId'],
      select = null
    } = options;

    const cacheKey = cache.generateQueryKey('Transaction', { query, page, limit, sort });
    
    return await cache.wrap(
      cacheKey,
      async () => {
        const skip = (page - 1) * limit;
        
        let queryBuilder = Transaction.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean();

        if (select) {
          queryBuilder = queryBuilder.select(select);
        }

        // Optimized population
        if (populate.includes('userId')) {
          queryBuilder = queryBuilder.populate('userId', 'name email');
        }
        if (populate.includes('accountId')) {
          queryBuilder = queryBuilder.populate('accountId', 'accountNumber');
        }

        const [transactions, total] = await Promise.all([
          queryBuilder.exec(),
          Transaction.countDocuments(query)
        ]);

        return {
          transactions,
          total,
          page,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + transactions.length < total
        };
      },
      this.shortCacheTTL,
      ['transactions', `transactions:page:${page}`]
    );
  }

  /**
   * Get user dashboard data with optimized queries
   */
  async getUserDashboard(userId) {
    const cacheKey = cache.generateUserKey(userId, 'dashboard');
    
    return await cache.wrap(
      cacheKey,
      async () => {
        // Use aggregation for better performance
        const [user, account, transactionStats, recentTransactions] = await Promise.all([
          User.findById(userId).select('-password').lean(),
          Account.findOne({ userId }).lean(),
          this.getUserTransactionStats(userId),
          Transaction.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('toUserId', 'name email')
            .lean()
        ]);

        return {
          user,
          account,
          transactionStats,
          recentTransactions
        };
      },
      this.shortCacheTTL,
      ['users', `user:${userId}`]
    );
  }

  /**
   * Get admin dashboard statistics with caching
   */
  async getAdminDashboardStats() {
    const cacheKey = 'admin:dashboard:stats';
    
    return await cache.wrap(
      cacheKey,
      async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Use aggregation pipelines for better performance
        const [
          userStats,
          transactionStats,
          balanceStats
        ] = await Promise.all([
          this.getUserStats(),
          this.getTransactionStats(today),
          this.getBalanceStats()
        ]);

        return {
          ...userStats,
          ...transactionStats,
          ...balanceStats,
          lastUpdated: new Date()
        };
      },
      this.shortCacheTTL,
      ['admin', 'dashboard']
    );
  }

  /**
   * Optimized user statistics aggregation
   */
  async getUserStats() {
    const cacheKey = 'admin:stats:users';
    
    return await cache.wrap(
      cacheKey,
      async () => {
        const [totalUsers, activeUsers, pendingUsers, verifiedUsers] = await Promise.all([
          User.countDocuments(),
          User.countDocuments({ isActive: true }),
          User.countDocuments({ status: 'pending' }),
          User.countDocuments({ isVerified: true })
        ]);

        return {
          totalUsers,
          activeUsers,
          pendingUsers,
          verifiedUsers,
          inactiveUsers: totalUsers - activeUsers
        };
      },
      this.defaultCacheTTL,
      ['users', 'stats']
    );
  }

  /**
   * Optimized transaction statistics aggregation
   */
  async getTransactionStats(startDate = null) {
    const cacheKey = startDate ? 
      `admin:stats:transactions:${startDate.toISOString().split('T')[0]}` : 
      'admin:stats:transactions:all';
    
    return await cache.wrap(
      cacheKey,
      async () => {
        const matchStage = startDate ? { createdAt: { $gte: startDate } } : {};
        
        const stats = await Transaction.aggregate([
          { $match: matchStage },
          {
            $group: {
              _id: null,
              totalTransactions: { $sum: 1 },
              totalAmount: { $sum: '$amount' },
              avgAmount: { $avg: '$amount' },
              pendingCount: {
                $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
              },
              completedCount: {
                $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
              },
              failedCount: {
                $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
              }
            }
          }
        ]);

        const typeStats = await Transaction.aggregate([
          { $match: matchStage },
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 },
              totalAmount: { $sum: '$amount' }
            }
          }
        ]);

        return {
          ...(stats[0] || {}),
          typeBreakdown: typeStats.reduce((acc, stat) => {
            acc[stat._id] = {
              count: stat.count,
              totalAmount: stat.totalAmount
            };
            return acc;
          }, {})
        };
      },
      startDate ? this.shortCacheTTL : this.defaultCacheTTL,
      ['transactions', 'stats']
    );
  }

  /**
   * Optimized balance statistics
   */
  async getBalanceStats() {
    const cacheKey = 'admin:stats:balances';
    
    return await cache.wrap(
      cacheKey,
      async () => {
        const balanceStats = await Account.aggregate([
          {
            $group: {
              _id: null,
              totalBalance: { $sum: '$balance' },
              avgBalance: { $avg: '$balance' },
              maxBalance: { $max: '$balance' },
              minBalance: { $min: '$balance' },
              totalAccounts: { $sum: 1 },
              activeAccounts: {
                $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
              }
            }
          }
        ]);

        return balanceStats[0] || {};
      },
      this.defaultCacheTTL,
      ['accounts', 'balances', 'stats']
    );
  }

  /**
   * Get user transaction statistics
   */
  async getUserTransactionStats(userId) {
    const cacheKey = cache.generateUserKey(userId, 'transaction-stats');
    
    return await cache.wrap(
      cacheKey,
      async () => {
        const stats = await Transaction.aggregate([
          { $match: { userId: userId } },
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 },
              totalAmount: { $sum: '$amount' }
            }
          }
        ]);

        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);

        const [thisMonthCount, totalCount] = await Promise.all([
          Transaction.countDocuments({ 
            userId, 
            createdAt: { $gte: thisMonth } 
          }),
          Transaction.countDocuments({ userId })
        ]);

        return {
          transactionStats: stats.reduce((acc, stat) => {
            acc[stat._id] = {
              count: stat.count,
              totalAmount: stat.totalAmount
            };
            return acc;
          }, {}),
          thisMonthTransactions: thisMonthCount,
          totalTransactions: totalCount
        };
      },
      this.defaultCacheTTL,
      ['transactions', `user:${userId}`]
    );
  }

  /**
   * Search users with optimized query and caching
   */
  async searchUsers(searchTerm, filters = {}, options = {}) {
    const { page = 1, limit = 20 } = options;
    
    // Build optimized search query
    const query = { ...filters };
    
    if (searchTerm) {
      // Use text index if available, otherwise regex
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    const cacheKey = cache.generateQueryKey('UserSearch', { searchTerm, filters, page, limit });
    
    return await cache.wrap(
      cacheKey,
      async () => {
        return await this.getUsers(query, { page, limit, select: '-password' });
      },
      this.shortCacheTTL,
      ['users', 'search']
    );
  }

  /**
   * Search transactions with optimized query and caching
   */
  async searchTransactions(searchTerm, filters = {}, options = {}) {
    const { page = 1, limit = 20 } = options;
    
    const query = { ...filters };
    
    if (searchTerm) {
      query.$or = [
        { description: { $regex: searchTerm, $options: 'i' } },
        { transactionRef: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    const cacheKey = cache.generateQueryKey('TransactionSearch', { searchTerm, filters, page, limit });
    
    return await cache.wrap(
      cacheKey,
      async () => {
        return await this.getTransactions(query, { page, limit });
      },
      this.shortCacheTTL,
      ['transactions', 'search']
    );
  }

  /**
   * Invalidate cache for specific entities
   */
  async invalidateUserCache(userId) {
    await Promise.all([
      cache.invalidateByTag(`user:${userId}`),
      cache.invalidateByTag('users'),
      cache.invalidateByTag('stats')
    ]);
  }

  async invalidateTransactionCache(userId = null) {
    const tags = ['transactions', 'stats'];
    if (userId) {
      tags.push(`user:${userId}`);
    }
    
    await Promise.all(tags.map(tag => cache.invalidateByTag(tag)));
  }

  async invalidateAdminCache() {
    await Promise.all([
      cache.invalidateByTag('admin'),
      cache.invalidateByTag('dashboard'),
      cache.invalidateByTag('stats')
    ]);
  }

  /**
   * Get query optimization statistics
   */
  async getOptimizationStats() {
    const cacheStats = await cache.getStats();
    
    return {
      cache: cacheStats,
      queryOptimizer: {
        defaultCacheTTL: this.defaultCacheTTL,
        shortCacheTTL: this.shortCacheTTL,
        longCacheTTL: this.longCacheTTL
      }
    };
  }
}

module.exports = new QueryOptimizer();