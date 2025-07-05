# Deployment Guide

This guide covers deploying the Corporate Card Transaction Management System to production.

## Prerequisites

- Node.js 18+ installed locally
- A Turso database account (or another SQLite-compatible database)
- Hosting accounts for backend and frontend

## Environment Setup

### Backend Environment Variables

Create a `.env` file in `apps/server/`:

```env
# Database
DATABASE_URL=libsql://your-database.turso.io

# CORS (production frontend URL)
CORS_ORIGIN=https://your-frontend-domain.com

# Node environment
NODE_ENV=production
```

### Frontend Environment Variables

Create a `.env` file in `apps/web/`:

```env
# Backend API URL
VITE_SERVER_URL=https://your-backend-domain.com
```

## Database Setup

### 1. Create Turso Database

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Create database
turso db create transaction-system

# Get database URL
turso db show transaction-system --url

# Get auth token
turso db tokens create transaction-system
```

### 2. Run Migrations

```bash
cd apps/server
DATABASE_URL="libsql://..." pnpm db:push
```

### 3. Seed Initial Data (Optional)

```bash
DATABASE_URL="libsql://..." pnpm seed
```

## Backend Deployment

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy from server directory:
```bash
cd apps/server
vercel --prod
```

3. Set environment variables in Vercel dashboard

### Option 2: Railway

1. Connect GitHub repository
2. Set root directory to `apps/server`
3. Add environment variables
4. Deploy

### Option 3: Docker

Create `Dockerfile` in `apps/server/`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "dist/src/index.js"]
```

Build and run:
```bash
docker build -t transaction-api .
docker run -p 3000:3000 --env-file .env transaction-api
```

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. Deploy from web directory:
```bash
cd apps/web
vercel --prod
```

2. Set environment variables in Vercel dashboard

### Option 2: Netlify

1. Connect GitHub repository
2. Build settings:
   - Base directory: `apps/web`
   - Build command: `pnpm build`
   - Publish directory: `dist`
3. Add environment variables
4. Deploy

### Option 3: Cloudflare Pages

1. Connect GitHub repository
2. Build configuration:
   - Build command: `cd apps/web && pnpm build`
   - Build output directory: `apps/web/dist`
3. Add environment variables
4. Deploy

## Production Checklist

### Security

- [ ] Enable HTTPS on both frontend and backend
- [ ] Configure CORS properly (restrict origins)
- [ ] Add rate limiting to API endpoints
- [ ] Implement authentication (if required)
- [ ] Enable security headers (Helmet.js)
- [ ] Validate all inputs
- [ ] Use environment variables for secrets

### Performance

- [ ] Enable gzip compression
- [ ] Configure caching headers
- [ ] Optimize database queries
- [ ] Enable CDN for static assets
- [ ] Monitor response times

### Monitoring

- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure application monitoring (e.g., DataDog, New Relic)
- [ ] Set up logging aggregation
- [ ] Create health check endpoints
- [ ] Configure uptime monitoring

### Database

- [ ] Enable automatic backups
- [ ] Set up database monitoring
- [ ] Configure connection pooling
- [ ] Plan for scaling (read replicas)

## Scaling Considerations

### Horizontal Scaling

The application is stateless and can be scaled horizontally:

1. **Backend**: Deploy multiple instances behind a load balancer
2. **Database**: Turso supports read replicas globally
3. **Frontend**: Use CDN for global distribution

### Caching Strategy

1. **API Responses**: Add Redis for caching frequent queries
2. **Static Assets**: Use CDN with long cache headers
3. **Database Queries**: Implement query result caching

### Example with Redis

```typescript
import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

// In CategoryService
async getAllCategories() {
  const cached = await redis.get("categories:all");
  if (cached) return JSON.parse(cached);

  const categories = await this.repository.findAll();
  await redis.set("categories:all", JSON.stringify(categories), "EX", 300);

  return categories;
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify network connectivity
   - Ensure database is accessible from deployment

2. **CORS Errors**
   - Verify CORS_ORIGIN environment variable
   - Check frontend is using correct API URL
   - Ensure headers are properly configured

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs for specific errors

### Debug Mode

Enable debug logging:

```typescript
// In apps/server/src/index.ts
if (process.env.NODE_ENV !== "production") {
  app.use("*", logger());
}
```

## Rollback Strategy

1. **Database Migrations**: Keep migration files versioned
2. **Application**: Use deployment platform's rollback feature
3. **Emergency**: Keep previous version Docker images

## Support

For deployment issues:
1. Check deployment platform documentation
2. Review application logs
3. Monitor error tracking service
4. Check database connection and queries
