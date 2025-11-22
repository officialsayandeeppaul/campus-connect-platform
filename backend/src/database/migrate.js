import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Opportunity from '../models/Opportunity.js';
import Collaboration from '../models/Collaboration.js';
import Event from '../models/Event.js';
import Message from '../models/Message.js';

dotenv.config();

/**
 * Database Migration Script
 * Creates indexes and ensures database is properly set up
 */

const migrate = async () => {
  try {
    console.log('');
    console.log('🔄 ============================================');
    console.log('🔄 Running Database Migrations');
    console.log('🔄 ============================================');
    console.log('');

    // Connect to database
    await connectDB();

    console.log('📊 Creating indexes...');
    console.log('');

    // Create indexes for all models
    await User.createIndexes();
    console.log('✅ User indexes created');

    await Opportunity.createIndexes();
    console.log('✅ Opportunity indexes created');

    await Collaboration.createIndexes();
    console.log('✅ Collaboration indexes created');

    await Event.createIndexes();
    console.log('✅ Event indexes created');

    await Message.createIndexes();
    console.log('✅ Message indexes created');

    console.log('');
    console.log('✅ ============================================');
    console.log('✅ Migrations Complete!');
    console.log('✅ ============================================');
    console.log('');
    console.log('📊 Database is ready for use');
    console.log('');
    console.log('💡 Next Steps:');
    console.log('   1. Run: npm run db:seed (to add sample data)');
    console.log('   2. Or run: npm run dev (to start server)');
    console.log('');
    console.log('✅ ============================================');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ ============================================');
    console.error('❌ Migration Failed');
    console.error('❌ ============================================');
    console.error('Error:', error.message);
    console.error('❌ ============================================');
    console.error('');
    process.exit(1);
  }
};

// Run migration
migrate();
