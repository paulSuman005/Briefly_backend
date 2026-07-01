import cron from 'node-cron';
import User from '../models/user.schema.js';

// Run every night at 12:00 AM
cron.schedule('0 0 * * *', async () => {
  const now = new Date();

  try {
    const result = await User.deleteMany({
      isVerified: false,
      emailVerificationExpiry: { $lt: now }
    });

    if (result.deletedCount > 0) {
      console.log(`Deleted ${result.deletedCount} unverified users.`);
    }
  } catch (err) {
    console.error('Error cleaning up unverified users:', err);
  }
});