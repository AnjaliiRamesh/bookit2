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




app.use(cors({
  origin: 'http://localhost:3000', // Explicitly allow your Next.js application port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
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