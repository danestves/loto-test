# Documentation Index

This directory contains all technical documentation for the Corporate Card Transaction Management System.

## Available Documentation

### 📋 [Technical Decisions](./TECHNICAL_DECISIONS.md)
Detailed explanations of the technology choices made in this project, including:
- Backend framework selection (Hono.js)
- Database choice (Turso/LibSQL)
- Architecture pattern (Hexagonal Architecture)
- API design strategy (ORPC + REST)
- Testing framework (Vitest)
- Performance and deployment considerations

### 🔌 [API Documentation](./API.md)
Complete API reference for both ORPC and REST endpoints:
- REST API examples with curl commands
- ORPC usage examples
- Request/response formats
- Error handling patterns
- Authentication notes

### 🏛️ [Architecture Guide](./ARCHITECTURE.md)
Detailed explanation of the hexagonal architecture implementation:
- Layer structure and responsibilities
- Benefits and trade-offs
- Directory organization
- Code examples

### 🚀 [Deployment Guide](./DEPLOYMENT.md)
Step-by-step instructions for deploying to production:
- Environment setup
- Database configuration
- Deployment options (Vercel, Railway, Docker)
- Production checklist
- Scaling strategies

## Quick Links

- **Main README**: [../README.md](../README.md) - Project overview and setup instructions
- **Backend Source**: [../apps/server/src](../apps/server/src)
- **Frontend Source**: [../apps/web/src](../apps/web/src)

## Documentation Standards

When adding new documentation:
1. Place all technical documentation in this `/docs` folder
2. Use descriptive filenames (e.g., `DEPLOYMENT_GUIDE.md`, `ARCHITECTURE.md`)
3. Update this index file with a link and description
4. Follow Markdown best practices
5. Include practical examples where applicable
