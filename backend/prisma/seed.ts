import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding script...');

  // 1. Clear out any old existing records safely
  await prisma.booking.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create a default mock organizer user account
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash('password123', saltRounds);

  const mockOrganizer = await prisma.user.create({
    data: {
      name: 'Rohit Sharma',
      email: 'organizer@test.com',
      password: hashedPassword,
      role: Role.ORGANIZER,
    },
  });

  console.log(`👤 Created mock organizer account: ${mockOrganizer.email}`);

  // 3. Array of 7 realistic event items covering different categories
  const initialEvents = [
    {
      title: 'Tech Summit 2025',
      description: 'The definitive annual conference gathering leading developers, tech founders, and open-source architects across India.',
      location: 'Bengaluru, India',
      price: 999.0,
      capacity: 200,
      category: 'Tech'
    },
    {
      title: 'Live in Concert',
      description: 'An open-air musical evening featuring live indie bands, rock musicians, and custom acoustic showcases.',
      location: 'Mumbai, India',
      price: 799.0,
      capacity: 150,
      category: 'Music'
    },
    {
      title: 'UI/UX Design Workshop',
      description: 'A practical, deep-dive masterclass focused on core interaction principles, layout grids, and modern SaaS aesthetics.',
      location: 'Delhi, India',
      price: 1499.0,
      capacity: 50,
      category: 'Tech'
    },
    {
      title: 'City Marathon 2025',
      description: 'Annual multi-tier community endurance run across the primary highway sectors of Delhi.',
      location: 'Delhi, India',
      price: 499.0,
      capacity: 500,
      category: 'Sports'
    },
    {
      title: 'Global Business Keynote',
      description: 'Corporate strategy panel discussions touching on funding velocity, product operations research, and modern structures.',
      location: 'Mumbai, India',
      price: 1999.0,
      capacity: 100,
      category: 'Business'
    },
    {
      title: 'Modern Art Exhibition',
      description: 'A gallery exhibit showcasing contemporary abstract painters, local digital illustrators, and fine sculptors.',
      location: 'Bengaluru, India',
      price: 299.0,
      capacity: 80,
      category: 'Art'
    },
    {
      title: 'Health & Mindfulness Meetup',
      description: 'An early-morning guided wellness routine, restorative breathing sessions, and community nutrition panels.',
      location: 'Goa, India',
      price: 0.0, // Free event
      capacity: 120,
      category: 'Health'
    }
  ];

  // 4. Save events to PostgreSQL via Prisma
  for (const item of initialEvents) {
    const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 1000);
    
    await prisma.event.create({
      data: {
        title: item.title,
        slug: slug,
        description: item.description,
        date: new Date('2025-05-15T10:00:00Z'),
        location: item.location,
        price: item.price,
        capacity: item.capacity,
        availableSeats: item.capacity - Math.floor(Math.random() * 5), // Simulating pre-booked slots
        organizerId: mockOrganizer.id,
      },
    });
  }

  console.log('✅ Database populated with 7 realistic events across multiple categories.');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding execution:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });