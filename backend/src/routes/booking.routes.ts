// import { Router } from 'express';
// import { createBooking } from '../controllers/booking.controller';
// import { authenticateToken } from '../middlewares/auth.middleware';

// const router = Router();

// // Protected route: Must be logged in to buy a ticket
// router.post('/', authenticateToken, router.use(createBooking));

// export default router;


import { Router } from 'express';
import { createBooking, getUserBookings, cancelBooking } from '../controllers/booking.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Protected route: Pass the controller directly as the final callback function!
router.post('/', authenticateToken, createBooking); 
router.get('/my-bookings', authenticateToken, getUserBookings); 
router.patch('/:id/cancel', authenticateToken, cancelBooking);


export default router;