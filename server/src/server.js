import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';
try {
  await connectDB(env.MONGODB_URI);
  const app = createApp();
  app.listen(env.PORT, () => console.log(`Ledgr API listening on http://localhost:${env.PORT}`));
} catch (error) {
  console.error('Could not start Ledgr API. Check MONGODB_URI and database availability.', error.message);
  process.exit(1);
}
