import express from 'express';
import cors from 'cors';
import routes from './auth/api/AuthRoutes';

const app = express();

app.use(cors());
app.use(express.json());

// Root handler - sends simple response
app.get('/', (req, res) => {
  res.status(200).send('Heimdall API is running. Access endpoints at /api/');
});

// API routes
app.use('/api', routes);

export default app; 