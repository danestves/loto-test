# Architecture Overview

This document describes the architectural design of the Corporate Card Transaction Management System.

## Hexagonal Architecture (Ports and Adapters)

The application follows the Hexagonal Architecture pattern, which provides clear separation between business logic and external concerns.

### Core Principles

1. **Domain Independence**: Business logic doesn't depend on external frameworks or infrastructure
2. **Testability**: Core business logic can be tested in isolation
3. **Flexibility**: Easy to swap implementations (databases, APIs, etc.)
4. **Clear Boundaries**: Well-defined interfaces between layers

## Layer Structure

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                     │
│                 (REST API / ORPC / UI)                   │
├─────────────────────────────────────────────────────────┤
│                    Application Layer                      │
│                    (Use Cases / DTOs)                    │
├─────────────────────────────────────────────────────────┤
│                      Domain Layer                         │
│              (Entities / Business Rules)                  │
├─────────────────────────────────────────────────────────┤
│                  Infrastructure Layer                     │
│            (Database / External Services)                 │
└─────────────────────────────────────────────────────────┘
```

## Implementation Details

### Domain Layer (`apps/server/src/domain/`)

The heart of the application containing:

#### Services
- `CategoryService`: Business logic for category management
- `TransactionService`: Business logic for transaction operations

#### Interfaces (Ports)
- `CategoryRepository`: Interface for category data access
- `TransactionRepository`: Interface for transaction data access

Example:
```typescript
export interface CategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: number): Promise<Category | undefined>;
  create(name: string): Promise<Category>;
  exists(name: string): Promise<boolean>;
}
```

### Infrastructure Layer

#### Repository Implementations (Adapters)
- `CategoryRepositoryImpl`: Drizzle ORM implementation
- `TransactionRepositoryImpl`: Drizzle ORM implementation

These implement the repository interfaces defined in the domain layer.

### Presentation Layer

#### API Routes
- **ORPC Routes** (`apps/server/src/routers/`): Type-safe RPC endpoints
- **REST Routes** (`apps/server/src/api/v1/`): RESTful API endpoints

Both API styles use the same domain services, ensuring consistency.

## Benefits in Practice

### 1. Easy Testing
```typescript
// Mock repository for testing
const mockRepository: CategoryRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  exists: vi.fn(),
};

const service = new CategoryService(mockRepository);
// Test business logic without database
```

### 2. Swappable Implementations
```typescript
// Could easily switch from SQLite to PostgreSQL
class CategoryRepositoryPostgres implements CategoryRepository {
  // PostgreSQL-specific implementation
}

// Or to an in-memory store for testing
class CategoryRepositoryInMemory implements CategoryRepository {
  // In-memory implementation
}
```

### 3. Clear Separation of Concerns
- Business rules stay in the domain layer
- Database queries stay in repository implementations
- HTTP concerns stay in the presentation layer
- Each layer has a single responsibility

## Directory Structure

```
apps/server/src/
├── domain/                 # Business logic
│   ├── category/
│   │   ├── category.service.ts
│   │   └── category.service.test.ts
│   └── transaction/
│       ├── transaction.service.ts
│       └── transaction.service.test.ts
├── db/                     # Database layer
│   ├── schema/            # Database schemas
│   └── index.ts           # Database connection
├── routers/               # ORPC endpoints
│   ├── category.ts
│   └── transaction.ts
└── api/                   # REST endpoints
    └── v1/
        ├── categories.ts
        └── transactions.ts
```

## Design Decisions

### Why Hexagonal Architecture?

1. **Future-Proofing**: Easy to adapt to changing requirements
2. **Team Scalability**: Clear boundaries help multiple developers work independently
3. **Technology Agnostic**: Core business logic isn't tied to specific frameworks
4. **Testability**: Each layer can be tested in isolation

### Trade-offs

- **Initial Complexity**: More boilerplate code initially
- **Learning Curve**: Developers need to understand the pattern
- **Over-engineering Risk**: Can be overkill for very simple applications

However, for a financial transaction system that may grow and evolve, the benefits outweigh the costs.
