# 🎫 BookIt - Secure High-Velocity Event Ticketing Marketplace

A full-stack event management and reservation marketplace engineered with strict atomic transactional concurrency controls, schema-level duplicate locks, and isolated role-based routing structures.

---

## ⚡ Quickstart Guide (Run in 2 Commands)

Follow these steps to spin up the entire multi-container stack—including the PostgreSQL relational engine, the Express backend API container, the Next.js frontend web layer, schema migrations, and database seeding.

### Prerequisites
Ensure that [Docker Desktop](https://www.docker.com/products/docker-desktop) is launched and running on your machine.

### 1. Configure the Environment
Ensure your configurations are locked down by verifying that your root orchestrator configuration settings and backend database variables point to the active container infrastructure network.

### 2. Launch the Ecosystem via Docker Compose
Run the master compilation command in your project root folder (`BookIt2/`) to download isolated alpine images, build networking channels, allocate system ports, deploy structural schemas, and inject data:

```bash
docker-compose up --build


---

### 2. File Root Draft: `NOTES.md`

```markdown
# 📝 Technical Design Notes & System Architecture Review

## 1. Concurrency Model: Enforcing the No-Oversell Guarantee

### The Challenge
When a highly-anticipated event drops down to its final available open seat, multiple concurrent reservation HTTP checkout requests can enter the backend server execution threads within the exact same millisecond. In a standard non-isolated relational environment, this initiates a **Race Condition** bug: multiple threads check capacity, see `availableSeats = 1`, pass validation simultaneously, and insert matching tickets. This leads to an oversold state where more tickets are generated than physical seats exist.

### Our Solution: Pessimistic Concurrency Locking
To stop oversells at high speed, BookIt enforces an **Atomic PostgreSQL Transaction Layer** tied to **Explicit Row-Level Isolation Locks (`SELECT ... FOR UPDATE`)**.

1. **Transaction Isolation:** When an attendee clicks to finalize their ticket checkout, the request intercepts the booking controller via a raw SQL execution wrapper (`prisma.$executeRaw`).
2. **Row Interlocking:** We query the selected event record with a `SELECT ... FOR UPDATE` statement. This tells PostgreSQL to lock that specific row instantly inside the database engine.
3. **Queue Execution:** If another attendee tries to grab that exact same row a millisecond later, they are blocked from reading the stale data. They are placed in a safe queue until the first user's transaction resolves.
4. **State Re-Evaluation:** Once Transaction 1 successfully writes the ticket row, drops `availableSeats` to `0`, and commits, the lock releases. Transaction 2 unblocks, reads the newly updated state (`availableSeats = 0`), fails the runtime capacity check, safely rolls back, and throws a clean `409 Conflict - Sold Out` error to the interface without crashing.

### Single-User Spam Prevention
To stop a single attendee from double-clicking the buy button or script-injecting duplicate tickets for the same experience, we embedded a composite index constraint into the database schema layout:
```prisma
@@unique([userId, eventId])