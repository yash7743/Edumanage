/**
 * Seeds a single admin account into the database.
 * Credentials must be provided via environment variables and are NOT
 * hardcoded or printed. Run with: `npm run seed` from the `server/` folder.
 */
require('dotenv').config();
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const User = require('../models/User');

const REQUIRED_VARS = ['MONGO_URI', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];

const seedAdmin = async () => {
  const missing = REQUIRED_VARS.filter((v) => !process.env[v]);
  if (missing.length) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB for seeding...');

  const admin = {
    name: process.env.ADMIN_NAME || 'Administrator',
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    role: 'admin',
    adminRole: process.env.ADMIN_ROLE || 'super_admin',
  };

  const existing = await User.findOne({ email: admin.email.toLowerCase() });
  if (existing) {
    console.log(`Skipped (already exists): ${admin.email}`);
  } else {
    await User.create(admin); // password hashed via model hook
    console.log(`Created admin: ${admin.email}`);
  }

  console.log('\nAdmin seeding complete.');
  console.log('(Credentials are taken from your .env — not printed here for safety.)');

  await mongoose.disconnect();
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
