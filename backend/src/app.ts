import * as dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import eventRoutes from './routes/event.routes'; 
import bookingRoutes from './routes/booking.routes'; 
import organizerRoutes from './routes/organizer.routes';

const app: Application = express();
const PORT = process.env.PORT || 5000;

// app.use(cors());


// Dynamically accept local runs or dockerized variables
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] // ✅ PATCH is fully locked in!
}));

app.use(express.json());

// Router Registries
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/events', eventRoutes); // Register event routes at /api/v1/events
app.use('/api/v1/bookings', bookingRoutes); // 
app.use('/api/v1/organizer', organizerRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: "healthy", timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`🚀 BOOKIT Engine safely running on port ${PORT}`);
});