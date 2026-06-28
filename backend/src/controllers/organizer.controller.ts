import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import prisma from '../config/db';

// CREATE EVENT
export const createEvent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, description, venue, dateTime, capacity, price } = req.body;
    const organizerId = req.user?.userId;

    if (!organizerId) {
      res.status(401).json({ message: 'Unauthorized: Organizer identity missing' });
      return;
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

    const newEvent = await prisma.event.create({
      data: {
        title,
        slug,
        description,
        date: new Date(dateTime),
        location: venue, // maps to location in our schema
        price: parseFloat(price) || 0.0,
        capacity: parseInt(capacity),
        availableSeats: parseInt(capacity),
        organizerId
      }
    });

    res.status(201).json({ message: 'Event published successfully', event: newEvent });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error while creating event', error });
  }
};

// EDIT EVENT WITH REVENUE & CAPACITY PROTECTIONS
export const editEvent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const eventId = String(req.params.id);
    const organizerId = req.user?.userId;
    const { title, description, venue, dateTime, capacity, price } = req.body;

    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { bookings: { where: { status: 'CONFIRMED' } } } } }
    });

    if (!existingEvent) {
      res.status(404).json({ message: 'Target event does not exist' });
      return;
    }
    if (existingEvent.organizerId !== organizerId) {
      res.status(403).json({ message: 'Forbidden: You do not own this asset group' });
      return;
    }

    const ticketsSold = existingEvent._count.bookings;

    // BUSINESS GUARD RULE: Don't allow capacity to drop below tickets already sold
    if (capacity && parseInt(capacity) < ticketsSold) {
      res.status(400).json({ 
        message: `Capacity reduction rejected. Cannot scale down below ${ticketsSold} seats already booked by attendees.` 
      });
      return;
    }

    // Re-calculate live available seats based on new capacity setting
    let updatedAvailableSeats = existingEvent.availableSeats;
    if (capacity) {
      const newCapacity = parseInt(capacity);
      updatedAvailableSeats = newCapacity - ticketsSold;
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: title || existingEvent.title,
        description: description || existingEvent.description,
        date: dateTime ? new Date(dateTime) : existingEvent.date,
        location: venue || existingEvent.location,
        price: price ? parseFloat(price) : existingEvent.price,
        capacity: capacity ? parseInt(capacity) : existingEvent.capacity,
        availableSeats: updatedAvailableSeats
      }
    });

    res.status(200).json({ message: 'Event fields updated cleanly.', event: updatedEvent });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error during modification processing', error });
  }
};

// VIEW ORGANIZER'S EVENTS WITH LIVE BOOKINGS-SOLD METRICS
export const getOrganizerEvents = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizerId = req.user?.userId;

    const events = await prisma.event.findMany({
      where: { organizerId },
      include: {
        _count: {
          select: { bookings: { where: { status: 'CONFIRMED' } } }
        }
      },
      orderBy: { date: 'asc' }
    });

    // Format output mapping structure for clean UI consumption
    const formatted = events.map(e => ({
      id: e.id,
      title: e.title,
      venue: e.location,
      dateTime: e.date,
      price: e.price,
      totalCapacity: e.capacity,
      seatsRemaining: e.availableSeats,
      bookingsSold: e._count.bookings // Dynamic aggregate counter field!
    }));

    res.status(200).json({ data: formatted });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error fetching your dashboard metrics', error });
  }
};

// VIEW ATTENDEE LIST FOR A GIVEN EVENT
// export const getEventAttendees = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
//   try {
//     const eventId = String(req.params.id);
//     const organizerId = req.user?.userId;

//     // 1. Verify that the requesting organizer owns this event group asset
//     const event = await prisma.event.findUnique({ where: { id: eventId } });
//     if (!event) {
//       res.status(404).json({ message: 'Target event records do not exist' });
//       return;
//     }
//     if (event.organizerId !== organizerId) {
//       res.status(403).json({ message: 'Forbidden: Access denied to attendee rosters of unowned assets' });
//       return;
//     }

//     // 2. Query bookings to retrieve user account profiles
//     const bookings = await prisma.booking.findMany({
//       where: { eventId, status: 'CONFIRMED' },
//       include: {
//         user: { select: { id: true, name: true, email: true } }
//       },
//       orderBy: { createdAt: 'asc' }
//     });

//     const attendeeRoster = bookings.map(b => ({
//       bookingId: b.id,
//       bookedAt: b.createdAt,
//       attendee: b.user
//     }));

//     res.status(200).json({ data: attendeeRoster });
//   } catch (error) {
//     res.status(500).json({ message: 'Internal server error retrieving attendee logs', error });
//   }
// };

