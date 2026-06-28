import { Router } from 'express';
import { createEvent, editEvent, getOrganizerEvents, getEventAttendees, removeAttendee, getOrganizerAnalytics } from '../controllers/organizer.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);
router.use(requireRole('ORGANIZER'));

router.get('/analytics', getOrganizerAnalytics);
router.post('/events', createEvent);
router.put('/events/:id', editEvent);
router.get('/events', getOrganizerEvents);
router.get('/events/:id/attendees', getEventAttendees); // <-- ADD THIS ATTENDEE ENDPOINT ROUTE
router.delete('/events/:eventId/attendees/:bookingId', removeAttendee);

export default router;