# Corporate Card Transaction Management System

A full-stack application for managing corporate card transactions with expense categorization and reporting capabilities.

> Note: this is a test for lotolatam

## 📚 Documentation

- **[Documentation Index](./docs/README.md)** - All technical documentation
- **[Technical Decisions](./docs/TECHNICAL_DECISIONS.md)** - Architecture and technology choices
- **[API Reference](./docs/API.md)** - Complete API documentation with examples

## 🏗️ Architecture

This project follows **Hexagonal Architecture** (Ports and Adapters) pattern:

- **Domain Layer**: Contains business logic and entities (`apps/server/src/domain/`)
- **Application Layer**: Services and use cases
- **Infrastructure Layer**: Database repositories and external adapters
- **Presentation Layer**: API routes and frontend components

### Tech Stack

- **Backend**:
  - Hono.js - Lightweight web framework
  - ORPC - Type-safe RPC layer
  - Drizzle ORM - TypeScript ORM
  - Turso/LibSQL - SQLite-compatible distributed database
  - Vitest - Unit testing framework

- **Frontend**:
  - TanStack Start - Modern React framework
  - TanStack Query - Data fetching and caching
  - TanStack Router - Type-safe routing
  - Tailwind CSS - Styling
  - shadcn/ui - Component library

## 📋 Features

- **Transaction Management**
  - Record transactions with card details (last 4 digits)
  - Track amount, category, date, and status
  - Filter transactions by category, status, or date range
  - Update transaction status (Pending → Approved/Rejected)

- **Category Management**
  - Create expense categories with unique names
  - List all available categories
  - Associate transactions with categories

- **Expense Analytics**
  - View expense summary grouped by category
  - Total amount and transaction count per category

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd loto-test
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
# Create .env file in apps/server
DATABASE_URL=file:./local.db
```

4. Run database migrations:
```bash
cd apps/server
pnpm db:push
```

5. Seed the database with initial data:
```bash
pnpm seed
```

### Development

Start the development servers:

```bash
# From project root
pnpm dev
```

This will start:
- Backend server on http://localhost:3000
- Frontend server on http://localhost:3001

## 📚 API Overview

> **Note**: For complete API documentation with examples and curl commands, see [API Documentation](./docs/API.md)

The application provides two API interfaces:

### 1. ORPC API (Type-safe RPC)

Available at `/rpc/*` endpoints with full TypeScript type inference.

#### Categories

- **Get All Categories**: `category.getAll`
- **Get Category by ID**: `category.getById({ id: number })`
- **Create Category**: `category.create({ name: string })`

#### Transactions

- **Get All Transactions**: `transaction.getAll({ categoryId?, status?, dateFrom?, dateTo? })`
- **Create Transaction**: `transaction.create({ cardLastFour, amount, categoryId, transactionDate, status? })`
- **Update Status**: `transaction.updateStatus({ id, status })`
- **Get Summary**: `transaction.getExpenseSummary()`

### 2. REST API v1

Available at `/api/v1/*` endpoints following RESTful conventions.

#### Categories

##### Get All Categories
```http
GET /api/v1/categories
```
Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Food",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

##### Get Category by ID
```http
GET /api/v1/categories/:id
```
Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Food",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

##### Create Category
```http
POST /api/v1/categories
Content-Type: application/json

{
  "name": "Office Supplies"
}
```
Response (201):
```json
{
  "success": true,
  "data": {
    "id": 7,
    "name": "Office Supplies",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Transactions

##### Get All Transactions
```http
GET /api/v1/transactions?categoryId=1&status=pending&dateFrom=2024-01-01T00:00:00Z&dateTo=2024-12-31T23:59:59Z
```
Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "cardLastFour": "1234",
      "amount": 45.50,
      "categoryId": 1,
      "categoryName": "Food",
      "transactionDate": "2024-01-01T00:00:00.000Z",
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "count": 1
  }
}
```

##### Create Transaction
```http
POST /api/v1/transactions
Content-Type: application/json

{
  "cardLastFour": "1234",
  "amount": 99.99,
  "categoryId": 1,
  "transactionDate": "2024-01-15T10:30:00Z",
  "status": "pending"
}
```
Response (201):
```json
{
  "success": true,
  "data": {
    "id": 9,
    "cardLastFour": "1234",
    "amount": 99.99,
    "categoryId": 1,
    "transactionDate": "2024-01-15T10:30:00.000Z",
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

##### Update Transaction Status
```http
PATCH /api/v1/transactions/:id/status
Content-Type: application/json

{
  "status": "approved"
}
```
Response:
```json
{
  "success": true,
  "message": "Transaction status updated successfully"
}
```

##### Get Expense Summary
```http
GET /api/v1/transactions/summary
```
Response:
```json
{
  "success": true,
  "data": [
    {
      "categoryId": 1,
      "categoryName": "Food",
      "totalAmount": 500.50,
      "transactionCount": 10
    }
  ],
  "meta": {
    "totalAmount": 500.50,
    "totalTransactions": 10,
    "categoryCount": 1
  }
}
```

#### Error Responses

All endpoints follow a consistent error format:
```json
{
  "success": false,
  "message": "Error description",
  "details": { } // Optional, contains validation errors or additional info
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate category name)
- `500` - Internal Server Error

## 🧪 Testing

### Run Unit Tests

```bash
cd apps/server
pnpm test
```

### Run Tests with UI

```bash
cd apps/server
pnpm test:ui
```

### Test Coverage

The test suite covers:
- ✅ Category service business logic
- ✅ Transaction service business logic
- ✅ Input validation
- ✅ Error handling
- ✅ Repository interactions

## 📁 Project Structure

```
loto-test/
├── apps/
│   ├── server/          # Backend application
│   │   ├── src/
│   │   │   ├── domain/  # Business logic (Hexagonal Architecture)
│   │   │   │   ├── category/
│   │   │   │   └── transaction/
│   │   │   ├── db/      # Database layer
│   │   │   │   ├── schema/
│   │   │   │   └── seed.ts
│   │   │   ├── routers/ # API routes
│   │   │   └── lib/     # Utilities
│   │   └── vitest.config.ts
│   └── web/            # Frontend application
│       ├── src/
│       │   ├── routes/  # Page components
│       │   ├── components/
│       │   └── utils/
│       └── vite.config.ts
├── packages/           # Shared packages
├── turbo.json         # Turborepo configuration
└── pnpm-workspace.yaml
```

## 🔐 Security Considerations

- Card numbers are stored as last 4 digits only
- Input validation on all endpoints
- Type-safe API calls with ORPC
- SQL injection protection via Drizzle ORM

## 🚢 Deployment

### Backend Deployment

1. Build the backend:
```bash
cd apps/server
pnpm build
```

2. Deploy to your preferred hosting service with the built files

### Frontend Deployment

1. Build the frontend:
```bash
cd apps/web
pnpm build
```

2. Deploy the `dist` folder to any static hosting service

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
