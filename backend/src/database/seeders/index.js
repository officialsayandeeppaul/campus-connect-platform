import dotenv from 'dotenv';
import connectDB from '../../config/database.js';
import User from '../../models/User.js';
import Opportunity from '../../models/Opportunity.js';
import Collaboration from '../../models/Collaboration.js';
import Event from '../../models/Event.js';

dotenv.config();

/**
 * Database Seeder
 * Populates database with sample data for testing
 */

// Sample Users Data
const users = [
  {
    fullName: 'Rahul Kumar',
    email: 'rahul@example.com',
    password: 'password123',
    college: 'Asansol Engineering College',
    year: 3,
    branch: 'Computer Science',
    bio: 'Passionate about web development and open source',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
    interests: ['Web Development', 'AI/ML'],
    phone: '9876543210',
    location: { city: 'Asansol', state: 'West Bengal', country: 'India' },
    socialLinks: {
      linkedin: 'https://linkedin.com/in/rahul-kumar',
      github: 'https://github.com/rahulkumar',
    },
    isVerified: true,
  },
  {
    fullName: 'Priya Sharma',
    email: 'priya@example.com',
    password: 'password123',
    college: 'Durgapur Institute of Technology',
    year: 4,
    branch: 'Information Technology',
    bio: 'UI/UX enthusiast and frontend developer',
    skills: ['React', 'Figma', 'Tailwind CSS', 'JavaScript'],
    interests: ['UI/UX Design', 'Frontend Development'],
    phone: '9876543211',
    location: { city: 'Durgapur', state: 'West Bengal', country: 'India' },
    socialLinks: {
      linkedin: 'https://linkedin.com/in/priya-sharma',
      portfolio: 'https://priyasharma.dev',
    },
    isVerified: true,
  },
  {
    fullName: 'Amit Patel',
    email: 'amit@example.com',
    password: 'password123',
    college: 'Asansol Engineering College',
    year: 2,
    branch: 'Electronics',
    bio: 'IoT and embedded systems developer',
    skills: ['Arduino', 'Python', 'C++', 'IoT'],
    interests: ['IoT', 'Robotics'],
    phone: '9876543212',
    location: { city: 'Asansol', state: 'West Bengal', country: 'India' },
    socialLinks: {
      github: 'https://github.com/amitpatel',
    },
    isVerified: true,
  },
  {
    fullName: 'Sneha Gupta',
    email: 'sneha@example.com',
    password: 'password123',
    college: 'Durgapur Government College',
    year: 3,
    branch: 'Computer Applications',
    bio: 'Data science and machine learning enthusiast',
    skills: ['Python', 'Machine Learning', 'Data Analysis', 'TensorFlow'],
    interests: ['Data Science', 'AI/ML'],
    phone: '9876543213',
    location: { city: 'Durgapur', state: 'West Bengal', country: 'India' },
    socialLinks: {
      linkedin: 'https://linkedin.com/in/sneha-gupta',
    },
    isVerified: true,
  },
  {
    fullName: 'Admin User',
    email: 'admin@campusconnect.com',
    password: 'admin123',
    college: 'Campus Connect Platform',
    year: 5,
    branch: 'Administration',
    bio: 'Platform administrator',
    skills: ['Management', 'Administration'],
    interests: ['Platform Management'],
    role: 'admin',
    isVerified: true,
  },
];

