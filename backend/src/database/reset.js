import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Opportunity from '../models/Opportunity.js';
import Collaboration from '../models/Collaboration.js';
import Event from '../models/Event.js';
import Message from '../models/Message.js';

dotenv.config();

/**
 * Reset Database
 * Clears all data from all collections
 */

const resetDatabase = async () => {
  try {
    console.log('');
    console.log('⚠️  ============================================');
    console.log('⚠️  WARNING: Database Reset');
    console.log('⚠️  ============================================');
    console.log('⚠️  This will DELETE ALL DATA from the database!');
    console.log('⚠️  ============================================');
    console.log('');

    // Connect to database
    await connectDB();

    console.log('🗑️  Clearing all collections...');
    console.log('');

    // Delete all data
    await User.deleteMany({});
    console.log('✅ Users collection cleared');

    await Opportunity.deleteMany({});
    console.log('✅ Opportunities collection cleared');

    await Collaboration.deleteMany({});
    console.log('✅ Collaborations collection cleared');

    await Event.deleteMany({});
    console.log('✅ Events collection cleared');

    await Message.deleteMany({});
    console.log('✅ Messages collection cleared');

    console.log('');
    console.log('✅ ============================================');
    console.log('✅ Database Reset Complete!');
    console.log('✅ ============================================');
    console.log('');
    console.log('💡 Next Steps:');
    console.log('   1. Run: npm run db:seed (to add sample data)');
    console.log('   2. Or start fresh with your own data');
    console.log('');
    console.log('✅ ============================================');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ ============================================');
    console.error('❌ Database Reset Failed');
    console.error('❌ ============================================');
    console.error('Error:', error.message);
    console.error('❌ ============================================');
    console.error('');
    process.exit(1);
  }
};

// Run reset
resetDatabase();
