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