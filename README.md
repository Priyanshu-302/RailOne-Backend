# Railway Reservation Backend System

A production-grade RESTful API backend for managing railway ticketing operations — built with Node.js, Express.js, and PostgreSQL. Designed for concurrency safety, role-based access control, and enterprise-level architectural clarity.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Booking Flow & Concurrency Safety](#booking-flow--concurrency-safety)
- [Security Design](#security-design)
- [Business Rules](#business-rules)
- [Error Handling](#error-handling)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Future Enhancements](#future-enhancements)

---

## Overview

This backend system supports the complete lifecycle of railway reservation operations:

- User registration and JWT-based authentication
- Train and schedule management (Admin)
- Seat inventory management with date and class segmentation (Admin)
- Concurrency-safe ticket booking using PostgreSQL row-level locking
- Ticket cancellation with automatic inventory restoration
- Payment state tracking
- Complaint submission and resolution

Seat booking is protected against race conditions using `SELECT ... FOR UPDATE` within atomic PostgreSQL transactions, ensuring overbooking is structurally impossible.

---

## Tech Stack

| Layer               | Technology                         |
| ------------------- | ---------------------------------- |
| Runtime             | Node.js                            |
| Framework           | Express.js                         |
| Database            | PostgreSQL                         |
| DB Client           | pg (node-postgres)                 |
| Authentication      | JSON Web Tokens (JWT)              |
| Token Storage       | HTTP-only Cookies                  |
| Input Validation    | express-validator                  |
| Password Hashing    | bcrypt                             |
| Access Control      | Role-based (USER / ADMIN)          |
| Concurrency Control | PostgreSQL `SELECT ... FOR UPDATE` |

---

## System Architecture

The application follows a strict four-layer architecture. Dependencies flow inward only — Routes call Controllers, Controllers call Services, Services call Models.

```
Request
   │
   ▼
[ Middleware ]         Rate Limiter → Authenticate → Authorize → Validate
   │
   ▼
[ Routes ]             HTTP method + path → middleware chain → controller
   │
   ▼
[ Controllers ]        Extract request data → delegate to service → format response
   │
   ▼
[ Services ]           Business logic → transaction management → model calls
   │
   ▼
[ Models ]             Parameterized SQL → pg client → return rows
   │
   ▼
[ PostgreSQL ]
```

### Layer Responsibilities

**Routes** — Declare the HTTP surface. Map method + path to a controller function. Apply middleware chains. Contain zero business logic.

**Controllers** — Bridge HTTP and application logic. Extract validated input from the request object, call the appropriate service, and return a formatted HTTP response. Contain no SQL or business rules.

**Services** — Own all business logic. Enforce rules, manage database transactions (`BEGIN` / `COMMIT` / `ROLLBACK`), coordinate model calls, and throw typed errors for failure conditions.

**Models** — Sole point of database access. Execute parameterized SQL queries. Accept an optional `client` parameter to participate in a caller-managed transaction.

**Middleware** — Intercept requests before route handlers. Responsibilities are authentication, authorization, input validation, and rate limiting.

### Request Lifecycle

1. Client sends request with JWT in HTTP-only cookie
2. Express matches route
3. Middleware chain: rate limiter → `authenticate` → `authorize` → `validate`
4. Controller extracts request data
5. Service applies business logic; acquires db client and issues `BEGIN` if transactional
6. Model executes parameterized SQL
7. Service commits transaction; returns result to controller
8. Controller sends HTTP response
9. On any error: `ROLLBACK` → `client.release()` → forward to centralized error middleware

---

## Database Schema

```sql
-- Users
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100)        NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  phone       VARCHAR(15)  UNIQUE NOT NULL,
  password    TEXT                NOT NULL,
  role        VARCHAR(10)         NOT NULL DEFAULT 'USER', -- USER | ADMIN
  created_at  TIMESTAMP           NOT NULL DEFAULT NOW()
);

-- Trains
CREATE TABLE trains (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  train_no     VARCHAR(20)  NOT NULL,
  train_name   VARCHAR(150) NOT NULL,
  source       VARCHAR(100) NOT NULL,
  destination  VARCHAR(100) NOT NULL,
  created_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Schedules
CREATE TABLE schedules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  train_id        UUID REFERENCES trains(id) ON DELETE CASCADE,
  station         VARCHAR(100) NOT NULL,
  arrival_time    TIME         NOT NULL,
  departure_time  TIME         NOT NULL,
  day_off         INTEGER      NOT NULL DEFAULT 0,
  created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Seat Inventory
CREATE TABLE seat_inventory (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  train_id         UUID REFERENCES trains(id) ON DELETE CASCADE,
  date             DATE         NOT NULL,
  class            VARCHAR(10)  NOT NULL,
  total_seats      INTEGER      NOT NULL,
  available_seats  INTEGER      NOT NULL,
  created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
  UNIQUE (train_id, date, class),
  CHECK (available_seats >= 0),
  CHECK (available_seats <= total_seats)
);

-- Tickets
CREATE TABLE tickets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id),
  train_id      UUID REFERENCES trains(id),
  journey_date  DATE         NOT NULL,
  class         VARCHAR(10)  NOT NULL,
  seat_no       INTEGER      NOT NULL,
  status        VARCHAR(10)  NOT NULL DEFAULT 'BOOKED', -- BOOKED | CANCELLED
  PNR_no        VARCHAR(20)  UNIQUE NOT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  ticket_id   UUID REFERENCES tickets(id),
  amount      NUMERIC(10, 2) NOT NULL,
  status      VARCHAR(15)    NOT NULL DEFAULT 'PENDING', -- PENDING | SUCCESSFUL | FAILED
  created_at  TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- Complaints
CREATE TABLE complaints (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  train_id    UUID REFERENCES trains(id),
  message     TEXT        NOT NULL,
  status      VARCHAR(10) NOT NULL DEFAULT 'PENDING', -- PENDING | RESOLVED
  created_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);
```

### Entity Relationships

```
users ──────────< tickets >────────── trains
  │                  │                  │
  │                  │                  ├──< schedules
  │                  │                  └──< seat_inventory
  ├──< payments >────┘
  └──< complaints >─────────────────── trains
```

### Recommended Indexes

```sql
CREATE INDEX idx_tickets_user_id          ON tickets(user_id);
CREATE INDEX idx_tickets_train_date_class ON tickets(train_id, journey_date, class);
CREATE INDEX idx_payments_user_id         ON payments(user_id);
CREATE INDEX idx_payments_ticket_id       ON payments(ticket_id);
CREATE INDEX idx_schedules_train_id       ON schedules(train_id);
CREATE INDEX idx_complaints_user_id       ON complaints(user_id);
CREATE INDEX idx_complaints_train_id      ON complaints(train_id);
-- seat_inventory(train_id, date, class) is covered by the UNIQUE constraint index
```

---

## API Reference

All endpoints are prefixed with `/api/v1`. Request and response bodies are JSON. Authentication is via HTTP-only cookie issued on login.

**Standard error response shape:**

```json
{
  "status": "error",
  "message": "Description of the failure",
  "errors": [{ "field": "email", "message": "Invalid format" }]
}
```

---

### Auth

| Method | Endpoint         | Auth         | Description                         |
| ------ | ---------------- | ------------ | ----------------------------------- |
| `POST` | `/auth/register` | None         | Register a new user account         |
| `POST` | `/auth/login`    | None         | Authenticate and receive JWT cookie |
| `POST` | `/auth/logout`   | USER / ADMIN | Clear authentication cookie         |

<details>
<summary><strong>POST /auth/register</strong></summary>

**Request Body**

```json
{
  "name": "Arjun Sharma",
  "email": "arjun@example.com",
  "phone": "9876543210",
  "password": "SecurePass@123"
}
```

**Response — 201 Created**

```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "id": "a1b2c3d4-...",
    "name": "Arjun Sharma",
    "email": "arjun@example.com",
    "role": "USER",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Errors** — `400` Invalid fields | `409` Email or phone already registered

</details>

<details>
<summary><strong>POST /auth/login</strong></summary>

**Request Body**

```json
{
  "email": "arjun@example.com",
  "password": "SecurePass@123"
}
```

**Response — 200 OK**

```json
{
  "status": "success",
  "message": "Login successful",
  "data": { "id": "a1b2c3d4-...", "name": "Arjun Sharma", "role": "USER" }
}
```

`Set-Cookie: token=<jwt>; HttpOnly; Secure; SameSite=Strict; Path=/`

**Errors** — `400` Missing fields | `401` Invalid credentials

</details>

---

### Users

| Method   | Endpoint         | Auth         | Description                      |
| -------- | ---------------- | ------------ | -------------------------------- |
| `GET`    | `/users/profile` | USER / ADMIN | Get authenticated user's profile |
| `PUT`    | `/users/profile` | USER / ADMIN | Update name, phone, or password  |
| `GET`    | `/users`         | ADMIN        | List all registered users        |
| `DELETE` | `/users/:id`     | ADMIN        | Delete a user by ID              |

---

### Trains

| Method   | Endpoint      | Auth         | Description               |
| -------- | ------------- | ------------ | ------------------------- |
| `POST`   | `/trains`     | ADMIN        | Create a new train record |
| `GET`    | `/trains`     | USER / ADMIN | List all trains           |
| `GET`    | `/trains/:id` | USER / ADMIN | Get a single train        |
| `PUT`    | `/trains/:id` | ADMIN        | Update train details      |
| `DELETE` | `/trains/:id` | ADMIN        | Delete a train            |

<details>
<summary><strong>POST /trains</strong></summary>

**Request Body**

```json
{
  "train_no": "12345",
  "train_name": "Rajdhani Express",
  "source": "New Delhi",
  "destination": "Mumbai Central"
}
```

**Response — 201 Created**

```json
{
  "status": "success",
  "data": {
    "id": "f3e2d1c0-...",
    "train_no": "12345",
    "train_name": "Rajdhani Express",
    "source": "New Delhi",
    "destination": "Mumbai Central",
    "created_at": "2024-01-15T08:00:00Z"
  }
}
```

**Errors** — `400` Invalid fields | `403` Not ADMIN | `409` Train number exists

</details>

---

### Schedules

| Method   | Endpoint              | Auth         | Description                   |
| -------- | --------------------- | ------------ | ----------------------------- |
| `POST`   | `/schedules`          | ADMIN        | Add a station stop to a train |
| `GET`    | `/schedules/:trainId` | USER / ADMIN | Get all stops for a train     |
| `PUT`    | `/schedules/:id`      | ADMIN        | Update a schedule stop        |
| `DELETE` | `/schedules/:id`      | ADMIN        | Remove a schedule stop        |

<details>
<summary><strong>POST /schedules</strong></summary>

**Request Body**

```json
{
  "train_id": "f3e2d1c0-...",
  "station": "Kota Junction",
  "arrival_time": "14:30:00",
  "departure_time": "14:35:00",
  "day_off": 1
}
```

**Errors** — `400` Invalid time format | `404` Train not found | `403` Not ADMIN

</details>

---

### Seat Inventory

| Method | Endpoint              | Auth         | Description                                      |
| ------ | --------------------- | ------------ | ------------------------------------------------ |
| `POST` | `/inventory`          | ADMIN        | Initialize inventory for a train/date/class slot |
| `GET`  | `/inventory/:trainId` | USER / ADMIN | Query seat availability                          |
| `PUT`  | `/inventory/:id`      | ADMIN        | Adjust total seat count                          |

<details>
<summary><strong>POST /inventory</strong></summary>

**Request Body**

```json
{
  "train_id": "f3e2d1c0-...",
  "date": "2024-03-15",
  "class": "2A",
  "total_seats": 80
}
```

**Response — 201 Created**

```json
{
  "status": "success",
  "data": {
    "id": "...",
    "train_id": "f3e2d1c0-...",
    "date": "2024-03-15",
    "class": "2A",
    "total_seats": 80,
    "available_seats": 80
  }
}
```

**Errors** — `409` Slot already initialized | `404` Train not found

</details>

---

### Tickets

| Method | Endpoint              | Auth         | Description                            |
| ------ | --------------------- | ------------ | -------------------------------------- |
| `POST` | `/tickets/book`       | USER         | Book a seat                            |
| `POST` | `/tickets/cancel/:id` | USER         | Cancel a booked ticket                 |
| `GET`  | `/tickets/my`         | USER         | Get all tickets for authenticated user |
| `GET`  | `/tickets/:id`        | USER / ADMIN | Get a single ticket                    |
| `GET`  | `/tickets`            | ADMIN        | Get all tickets system-wide            |

<details>
<summary><strong>POST /tickets/book</strong></summary>

**Request Body**

```json
{
  "train_id": "f3e2d1c0-...",
  "journey_date": "2024-03-15",
  "class": "2A"
}
```

**Response — 201 Created**

```json
{
  "status": "success",
  "message": "Ticket booked successfully",
  "data": {
    "id": "t9a8b7c6-...",
    "user_id": "a1b2c3d4-...",
    "train_id": "f3e2d1c0-...",
    "journey_date": "2024-03-15",
    "class": "2A",
    "seat_no": 42,
    "status": "BOOKED",
    "PNR_no": "PNR2024XYGZA",
    "created_at": "2024-01-15T11:00:00Z"
  }
}
```

**Errors** — `409` No seats available | `400` Past date or invalid class | `404` Train/inventory not found

</details>

<details>
<summary><strong>POST /tickets/cancel/:id</strong></summary>

**Response — 200 OK**

```json
{
  "status": "success",
  "message": "Ticket cancelled successfully",
  "data": {
    "id": "t9a8b7c6-...",
    "status": "CANCELLED",
    "PNR_no": "PNR2024XYGZA"
  }
}
```

**Errors** — `404` Ticket not found or not owned by user | `400` Already cancelled | `409` Journey date passed

</details>

---

### Payments

| Method | Endpoint                | Auth         | Description                             |
| ------ | ----------------------- | ------------ | --------------------------------------- |
| `POST` | `/payments/initiate`    | USER         | Create a PENDING payment for a ticket   |
| `POST` | `/payments/confirm/:id` | USER         | Mark payment as SUCCESSFUL              |
| `POST` | `/payments/fail/:id`    | USER         | Mark payment as FAILED                  |
| `GET`  | `/payments/my`          | USER         | Get all payments for authenticated user |
| `GET`  | `/payments`             | ADMIN        | Get all payments system-wide            |
| `GET`  | `/payments/:id`         | USER / ADMIN | Get a single payment                    |

<details>
<summary><strong>POST /payments/initiate</strong></summary>

**Request Body**

```json
{
  "ticket_id": "t9a8b7c6-...",
  "amount": 1450.0
}
```

**Response — 201 Created**

```json
{
  "status": "success",
  "data": {
    "id": "p1q2r3s4-...",
    "user_id": "a1b2c3d4-...",
    "ticket_id": "t9a8b7c6-...",
    "amount": "1450.00",
    "status": "PENDING",
    "created_at": "2024-01-15T11:05:00Z"
  }
}
```

**Errors** — `404` Ticket not found | `409` Payment already exists for ticket

</details>

---

### Complaints

| Method   | Endpoint                  | Auth  | Description                                |
| -------- | ------------------------- | ----- | ------------------------------------------ |
| `POST`   | `/complaints`             | USER  | Submit a complaint against a train         |
| `GET`    | `/complaints/my`          | USER  | Get complaints filed by authenticated user |
| `GET`    | `/complaints`             | ADMIN | Get all complaints system-wide             |
| `PUT`    | `/complaints/:id/resolve` | ADMIN | Mark complaint as RESOLVED                 |
| `DELETE` | `/complaints/:id`         | ADMIN | Delete a complaint                         |

---

## Booking Flow & Concurrency Safety

Seat booking is the most critical operation in the system. Without database-level coordination, concurrent requests observing the same available seat count can both proceed and create conflicting reservations — a race condition that application-layer checks alone cannot prevent.

### Why `SELECT ... FOR UPDATE`

An exclusive row-level lock is acquired on the `seat_inventory` row at the start of every booking transaction. Any concurrent transaction targeting the same row blocks until the first transaction commits or rolls back. This serializes all concurrent booking attempts for the same slot without locking unrelated rows.

### Transaction Boundary

```
BEGIN
  │
  ├── SELECT ... FOR UPDATE on seat_inventory     ← acquire exclusive row lock
  │     └── if available_seats < 1 → RAISE error
  │
  ├── SELECT seat_no FROM tickets (booked seats)  ← inside lock, safe to read
  │     └── allocate lowest available seat number
  │
  ├── INSERT INTO tickets (... seat_no, PNR_no)
  │
  └── UPDATE seat_inventory SET available_seats = available_seats - 1
        │
COMMIT ──────────────────────────────────────────── lock released
        │
ON ANY EXCEPTION → ROLLBACK → lock released → no partial write persists
```

### Implementation

```js
async function bookTicket(userId, trainId, journeyDate, cls) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Acquire exclusive lock on inventory row
    const { rows } = await client.query(
      `SELECT id, available_seats
       FROM seat_inventory
       WHERE train_id = $1 AND date = $2 AND class = $3
       FOR UPDATE`,
      [trainId, journeyDate, cls],
    );

    if (!rows[0] || rows[0].available_seats < 1) {
      throw new AppError("No seats available", 409);
    }

    // Allocate seat number (safe — row is locked)
    const booked = await client.query(
      `SELECT seat_no FROM tickets
       WHERE train_id = $1 AND journey_date = $2 AND class = $3 AND status = 'BOOKED'
       ORDER BY seat_no`,
      [trainId, journeyDate, cls],
    );
    const occupied = new Set(booked.rows.map((r) => r.seat_no));
    let seatNo = 1;
    while (occupied.has(seatNo)) seatNo++;

    const pnr = generatePNR();

    await client.query(
      `INSERT INTO tickets (user_id, train_id, journey_date, class, seat_no, PNR_no)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, trainId, journeyDate, cls, seatNo, pnr],
    );

    await client.query(
      `UPDATE seat_inventory
       SET available_seats = available_seats - 1
       WHERE train_id = $1 AND date = $2 AND class = $3`,
      [trainId, journeyDate, cls],
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
```

### Race Condition Scenarios

| Scenario                              | Mechanism                                   | Outcome                                |
| ------------------------------------- | ------------------------------------------- | -------------------------------------- |
| Two concurrent requests for last seat | `FOR UPDATE` serializes reads               | First books; second receives `409`     |
| Server crash mid-transaction          | PostgreSQL auto-rollback on connection loss | No partial write persists              |
| PNR collision on INSERT               | `UNIQUE` constraint raises error            | Transaction rolls back; client retries |
| Inventory row missing                 | Service throws `404` before lock            | Transaction never begins               |
| Cancel + re-book simultaneously       | Separate transactions, independent locks    | Each sees consistent committed state   |

---

## Security Design

### JWT + Cookie Authentication

Tokens encode `userId`, `email`, and `role`. They are signed with `HS256` using a server-side secret and stored in `HttpOnly; Secure; SameSite=Strict` cookies. This prevents XSS-based token theft and provides primary CSRF protection.

### Password Hashing

Passwords are hashed with bcrypt (cost factor ≥ 10) before storage. Plaintext is never written to any persistent store or log.

### Role-Based Access Control

Two middleware functions are chained on protected routes:

```js
router.post(
  "/trains",
  authenticate,
  authorize("ADMIN"),
  validateTrain,
  createTrain,
);
```

- `authenticate` — Verifies JWT signature and expiry. Attaches decoded payload to `req.user`.
- `authorize(...roles)` — Checks `req.user.role` against the permitted set. Returns `403` if unauthorized.

### SQL Injection Prevention

All queries use parameterized statements via the `pg` extended query protocol. Query text and parameter values are transmitted separately — parameter values are never interpolated into SQL strings.

```js
// Always
pool.query("SELECT * FROM users WHERE email = $1", [email]);

// Never
pool.query(`SELECT * FROM users WHERE email = '${email}'`);
```

### Rate Limiting

A custom middleware tracks request counts per IP within a configurable time window. Clients exceeding the threshold receive `429 Too Many Requests`. For multi-instance deployments, replace the in-memory store with Redis.

---

## Business Rules

**Identity**

- Email and phone must be unique across all user accounts
- Password is bcrypt-hashed before storage; plaintext is never persisted
- JWT expiry is enforced on every protected request

**Roles**

- `ADMIN` — full CRUD on trains, schedules, inventory; read access to all tickets, payments, and complaints; complaint resolution
- `USER` — book and cancel own tickets; submit complaints; view own tickets, payments, and complaints
- Role elevation requires direct database access; no public endpoint exists for it

**Booking**

- Booking proceeds only when `available_seats > 0` at the moment the inventory lock is acquired
- `available_seats` can never fall below zero (enforced by `CHECK` constraint and transactional decrement)
- Ticket status is `BOOKED` or `CANCELLED` only; `CANCELLED` tickets cannot be reinstated
- Cancellation increments `available_seats` within the same atomic transaction

**PNR**

- Every ticket carries a unique, server-generated PNR; enforced by `UNIQUE` constraint
- PNR is immutable after ticket creation and persists after cancellation

**Payments**

- One payment record per ticket; duplicates return `409`
- Status transitions: `PENDING → SUCCESSFUL` or `PENDING → FAILED` only
- Amount is supplied by the client (fare calculation engine is a future enhancement)

**Complaints**

- Users may complain against any train; no ticket ownership required
- Only `ADMIN` may resolve or delete complaints

---

## Error Handling

All errors are handled by a single centralized Express error middleware registered at the end of the middleware stack.

### AppError Class

```js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}
```

Services throw `AppError` for all anticipated failure conditions. Unexpected infrastructure errors propagate unmodified.

### Controller Pattern

```js
async function bookTicket(req, res, next) {
  try {
    const ticket = await ticketService.book(req.user.id, req.body);
    res.status(201).json({ status: "success", data: ticket });
  } catch (err) {
    next(err); // always forwarded — never handled inline
  }
}
```

### Centralized Error Middleware

```js
function globalErrorHandler(err, req, res, next) {
  const statusCode = err.isOperational ? err.statusCode : 500;
  const message = err.isOperational
    ? err.message
    : "An unexpected error occurred";

  logger.error({ err, path: req.path, method: req.method });

  res.status(statusCode).json({
    status: "error",
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
```

Stack traces are included only in development mode. Production responses never expose internal paths or database error messages.

---

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL 14+

### Installation

```bash
git clone https://github.com/your-username/railway-reservation-backend.git
cd railway-reservation-backend
npm install
```

### Database Setup

```bash
psql -U postgres -c "CREATE DATABASE railway_db;"
psql -U postgres -d railway_db -f db/schema.sql
```

### Run the Server

```bash
# Development
npm run dev

# Production
npm start
```

Server starts on `http://localhost:3000` by default.

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=railway_db
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_POOL_MAX=20

# Authentication
JWT_SECRET=your_jwt_secret_minimum_32_characters
JWT_EXPIRES_IN=7d
COOKIE_MAX_AGE=604800000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Project Structure

```
railway-reservation-backend/
│
├── src/
│   ├── config/
│   │   └── db.js                  # pg pool configuration
│   │
│   ├── middleware/
│   │   ├── authenticate.js        # JWT verification
│   │   ├── authorize.js           # RBAC enforcement
│   │   ├── validate.js            # express-validator result handler
│   │   ├── rateLimiter.js         # custom rate limiting
│   │   └── errorHandler.js        # centralized error middleware
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   └── auth.model.js
│   │   ├── users/
│   │   ├── trains/
│   │   ├── schedules/
│   │   ├── inventory/
│   │   ├── tickets/
│   │   ├── payments/
│   │   └── complaints/
│   │
│   ├── utils/
│   │   ├── AppError.js            # custom error class
│   │   └── generatePNR.js         # PNR generation utility
│   │
│   └── app.js                     # Express app setup and route mounting
│
├── db/
│   └── schema.sql                 # full database schema
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Future Enhancements

| Feature                 | Description                                                                                                 |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Waitlist System**     | Queue passengers when seats are full; auto-promote on cancellation within the same transaction              |
| **Payment Gateway**     | Integrate a real payment processor with webhook confirmation and idempotency handling                       |
| **Refund Automation**   | Initiate gateway refunds on cancellation; apply time-based refund policy rules                              |
| **Notifications**       | Async event queue (RabbitMQ / SQS) driving email, SMS, and push notifications at lifecycle events           |
| **Analytics API**       | Aggregated reporting on booking volume, revenue, utilization, and complaint resolution time                 |
| **Audit Trail**         | Append-only log table recording all state-changing operations with actor, timestamp, and before/after state |
| **Read Replicas**       | Route read queries to PostgreSQL read replicas for horizontal read scaling                                  |
| **Redis Rate Limiting** | Replace in-memory rate limiter store for correctness across horizontally scaled instances                   |

---

## License

This project is licensed under the MIT License.
