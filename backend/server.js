import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { languageDetectionRouter } from './routes/languageDetection.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Frontend URLs
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api', languageDetectionRouter);

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Language Detection API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 