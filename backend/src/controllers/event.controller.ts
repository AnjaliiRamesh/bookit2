import { Request, Response } from 'express';
import prisma from '../config/db';

export const getAllEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const search = req.query.search ? String(req.query.search) : '';
    const dateStr = req.query.date ? String(req.query.date) : '';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } } // Can search by venue too!
      ];
    }

    if (dateStr) {
      const targetDate = new Date(dateStr);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      whereClause.date = { gte: startOfDay, lte: endOfDay };
    }

    const [events, totalEvents] = await Promise.all([
      prisma.event.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        orderBy: { date: 'asc' },
        include: {
          organizer: { select: { name: true } }
        }
      }),
      prisma.event.count({ where: whereClause })
    ]);

    // MAP THE DATA TO INJECT SOLD OUT FLAGS FOR THE UI CHECKLIST
    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description,
      dateTime: event.date,
      venue: event.location,
      price: event.price,
      seatsRemaining: event.availableSeats,
      isSoldOut: event.availableSeats <= 0, // Automatically flags true if seats run out!
      organizerName: event.organizer.name
    }));

    const totalPages = Math.ceil(totalEvents / limit);

    res.status(200).json({
      data: formattedEvents,
      pagination: {
        totalItems: totalEvents,
        totalPages: totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Internal server error while fetching events', 
      error: error instanceof Error ? error.message : error 
    });
  }

  
};

// Add this right next to your existing getAllEvents controller!
// export const getEventDetails = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { idOrSlug } = req.params;

//     // 1. Look up the event item by checking BOTH id and unique slug paths
//     const event = await prisma.event.findFirst({
//       where: {
//         OR: [
//           { id: idOrSlug },
//           { slug: idOrSlug }
//         ]
//       },
//       include: {
//         organizer: { select: { name: true, email: true } }
//       }
//     });

//     // 2. Security Check: If no event matches, throw a clean 404 error
//     if (!event) {
//       res.status(404).json({ message: 'Requested Event was not found on this platform' });
//       return;
//     }

//     // 3. BACKGROUND WORKER METRIC: Create an internal event view log row asynchronously
//     // Notice we do NOT use "await" here so we don't slow down the user's page loading time!
//     prisma.activityLog.create({
//       data: {
//         eventId: event.id,
//         action: 'EVENT_VIEW',
//         metadata: { timestamp: new Date(), platform: 'web' }
//       }
//     }).catch(err => console.error('Non-blocking activity log write failed:', err));

//     // 4. Send the formatted single item bundle back to the user
//     res.status(200).json({
//       id: event.id,
//       title: event.title,
//       slug: event.slug,
//       description: event.description,
//       dateTime: event.date,
//       venue: event.location,
//       price: event.price,
//       seatsRemaining: event.availableSeats,
//       isSoldOut: event.availableSeats <= 0,
//       organizer: {
//         name: event.organizer.name,
//         email: event.organizer.email
//       }
//     });

//   } catch (error) {
//     res.status(500).json({ 
//       message: 'Internal server error while retrieving event data fields', 
//       error: error instanceof Error ? error.message : error 
//     });
//   }
// };

export const getEventDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    // Force idOrSlug to be a clean, safe, singular string
    const idOrSlug = String(req.params.idOrSlug);

    // 1. Look up the event item by checking BOTH id and unique slug paths
    const event = await prisma.event.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug }
        ]
      },
      include: {
        organizer: { select: { name: true, email: true } }
      }
    });

    // 2. Security Check: If no event matches, throw a clean 404 error
    if (!event || !event.organizer) {
      res.status(404).json({ message: 'Requested Event was not found on this platform' });
      return;
    }

    // 3. BACKGROUND WORKER METRIC: Create an internal event view log row asynchronously
    prisma.activityLog.create({
      data: {
        eventId: event.id,
        action: 'EVENT_VIEW',
        metadata: { timestamp: new Date(), platform: 'web' }
      }
    }).catch(err => console.error('Non-blocking activity log write failed:', err));

    // 4. Send the formatted single item bundle back to the user
    res.status(200).json({
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description,
      dateTime: event.date,
      venue: event.location,
      price: event.price,
      seatsRemaining: event.availableSeats,
      isSoldOut: event.availableSeats <= 0,
      organizer: {
        name: event.organizer.name,
        email: event.organizer.email
      }
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Internal server error while retrieving event data fields', 
      error: error instanceof Error ? error.message : error 
    });
  }
};