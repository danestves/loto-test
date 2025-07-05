# API Documentation

This server provides both ORPC (type-safe RPC) and REST API endpoints for the transaction management system.

## Base URLs

- **Development**: `http://localhost:3000`
- **ORPC Endpoints**: `/rpc/*`
- **REST API v1**: `/api/v1/*`

## REST API Examples

### Categories

#### List all categories
```bash
curl http://localhost:3000/api/v1/categories
```

#### Get a specific category
```bash
curl http://localhost:3000/api/v1/categories/1
```

#### Create a new category
```bash
curl -X POST http://localhost:3000/api/v1/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Healthcare"}'
```

### Transactions

#### List all transactions
```bash
curl http://localhost:3000/api/v1/transactions
```

#### List transactions with filters
```bash
# Filter by category
curl "http://localhost:3000/api/v1/transactions?categoryId=1"

# Filter by status
curl "http://localhost:3000/api/v1/transactions?status=pending"

# Filter by date range
curl "http://localhost:3000/api/v1/transactions?dateFrom=2024-01-01T00:00:00Z&dateTo=2024-12-31T23:59:59Z"

# Combine filters
curl "http://localhost:3000/api/v1/transactions?categoryId=1&status=pending&dateFrom=2024-01-01T00:00:00Z"
```

#### Create a new transaction
```bash
curl -X POST http://localhost:3000/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "cardLastFour": "5678",
    "amount": 150.50,
    "categoryId": 1,
    "transactionDate": "2024-01-20T14:30:00Z"
  }'
```

#### Update transaction status
```bash
# Approve a transaction
curl -X PATCH http://localhost:3000/api/v1/transactions/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}'

# Reject a transaction
curl -X PATCH http://localhost:3000/api/v1/transactions/2/status \
  -H "Content-Type: application/json" \
  -d '{"status": "rejected"}'
```

#### Get expense summary
```bash
curl http://localhost:3000/api/v1/transactions/summary
```

### Health Check

```bash
curl http://localhost:3000/api/v1/health
```

## Error Handling

The API returns consistent error responses:

### Validation Error (400)
```json
{
  "success": false,
  "message": "Invalid request data",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "number",
      "path": ["name"],
      "message": "Expected string, received number"
    }
  ]
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Category not found"
}
```

### Conflict (409)
```json
{
  "success": false,
  "message": "Category with this name already exists"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## ORPC API

The ORPC API is available at `/rpc/*` and provides type-safe access from TypeScript clients.

Example usage with the ORPC client:

```typescript
import { orpc } from "@/utils/orpc";

// Get all categories
const categories = await orpc.category.getAll();

// Create a transaction
const transaction = await orpc.transaction.create({
  cardLastFour: "1234",
  amount: 50.00,
  categoryId: 1,
  transactionDate: new Date(),
});

// Update transaction status
await orpc.transaction.updateStatus({
  id: transaction.id,
  status: "approved",
});

// Get expense summary
const summary = await orpc.transaction.getExpenseSummary();
```
