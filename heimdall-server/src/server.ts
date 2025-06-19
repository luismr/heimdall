import express from 'express';
import cors from 'cors';
import { PostgresDataSource } from './commons/infrastructure/Datasource';
import authRoutes from './auth/api/AuthRoutes';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize database connection if using PostgreSQL
if (process.env.POSTGRES_HOST) {
  PostgresDataSource.initialize()
    .then(() => {
      console.log('PostgreSQL Data Source has been initialized!');
    })
    .catch((err) => {
      console.error('Error during PostgreSQL Data Source initialization:', err);
    });
}

// Routes
app.use('/auth', authRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app; 