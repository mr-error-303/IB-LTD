const mongoose = require('mongoose');

/**
 * Database configuration with optimized connection settings
 * Includes connection pooling, timeout configurations, and performance optimizations
 */
class DatabaseConfig {
  constructor() {
    this.isConnected = false;
    this.connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      
      // Connection Pool Settings
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2,  // Minimum number of connections in the pool
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      
      // Timeout Settings
      serverSelectionTimeoutMS: 5000, // How long to try selecting a server
      socketTimeoutMS: 45000, // How long to wait for a response
      connectTimeoutMS: 10000, // How long to wait for initial connection
      
      // Buffering Settings - Fixed deprecated option
      bufferCommands: false, // Disable mongoose buffering
      
      // Heartbeat Settings
      heartbeatFrequencyMS: 10000, // Heartbeat frequency
      
      // Write Concern
      w: 'majority', // Write concern
      wtimeoutMS: 5000, // Write timeout
      
      // Read Preference
      readPreference: 'primary', // Read from primary by default
      
      // Compression
      compressors: ['zlib'], // Enable compression
      
      // Auto Index
      autoIndex: process.env.NODE_ENV !== 'production', // Disable in production
      
      // Auto Create
      autoCreate: true
    };
  }

  /**
   * Connect to MongoDB with optimized settings
   */
  async connect() {
    try {
      const mongoURI = process.env.MONGODB_URI;
      
      if (mongoURI === 'memory') {
        return await this.connectMemoryDB();
      }
      
      if (!mongoURI) {
        throw new Error('MONGODB_URI environment variable is not set');
      }

      // Connect to MongoDB
      await mongoose.connect(mongoURI, this.connectionOptions);
      
      this.isConnected = true;
      this.setupEventListeners();
      
      console.log('✅ Connected to MongoDB with optimized settings');
      console.log(`📊 Connection Pool: ${this.connectionOptions.maxPoolSize} max connections`);
      
      return mongoose.connection;
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  /**
   * Connect to in-memory MongoDB for development
   */
  async connectMemoryDB() {
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      
      console.log('🔧 Development mode: Using in-memory database');
      
      const mongod = await MongoMemoryServer.create({
        instance: {
          dbName: 'ib_ltd_test',
          storageEngine: 'wiredTiger'
        }
      });
      
      const uri = mongod.getUri();
      
      await mongoose.connect(uri, {
        ...this.connectionOptions,
        maxPoolSize: 5, // Smaller pool for memory DB
        minPoolSize: 1
      });
      
      this.isConnected = true;
      this.setupEventListeners();
      
      console.log('✅ Connected to in-memory MongoDB');
      console.log('📝 Note: Using in-memory data - changes will not persist');
      
      return mongoose.connection;
    } catch (error) {
      console.error('❌ In-memory MongoDB connection error:', error);
      throw error;
    }
  }

  /**
   * Setup connection event listeners for monitoring
   */
  setupEventListeners() {
    const connection = mongoose.connection;

    connection.on('connected', () => {
      console.log('📡 Mongoose connected to MongoDB');
    });

    connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });

    connection.on('disconnected', () => {
      console.log('📡 Mongoose disconnected from MongoDB');
      this.isConnected = false;
    });

    connection.on('reconnected', () => {
      console.log('📡 Mongoose reconnected to MongoDB');
      this.isConnected = true;
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    try {
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('📡 Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      collections: Object.keys(mongoose.connection.collections),
      poolSize: mongoose.connection.db?.serverConfig?.poolSize || 'N/A'
    };
  }

  /**
   * Get database statistics
   */
  async getStats() {
    try {
      if (!this.isConnected) {
        return { error: 'Database not connected' };
      }

      const stats = await mongoose.connection.db.stats();
      return {
        collections: stats.collections,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize,
        objects: stats.objects,
        avgObjSize: stats.avgObjSize
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return { error: error.message };
    }
  }
}

module.exports = new DatabaseConfig();