// Sample Opportunities Data
const opportunities = [
  {
    title: 'Frontend Developer Intern',
    company: 'TechStart Solutions',
    description: 'Looking for a passionate frontend developer intern to work on exciting web projects. You will be working with React, Tailwind CSS, and modern web technologies.',
    type: 'internship',
    category: 'Web Development',
    mode: 'remote',
    location: { city: 'Asansol', state: 'West Bengal', isLocal: true },
    duration: { value: 3, unit: 'months', text: '3 months' },
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    stipend: { min: 5000, max: 10000, currency: 'INR', isPaid: true, text: '₹5,000 - ₹10,000/month' },
    skillsRequired: ['React', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS'],
    eligibility: { minYear: 2, maxYear: 4, branches: ['Computer Science', 'IT'] },
    experienceRequired: 'beginner',
    applicationEmail: 'hr@techstart.com',
    benefits: ['Certificate', 'Letter of Recommendation', 'Flexible Hours'],
    tags: ['remote', 'frontend', 'react'],
    status: 'active',
  },
  {
    title: 'Python Developer - Data Analysis',
    company: 'DataMinds Analytics',
    description: 'Join our data analytics team to work on real-world data projects. Experience with Python, Pandas, and data visualization required.',
    type: 'internship',
    category: 'Data Science',
    mode: 'hybrid',
    location: { city: 'Durgapur', state: 'West Bengal', isLocal: true },
    duration: { value: 6, unit: 'months', text: '6 months' },
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    stipend: { min: 8000, max: 15000, currency: 'INR', isPaid: true, text: '₹8,000 - ₹15,000/month' },
    skillsRequired: ['Python', 'Pandas', 'NumPy', 'Data Visualization', 'SQL'],
    eligibility: { minYear: 3, maxYear: 4, branches: ['Computer Science', 'IT', 'MCA'] },
    experienceRequired: 'intermediate',
    applicationEmail: 'careers@dataminds.com',
    benefits: ['Certificate', 'Stipend', 'Job Opportunity'],
    tags: ['hybrid', 'data-science', 'python'],
    status: 'active',
  },
  {
    title: 'Mobile App Development Intern',
    company: 'AppCraft Studios',
    description: 'Work on exciting mobile app projects using React Native. Build cross-platform applications for Android and iOS.',
    type: 'internship',
    category: 'Mobile Development',
    mode: 'onsite',
    location: { city: 'Asansol', state: 'West Bengal', isLocal: true },
    duration: { value: 4, unit: 'months', text: '4 months' },
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
    stipend: { min: 6000, max: 12000, currency: 'INR', isPaid: true, text: '₹6,000 - ₹12,000/month' },
    skillsRequired: ['React Native', 'JavaScript', 'Mobile Development', 'Firebase'],
    eligibility: { minYear: 2, maxYear: 4, branches: ['Computer Science', 'IT', 'Electronics'] },
    experienceRequired: 'beginner',
    applicationEmail: 'jobs@appcraft.com',
    benefits: ['Certificate', 'Hands-on Experience', 'Mentorship'],
    tags: ['onsite', 'mobile', 'react-native'],
    status: 'active',
  },
  {
    title: 'UI/UX Design Intern',
    company: 'DesignHub',
    description: 'Create beautiful and user-friendly designs for web and mobile applications. Work with Figma, Adobe XD, and modern design tools.',
    type: 'internship',
    category: 'UI/UX Design',
    mode: 'remote',
    location: { city: 'Durgapur', state: 'West Bengal', isLocal: true },
    duration: { value: 3, unit: 'months', text: '3 months' },
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
    stipend: { min: 4000, max: 8000, currency: 'INR', isPaid: true, text: '₹4,000 - ₹8,000/month' },
    skillsRequired: ['Figma', 'Adobe XD', 'UI Design', 'UX Research', 'Prototyping'],
    eligibility: { minYear: 2, maxYear: 4 },
    experienceRequired: 'fresher',
    applicationEmail: 'design@designhub.com',
    benefits: ['Certificate', 'Portfolio Projects', 'Flexible Hours'],
    tags: ['remote', 'design', 'ui-ux'],
    status: 'active',
  },
  {
    title: 'Content Writing Intern',
    company: 'ContentCraft Media',
    description: 'Write engaging content for blogs, social media, and marketing materials. Perfect for students interested in digital marketing and content creation.',
    type: 'internship',
    category: 'Content Writing',
    mode: 'remote',
    location: { city: 'Asansol', state: 'West Bengal', isLocal: true },
    duration: { value: 2, unit: 'months', text: '2 months' },
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    stipend: { min: 3000, max: 6000, currency: 'INR', isPaid: true, text: '₹3,000 - ₹6,000/month' },
    skillsRequired: ['Content Writing', 'SEO', 'Social Media', 'Communication'],
    eligibility: { minYear: 1, maxYear: 4 },
    experienceRequired: 'fresher',
    applicationEmail: 'hr@contentcraft.com',
    benefits: ['Certificate', 'Byline Credits', 'Flexible Hours'],
    tags: ['remote', 'content', 'writing'],
    status: 'active',
  },
];

// Sample Collaborations Data
const collaborations = [
  {
    title: 'E-Commerce Website Development',
    description: 'Building a full-stack e-commerce platform with React, Node.js, and MongoDB. Looking for frontend and backend developers to join the team.',
    projectType: 'personal',
    skillsNeeded: ['React', 'Node.js', 'MongoDB', 'Express'],
    rolesNeeded: [
      { role: 'Frontend Developer', count: 2, description: 'Build UI components' },
      { role: 'Backend Developer', count: 1, description: 'Create APIs' },
    ],
    teamSize: { current: 1, required: 4 },
    duration: { value: 3, unit: 'months', text: '3 months' },
    category: 'Web Development',
    techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
    goals: ['Build MVP', 'Deploy to production', 'Add payment gateway'],
    expectedOutcome: 'A fully functional e-commerce platform',
    status: 'open',
    isRemote: true,
    tags: ['web-dev', 'full-stack', 'e-commerce'],
  },
  {
    title: 'AI Chatbot for Student Support',
    description: 'Developing an AI-powered chatbot to help students with common queries. Using Python, NLP, and machine learning.',
    projectType: 'academic',
    skillsNeeded: ['Python', 'Machine Learning', 'NLP', 'TensorFlow'],
    rolesNeeded: [
      { role: 'ML Engineer', count: 2, description: 'Train chatbot model' },
      { role: 'Backend Developer', count: 1, description: 'API integration' },
    ],
    teamSize: { current: 1, required: 4 },
    duration: { value: 4, unit: 'months', text: '4 months' },
    category: 'AI/ML',
    techStack: ['Python', 'TensorFlow', 'Flask', 'NLP'],
    goals: ['Train chatbot', 'Integrate with website', 'Deploy'],
    expectedOutcome: 'Working AI chatbot for student queries',
    status: 'open',
    isRemote: true,
    tags: ['ai', 'ml', 'chatbot'],
  },
  {
    title: 'Smart Campus IoT System',
    description: 'Building an IoT system to monitor and control campus facilities. Need hardware and software developers.',
    projectType: 'research',
    skillsNeeded: ['Arduino', 'Python', 'IoT', 'Sensors', 'Web Development'],
    rolesNeeded: [
      { role: 'Hardware Developer', count: 2, description: 'Build IoT devices' },
      { role: 'Software Developer', count: 1, description: 'Dashboard development' },
    ],
    teamSize: { current: 1, required: 4 },
    duration: { value: 6, unit: 'months', text: '6 months' },
    category: 'IoT',
    techStack: ['Arduino', 'Python', 'MQTT', 'React', 'Firebase'],
    goals: ['Prototype devices', 'Build dashboard', 'Test in campus'],
    expectedOutcome: 'Working IoT system for smart campus',
    status: 'open',
    isRemote: false,
    location: { city: 'Asansol', state: 'West Bengal' },
    tags: ['iot', 'hardware', 'smart-campus'],
  },
];

// Sample Events Data
const events = [
  {
    title: 'Web Development Workshop',
    description: 'Learn modern web development with React, Node.js, and MongoDB. Hands-on workshop with live coding sessions.',
    eventType: 'workshop',
    category: 'Technical',
    startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours later
    startTime: '10:00 AM',
    endTime: '2:00 PM',
    mode: 'hybrid',
    venue: {
      name: 'Asansol Engineering College',
      address: 'Vivekananda Sarani, Kanyapur',
      city: 'Asansol',
      state: 'West Bengal',
    },
    onlineLink: 'https://meet.google.com/abc-defg-hij',
    meetingPlatform: 'google-meet',
    registrationRequired: true,
    registrationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAttendees: 100,
    registrationFee: { amount: 0, isFree: true },
    eligibility: { openToAll: true },
    topics: ['React Basics', 'Node.js APIs', 'MongoDB Integration', 'Deployment'],
    prerequisites: ['Basic JavaScript knowledge', 'Laptop with VS Code'],
    learningOutcomes: ['Build a full-stack app', 'Deploy to production', 'Best practices'],
    benefits: ['Certificate', 'Hands-on Project', 'Networking'],
    certificateProvided: true,
    status: 'upcoming',
    isPublished: true,
    tags: ['workshop', 'web-dev', 'react'],
  },
  {
    title: 'Hackathon 2024 - Build for Change',
    description: '24-hour hackathon to build innovative solutions for social problems. Win prizes and internship opportunities!',
    eventType: 'hackathon',
    category: 'Technical',
    startDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
    endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 24 hours later
    startTime: '9:00 AM',
    endTime: '9:00 AM',
    mode: 'offline',
    venue: {
      name: 'Durgapur Institute of Technology',
      address: 'Rajbandh, Durgapur',
      city: 'Durgapur',
      state: 'West Bengal',
    },
    registrationRequired: true,
    registrationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    maxAttendees: 200,
    registrationFee: { amount: 100, currency: 'INR', isFree: false },
    eligibility: { openToAll: true },
    topics: ['Social Impact', 'Technology Solutions', 'Innovation'],
    prizes: 'First Prize: ₹25,000, Second Prize: ₹15,000, Third Prize: ₹10,000',
    benefits: ['Prizes', 'Internship Opportunities', 'Networking', 'Swag'],
    certificateProvided: true,
    status: 'upcoming',
    isPublished: true,
    tags: ['hackathon', 'competition', 'prizes'],
  },
  {
    title: 'Career Guidance Session - Tech Industry',
    description: 'Learn about career opportunities in the tech industry. Hear from industry experts and get your questions answered.',
    eventType: 'seminar',
    category: 'Career',
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
    startTime: '4:00 PM',
    endTime: '6:00 PM',
    mode: 'online',
    onlineLink: 'https://zoom.us/j/123456789',
    meetingPlatform: 'zoom',
    speakers: [
      {
        name: 'Rajesh Verma',
        designation: 'Senior Software Engineer',
        company: 'Google',
        bio: '10+ years in tech industry',
      },
    ],
    registrationRequired: true,
    registrationDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    registrationFee: { amount: 0, isFree: true },
    eligibility: { openToAll: true },
    topics: ['Career Paths', 'Interview Preparation', 'Skill Development'],
    benefits: ['Career Guidance', 'Q&A Session', 'Networking'],
    certificateProvided: false,
    status: 'upcoming',
    isPublished: true,
    tags: ['career', 'guidance', 'tech'],
  },
];

/**
 * Seed Database
 */
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    console.log('');

    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Opportunity.deleteMany({});
    await Collaboration.deleteMany({});
    await Event.deleteMany({});
    console.log('✅ Existing data cleared');
    console.log('');

    // Insert users
    console.log('👥 Inserting users...');
    const createdUsers = await User.insertMany(users);
    console.log(`✅ ${createdUsers.length} users created`);
    console.log('');

    // Insert opportunities (assign to first user)
    console.log('💼 Inserting opportunities...');
    const opportunitiesWithUser = opportunities.map(opp => ({
      ...opp,
      postedBy: createdUsers[0]._id,
    }));
    const createdOpportunities = await Opportunity.insertMany(opportunitiesWithUser);
    console.log(`✅ ${createdOpportunities.length} opportunities created`);
    console.log('');

    // Insert collaborations (assign to second user)
    console.log('🤝 Inserting collaborations...');
    const collaborationsWithUser = collaborations.map(collab => ({
      ...collab,
      createdBy: createdUsers[1]._id,
    }));
    const createdCollaborations = await Collaboration.insertMany(collaborationsWithUser);
    console.log(`✅ ${createdCollaborations.length} collaborations created`);
    console.log('');

    // Insert events (assign to third user)
    console.log('📅 Inserting events...');
    const eventsWithUser = events.map(event => ({
      ...event,
      organizer: createdUsers[2]._id,
    }));
    const createdEvents = await Event.insertMany(eventsWithUser);
    console.log(`✅ ${createdEvents.length} events created`);
    console.log('');

    // Summary
    console.log('✅ ============================================');
    console.log('🎉 Database Seeded Successfully!');
    console.log('✅ ============================================');
    console.log('');
    console.log('📊 Summary:');
    console.log(`  👥 Users: ${createdUsers.length}`);
    console.log(`  💼 Opportunities: ${createdOpportunities.length}`);
    console.log(`  🤝 Collaborations: ${createdCollaborations.length}`);
    console.log(`  📅 Events: ${createdEvents.length}`);
    console.log('');
    console.log('🔐 Test Credentials:');
    console.log('  Email: rahul@example.com');
    console.log('  Password: password123');
    console.log('');
    console.log('  Admin Email: admin@campusconnect.com');
    console.log('  Admin Password: admin123');
    console.log('');
    console.log('✅ ============================================');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
