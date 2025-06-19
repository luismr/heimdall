import express from 'express';
import cors from 'cors';
import { AppDataSource } from './config/data-source';
import authRoutes from './auth/api/AuthRoutes';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize database connection if using PostgreSQL
if (process.env.DB_TYPE?.toLowerCase() === 'postgres') {
  AppDataSource.initialize()
    .then(() => {
      console.log('Data Source has been initialized!');
    })
    .catch((err) => {
      console.error('Error during Data Source initialization:', err);
      process.exit(1);
    });
}

// Routes
app.use('/auth', authRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app; 