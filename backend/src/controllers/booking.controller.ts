import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import prisma from '../config/db';

export const createBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User identity missing' });
      return;
    }

    // EXECUTE AN ISOLATED DATABASE TRANSACTION
    const bookingResult = await prisma.$transaction(async (tx) => {
      
      // 1. Lock the explicit event row using PostgreSQL's SELECT FOR UPDATE
      const currentEvent: any[] = await tx.$queryRaw`
        SELECT id, "availableSeats", capacity, title 
        FROM events 
        WHERE id = ${eventId} 
        FOR UPDATE
      `;

      // Security Check: Does the event exist?
      if (!currentEvent || currentEvent.length === 0) {
        throw new Error('NOT_FOUND');
      }

      const event = currentEvent[0];

      // 2. CRITICAL CONCURRENCY GUARD: Check if seats are completely sold out
      if (event.availableSeats <= 0) {
        throw new Error('SOLD_OUT');
      }

      // 3. Decrement the available seat inventory balance by 1 row
      await tx.$executeRaw`
        UPDATE events 
        SET "availableSeats" = "availableSeats" - 1 
        WHERE id = ${eventId}
      `;

      // 4. Generate the official confirmed booking history item
      const newBooking = await tx.booking.create({
        data: {
          userId: userId,
          eventId: eventId,
          status: 'CONFIRMED'
        }
      });

      // 5. ASYNC BACKGROUND LOG: Record the booking metric log row
      tx.activityLog.create({
        data: {
          eventId: eventId,
          action: 'BOOKING_CONFIRMED',
          metadata: { userId }
        }
      }).catch(err => console.error('Log sync failed:', err));

      return newBooking;
    });

    // If transaction finishes smoothly without throwing errors, return 201 Success!
    res.status(201).json({
      message: 'Booking confirmed successfully!',
      booking: bookingResult
    });

  } catch (error: any) {
    // Catch thrown errors from inside the transaction blocks
    if (error.message === 'SOLD_OUT') {
      res.status(409).json({ message: 'Sold Out' });
      return;
    }
    if (error.message === 'NOT_FOUND') {
      res.status(404).json({ message: 'Target event not found' });
      return;
    }

  // Prisma unique constraint violation code
  if (error.code === 'P2002') {
    res.status(400).json({ 
      success: false, 
      message: "Duplicate booking rejected. You have already reserved a ticket pass for this experience." 
    });
    return;
    
  }

    res.status(500).json({ 
      message: 'Internal server error while processing booking request', 
      error: error instanceof Error ? error.message : error 
    });
  }
};


// FETCH ALL BOOKINGS FOR THE LOGGED-IN USER
export const getUserBookings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User identity missing' });
      return;
    }

    // Retrieve bookings sorted with newest first, including deep event detail properties
    const bookings = await prisma.booking.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        event: {
          select: {
            title: true,
            date: true,
            location: true,
            price: true
          }
        }
      }
    });

    res.status(200).json({ data: bookings });
  } catch (error) {
    res.status(500).json({ 
      message: 'Internal server error while retrieving bookings', 
      error: error instanceof Error ? error.message : error 
    });
  }
};

// CANCEL AN EXISTING BOOKING AND FREE UP THE CAPACITY SEAT
export const cancelBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const bookingId = String(req.params.id);
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User identity missing' });
      return;
    }

    // EXECUTE AN ISOLATED TRANSACTION TO SAFELY RETURN SEAT INVENTORY
    const cancellationResult = await prisma.$transaction(async (tx) => {
      
      // 1. Fetch the booking target item and verify ownership
      const booking = await tx.booking.findUnique({
        where: { id: bookingId }
      });

      if (!booking) {
        throw new Error('NOT_FOUND');
      }
      if (booking.userId !== userId) {
        throw new Error('UNAUTHORIZED');
      }
      if (booking.status === 'CANCELLED') {
        throw new Error('ALREADY_CANCELLED');
      }

      // 2. Flip the target booking row status to CANCELLED
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' }
      });

      // 3. FREE SEAT STEP: Increment availableSeats back up by 1 row
      await tx.$executeRaw`
        UPDATE events 
        SET "availableSeats" = "availableSeats" + 1 
        WHERE id = ${booking.eventId}
      `;

      // 4. METRIC STREAM: Write a dynamic historical log row entry
      tx.activityLog.create({
        data: {
          eventId: booking.eventId,
          action: 'BOOKING_CANCELLED',
          metadata: { userId, bookingId }
        }
      }).catch(err => console.error('Log sync failed:', err));

      return updatedBooking;
    });

    res.status(200).json({
      message: 'Booking cancelled successfully and seat returned to inventory.',
      booking: cancellationResult
    });

  } catch (error: any) {
    if (error.message === 'NOT_FOUND') {
      res.status(404).json({ message: 'Target booking record not found' });
      return;
    }
    if (error.message === 'UNAUTHORIZED') {
      res.status(403).json({ message: 'Forbidden: You do not own this booking ticket assignment' });
      return;
    }
    if (error.message === 'ALREADY_CANCELLED') {
      res.status(400).json({ message: 'This booking has already been cancelled' });
      return;
    }

    res.status(500).json({ message: 'Internal server error during cancellation processing', error });
  }
};