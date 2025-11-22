import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

// Load environment variables
dotenv.config();

/**
 * Script to list all admin users
 * Usage: node scripts/listAdmins.js
 */

const listAdmins = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all admin users
    const admins = await User.find({ role: 'admin' }).select('fullName email role createdAt');

    if (admins.length === 0) {
      console.log('⚠️  No admin users found!\n');
      console.log('To create an admin:');
      console.log('1. Go to: http://localhost:5173/secret-admin-register');
      console.log('2. Or run: node scripts/makeUserAdmin.js <email>\n');
    } else {
      console.log(`✅ Found ${admins.length} admin user(s):\n`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      admins.forEach((admin, index) => {
        console.log(`\n${index + 1}. ${admin.fullName}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Created: ${admin.createdAt.toLocaleDateString()}`);
        console.log(`   ID: ${admin._id}`);
      });
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    // Also show total users by role
    const studentCount = await User.countDocuments({ role: 'student' });
    const recruiterCount = await User.countDocuments({ role: 'recruiter' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    console.log('📊 User Statistics:');
    console.log(`   Students: ${studentCount}`);
    console.log(`   Recruiters: ${recruiterCount}`);
    console.log(`   Admins: ${adminCount}`);
    console.log(`   Total: ${studentCount + recruiterCount + adminCount}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

listAdmins();
