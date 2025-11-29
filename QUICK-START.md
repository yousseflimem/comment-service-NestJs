# Comment Service - Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js (v18+) installed
- ✅ MongoDB running
- ✅ Auth Service running on port 8081 (for JWT validation)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

Expected packages:
- @nestjs/* (framework)
- mongoose (MongoDB ODM)
- passport-jwt (authentication)
- class-validator (validation)
- axios (HTTP client)

### 2. Setup Environment

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=8084
MONGODB_URI=mongodb://localhost:27017/hand4pal_comments_db
JWT_SECRET=VHJlcyBTZWNyZXQgS2V5IFBvdXIgSGFuZDRQYWwgUHJvamVjdCAyMDI1ICE=
AUTH_SERVICE_URL=http://localhost:8081
```

### 3. Verify MongoDB

Check MongoDB is running:
```bash
# Option 1: Local MongoDB
mongosh

# Option 2: Docker
docker ps | grep mongo
```

If not running:
```bash
# Start local MongoDB
mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Start the Service

Development mode (with hot reload):
```bash
npm run start:dev
```

You should see:
```
🚀 Comment Service is running on: http://localhost:8084
```

## Verify Installation

### Test 1: Health Check
The service should be running without errors.

### Test 2: Check MongoDB Connection
```bash
mongosh
> use hand4pal_comments_db
> show collections
```

### Test 3: API Test (requires JWT token)

Get a JWT token from your auth service first, then:

```bash
# Create a comment
curl -X POST http://localhost:8084/comments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test comment",
    "campaignId": 1
  }'
```

Expected response:
```json
{
  "commentId": "...",
  "content": "Test comment",
  "publicationDate": "2025-...",
  "lastModifiedDate": null,
  "campaignId": 1,
  "citizenId": 123
}
```

## Using Postman

1. Import collection: `Comment-Service-API.postman_collection.json`
2. Set variables:
   - `base_url`: http://localhost:8084
   - `jwt_token`: Your valid JWT token
3. Run requests in order:
   - Create Comment
   - Get All Comments
   - Get Comments by Campaign
   - Update Comment
   - Delete Comment

## Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution:**
```bash
# Check MongoDB status
systemctl status mongod

# Restart MongoDB
systemctl restart mongod

# Or start Docker MongoDB
docker start mongodb
```

### Issue: "JWT token invalid"
**Solution:**
- Verify AUTH_SERVICE_URL is correct
- Ensure JWT_SECRET matches your auth service
- Get a fresh token from auth service

### Issue: "Port 8084 already in use"
**Solution:**
```bash
# Find process using port
lsof -ti:8084

# Kill the process
lsof -ti:8084 | xargs kill -9

# Or change PORT in .env
PORT=8085
```

### Issue: "Module not found"
**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Project Structure Overview

```
src/
├── auth/                    # Authentication module
│   ├── strategies/          # Passport JWT strategy
│   ├── guards/             # Auth guards
│   └── auth.service.ts     # Auth service (talks to auth-service)
├── comment/                 # Comment module
│   ├── dto/                # Data Transfer Objects
│   ├── schemas/            # MongoDB schemas
│   ├── comment.controller.ts
│   ├── comment.service.ts
│   └── comment.module.ts
├── app.module.ts           # Root module
└── main.ts                 # Entry point
```

## Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload

# Production
npm run build             # Build for production
npm run start:prod        # Run production build

# Testing
npm run test              # Run unit tests
npm run test:watch        # Run tests in watch mode
npm run test:cov          # Generate coverage report

# Linting
npm run lint              # Check code style
npm run format            # Format code
```

## Next Steps

1. ✅ Service is running
2. 📝 Review API documentation: `API-DOCUMENTATION.md`
3. 🧪 Test with Postman collection
4. 📖 Read migration guide: `MIGRATION-GUIDE.md`
5. 🚀 Deploy to production (see README.md)

## Getting Help

- Check `README.md` for detailed documentation
- Review `API-DOCUMENTATION.md` for endpoint details
- See `MIGRATION-GUIDE.md` for Spring Boot comparison
- Contact development team for support

## Quick Reference

### Environment Variables
| Variable | Purpose | Default |
|----------|---------|---------|
| PORT | Server port | 8084 |
| MONGODB_URI | Database URL | mongodb://localhost:27017/... |
| JWT_SECRET | JWT validation | (base64 string) |
| AUTH_SERVICE_URL | Auth service | http://localhost:8081 |

### API Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /comments | Create comment |
| GET | /comments | Get all comments |
| GET | /comments/campaign/:id | Get by campaign |
| PUT | /comments/:id | Update comment |
| DELETE | /comments/:id | Delete comment |

### MongoDB Collections
- `comments`: Main collection for storing comments

---

**Your Comment Service is ready! 🎉**

Start making requests using the Postman collection or curl commands above.
