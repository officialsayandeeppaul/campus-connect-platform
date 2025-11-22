import mongoose from 'mongoose';

/**
 * Connect to MongoDB Database
 * Supports both local and MongoDB Atlas connections
 */
const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.NODE_ENV === 'production' 
      ? process.env.MONGODB_URI_PROD 
      : process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    const options = {
      // useNewUrlParser: true, // No longer needed in Mongoose 6+
      // useUnifiedTopology: true, // No longer needed in Mongoose 6+
      maxPoolSize: 10, // Maximum number of connections in the pool
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    const conn = await mongoose.connect(MONGODB_URI, options);

    console.log('');
    console.log('✅ ============================================');
    console.log(`🗄️  MongoDB Connected Successfully`);
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`🏷️  Database: ${conn.connection.name}`);
    console.log(`🔌 Port: ${conn.connection.port}`);
    console.log('✅ ============================================');
    console.log('');

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('');
    console.error('❌ ============================================');
    console.error('❌ MongoDB Connection Failed');
    console.error('❌ ============================================');
    console.error('Error:', error.message);
    console.error('');
    console.error('💡 Troubleshooting:');
    console.error('1. Check if MongoDB is running (local)');
    console.error('2. Verify MONGODB_URI in .env file');
    console.error('3. Check network connection (Atlas)');
    console.error('4. Verify database user credentials');
    console.error('5. Check IP whitelist (Atlas)');
    console.error('❌ ============================================');
    console.error('');
    process.exit(1);
  }
};

export default connectDB;