// VIEW ATTENDEE LIST WITH SEARCH/FILTER CAPABILITIES
export const getEventAttendees = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const eventId = String(req.params.id);
    const organizerId = req.user?.userId;
    const search = req.query.search ? String(req.query.search).toLowerCase() : '';

    // 1. Verify event existence and platform ownership parameters
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      res.status(404).json({ message: 'Target event records do not exist' });
      return;
    }
    if (event.organizerId !== organizerId) {
      res.status(403).json({ message: 'Forbidden: Access denied to attendee rosters of unowned assets' });
      return;
    }

    // 2. Query bookings matching criteria
    const bookings = await prisma.booking.findMany({
      where: { 
        eventId, 
        status: 'CONFIRMED',
        ...(search && {
          user: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }
        })
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    const attendeeRoster = bookings.map(b => ({
      bookingId: b.id,
      bookedAt: b.createdAt,
      attendee: b.user
    }));

    res.status(200).json({ data: attendeeRoster });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error retrieving attendee logs', error });
  }
};

// REMOVE ATTENDEE / REVOKE TICKET MANUALLY BY ORGANIZER
// REMOVE ATTENDEE / REVOKE TICKET MANUALLY BY ORGANIZER
export const removeAttendee = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Force both route parameters to be clean, guaranteed primitive strings
    const eventId = String(req.params.eventId);
    const bookingId = String(req.params.bookingId);
    const organizerId = req.user?.userId;

    // 1. Verify organizer owns the event
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      res.status(404).json({ message: 'Target event records do not exist' });
      return;
    }
    if (event.organizerId !== organizerId) {
      res.status(403).json({ message: 'Forbidden: Access denied to manage unowned assets' });
      return;
    }

    // 2. Run atomic transaction to revoke the booking and return seat inventory
    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({ where: { id: bookingId } });
      
      if (!booking || booking.eventId !== eventId) {
        throw new Error('BOOKING_NOT_FOUND');
      }
      if (booking.status === 'CANCELLED') {
        throw new Error('ALREADY_CANCELLED');
      }

      // Mark status as CANCELLED
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' }
      });

      // Free up the seat natively
      await tx.$executeRaw`
        UPDATE events 
        SET "availableSeats" = "availableSeats" + 1 
        WHERE id = ${eventId}
      `;

      // Log action trail - Using 'BOOKING_CANCELLED' to match your existing schema enum!
      tx.activityLog.create({
        data: {
          eventId: eventId,
          action: 'BOOKING_CANCELLED',
          metadata: { organizerId, bookingId, recipientUserId: booking.userId, notes: 'Revoked by organizer' }
        }
      }).catch(err => console.error('Log sync failed:', err));

      return updatedBooking;
    });

    res.status(200).json({ 
      message: 'Attendee successfully removed, ticket revoked, and seat returned to inventory.',
      booking: result
    });

  } catch (error: any) {
    if (error.message === 'BOOKING_NOT_FOUND') {
      res.status(404).json({ message: 'Target booking assignment not found under this event' });
      return;
    }
    if (error.message === 'ALREADY_CANCELLED') {
      res.status(400).json({ message: 'This attendee booking has already been cancelled' });
      return;
    }
    res.status(500).json({ message: 'Internal server error processing removal', error });
  }
};

// FETCH COMPREHENSIVE ORGANIZER PLATFORM METRICS
export const getOrganizerAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizerId = req.user?.userId;

    if (!organizerId) {
      res.status(401).json({ message: 'Unauthorized: Organizer identity missing' });
      return;
    }

    // 1. Fetch all events owned by this organizer, including confirmed booking arrays
    const events = await prisma.event.findMany({
      where: { organizerId },
      include: {
        bookings: {
          where: { status: 'CONFIRMED' }
        }
      }
    });

    // 2. Compute high-level operational statistics
    let totalRevenue = 0;
    let totalTicketsSold = 0;
    let totalOverallCapacity = 0;

    const eventBreakdown = events.map(event => {
      const ticketsSold = event.capacity - event.availableSeats;
      const revenue = ticketsSold * event.price;

      totalTicketsSold += ticketsSold;
      totalRevenue += revenue;
      totalOverallCapacity += event.capacity;

      return {
        eventId: event.id,
        title: event.title,
        ticketsSold,
        capacity: event.capacity,
        revenueGenerated: revenue
      };
    });

    // Calculate overall occupancy/attendance velocity safely
    const attendanceRate = totalOverallCapacity > 0 
      ? parseFloat(((totalTicketsSold / totalOverallCapacity) * 100).toFixed(2))
      : 0;

    // 3. Dispatch structured payload response
    res.status(200).json({
      summary: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalTicketsSold,
        totalOverallCapacity,
        averageAttendanceRate: `${attendanceRate}%`
      },
      eventsBreakdown: eventBreakdown
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Internal server error compiling analytics dashboard metrics', 
      error: error instanceof Error ? error.message : error 
    });
  }
};