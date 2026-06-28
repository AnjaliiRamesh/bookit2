import { Router } from 'express';
import { getAllEvents, getEventDetails } from '../controllers/event.controller';

const router = Router();

// Public route to get filtered, paginated events
router.get('/', getAllEvents);
router.get('/:idOrSlug', getEventDetails); // <-- ADD THIS DYNAMIC LINE HERE!

export default router;