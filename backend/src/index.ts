import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    system: 'Mini ERP + CRM Operations Portal Backend API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', apiRoutes);

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Mini ERP Backend running on http://localhost:${PORT}`);
  console.log(`📡 Health Check available at http://localhost:${PORT}/health`);
});
