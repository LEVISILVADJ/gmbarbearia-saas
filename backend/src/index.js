import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import tenantsRoutes from './routes/tenants.js';
import usersRoutes from './routes/users.js';
import subscriptionsRoutes from './routes/subscriptions.js';
import adminRoutes from './routes/admin.js';
import webhooksRoutes from './routes/webhooks.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { authenticateJWT } from './middleware/auth.js';

// Import database
import { initializeDatabase } from './db/index.js';

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/admin', authenticateJWT, adminRoutes);
app.use('/api/webhooks', webhooksRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Error handling middleware
app.use(errorHandler);

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

export default app;