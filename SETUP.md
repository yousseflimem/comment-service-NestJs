# Complete Setup Instructions

## 📦 What You've Got

Your NestJS Comment Service includes:
- ✅ Full NestJS application with MongoDB
- ✅ JWT authentication and validation
- ✅ Complete API endpoints (CRUD operations)
- ✅ DTOs with validation decorators
- ✅ Integration with Auth Service via HTTP
- ✅ Postman collection for testing
- ✅ Docker support (optional)
- ✅ Comprehensive documentation

## 🎯 Quick Start (Recommended)

### Option 1: Local Development (Fastest)

1. **Install dependencies**
   ```bash
   cd comment-service-NestJs
   npm install
   ```

2. **Setup environment**
   ```bash
   # .env file is already created, just verify/edit it
   cat .env
   ```

3. **Start MongoDB**
   ```bash
   # If you have MongoDB installed locally:
   mongod
   
   # OR use Docker:
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

4. **Run the service**
   ```bash
   npm run start:dev
   ```

5. **Test it!**
   - Import Postman collection: `Comment-Service-API.postman_collection.json`
   - Set `jwt_token` variable with a valid JWT from your auth service
   - Run the requests!

### Option 2: Docker Compose (Easiest for Full Setup)

```bash
# Start MongoDB only (run app locally)
docker-compose up mongodb

# OR start everything
docker-compose up

# In background
docker-compose up -d
```

## 📋 Detailed Setup

### Step 1: Prerequisites

Install these if you haven't:

**Node.js (v18+)**
```bash
# Check version
node --version
npm --version

# Install if needed (Windows)
# Download from: https://nodejs.org/

# Install if needed (Mac)
brew install node

# Install if needed (Linux)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**MongoDB**
```bash
# Check if installed
mongosh --version

# Install (Windows)
# Download from: https://www.mongodb.com/try/download/community

# Install (Mac)
brew tap mongodb/brew
brew install mongodb-community

# Install (Linux)
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
sudo apt-get install -y mongodb-org
```

### Step 2: Install Project Dependencies

```bash
cd comment-service-NestJs
npm install
```

This installs:
- `@nestjs/*` - NestJS framework
- `mongoose` - MongoDB ODM
- `@nestjs/jwt` - JWT utilities
- `passport-jwt` - JWT authentication
- `class-validator` - DTO validation
- `class-transformer` - Object transformation
- `axios` - HTTP client for auth service
- All TypeScript and dev dependencies

### Step 3: Configure Environment

The `.env` file is already created with default values:

```env
PORT=8084
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/hand4pal_comments_db
JWT_SECRET=VHJlcyBTZWNyZXQgS2V5IFBvdXIgSGFuZDRQYWwgUHJvamVjdCAyMDI1ICE=
AUTH_SERVICE_URL=http://localhost:8081
```

**Modify if needed:**
- Change `PORT` if 8084 is in use
- Update `MONGODB_URI` if using remote MongoDB
- Update `AUTH_SERVICE_URL` if your auth service is elsewhere
- Keep `JWT_SECRET` same as your auth service

### Step 4: Start MongoDB

Choose one method:

**Method A: Local MongoDB**
```bash
# Start MongoDB service
mongod

# Verify it's running
mongosh
> show dbs
> exit
```

**Method B: Docker MongoDB**
```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:7.0

# Verify
docker ps | grep mongo
```

**Method C: Docker Compose**
```bash
docker-compose up mongodb -d
```

### Step 5: Ensure Auth Service is Running

Your Comment Service needs to communicate with the Auth Service.

Verify Auth Service is accessible:
```bash
# Should return 401 or proper error (not connection refused)
curl http://localhost:8081/auth/me
```

If Auth Service is not running, start it first!

### Step 6: Start Comment Service

**Development Mode (with hot reload):**
```bash
npm run start:dev
```

**Production Mode:**
```bash
npm run build
npm run start:prod
```

**Debug Mode:**
```bash
npm run start:debug
```

You should see:
```
🚀 Comment Service is running on: http://localhost:8084
```

## 🧪 Testing

### Manual Testing with curl

1. **Get a JWT token from your auth service**
   ```bash
   # Login to get token (example)
   curl -X POST http://localhost:8081/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"password"}'
   ```

2. **Create a comment**
   ```bash
   curl -X POST http://localhost:8084/comments \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "content": "Great campaign!",
       "campaignId": 1
     }'
   ```

3. **Get all comments**
   ```bash
   curl -X GET http://localhost:8084/comments \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

### Testing with Postman

1. **Import collection**
   - Open Postman
   - Import `Comment-Service-API.postman_collection.json`

2. **Set variables**
   - Click collection → Variables tab
   - Set `jwt_token` to your valid JWT
   - Set `base_url` to `http://localhost:8084` (default)

3. **Run tests**
   - Create Comment
   - Get All Comments
   - Get Comments by Campaign
   - Update Comment
   - Delete Comment

## 🔍 Verify Everything Works

### Check 1: Service is Running
```bash
# Should see startup message
npm run start:dev
# Look for: 🚀 Comment Service is running on: http://localhost:8084
```

### Check 2: MongoDB Connection
```bash
mongosh
> use hand4pal_comments_db
> db.comments.find()
```

### Check 3: Create Test Comment
```bash
# Use Postman "Create Comment" request with valid JWT
# Should get 200 response with comment data
```

### Check 4: View in MongoDB
```bash
mongosh
> use hand4pal_comments_db
> db.comments.find().pretty()
```

## 📁 Project Structure

```
comment-service-NestJs/
├── src/
│   ├── auth/                      # Authentication module
│   │   ├── dto/
│   │   │   └── user.dto.ts       # User DTO from auth service
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts # JWT guard for routes
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts   # Passport JWT strategy
│   │   ├── auth.module.ts
│   │   └── auth.service.ts       # Calls auth service
│   │
│   ├── comment/                   # Comment module
│   │   ├── dto/
│   │   │   ├── create-comment.dto.ts
│   │   │   ├── update-comment.dto.ts
│   │   │   └── comment-response.dto.ts
│   │   ├── schemas/
│   │   │   └── comment.schema.ts # MongoDB schema
│   │   ├── comment.controller.ts # API endpoints
│   │   ├── comment.service.ts    # Business logic
│   │   └── comment.module.ts
│   │
│   ├── app.module.ts              # Root module
│   └── main.ts                    # Entry point
│
├── .env                           # Environment variables
├── .env.example                   # Environment template
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── nest-cli.json                  # NestJS CLI config
│
├── Dockerfile                     # Docker build
├── docker-compose.yml             # Docker Compose setup
├── .dockerignore
│
├── README.md                      # Main documentation
├── API-DOCUMENTATION.md           # API details
├── MIGRATION-GUIDE.md             # Spring Boot → NestJS
├── QUICK-START.md                 # Quick start guide
├── SETUP.md                       # This file
│
└── Comment-Service-API.postman_collection.json
```

## 🐛 Troubleshooting

### Problem: MongoDB Connection Failed

**Error:** `MongoServerError: connect ECONNREFUSED`

**Solutions:**
1. Check MongoDB is running:
   ```bash
   # Check process
   ps aux | grep mongod
   
   # Or check Docker
   docker ps | grep mongo
   ```

2. Verify connection string in `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/hand4pal_comments_db
   ```

3. Test MongoDB connection:
   ```bash
   mongosh mongodb://localhost:27017
   ```

### Problem: JWT Validation Failed

**Error:** `401 Unauthorized`

**Solutions:**
1. Verify JWT token is valid (not expired)
2. Check JWT_SECRET matches auth service:
   ```env
   JWT_SECRET=VHJlcyBTZWNyZXQgS2V5IFBvdXIgSGFuZDRQYWwgUHJvamVjdCAyMDI1ICE=
   ```
3. Ensure Authorization header format:
   ```
   Authorization: Bearer <token>
   ```

### Problem: Auth Service Not Reachable

**Error:** `Failed to connect to auth service`

**Solutions:**
1. Verify auth service is running:
   ```bash
   curl http://localhost:8081/auth/me
   ```

2. Check AUTH_SERVICE_URL in `.env`:
   ```env
   AUTH_SERVICE_URL=http://localhost:8081
   ```

3. If using Docker, use correct hostname:
   ```env
   AUTH_SERVICE_URL=http://host.docker.internal:8081
   ```

### Problem: Port Already in Use

**Error:** `EADDRINUSE: address already in use :::8084`

**Solutions:**
1. Change port in `.env`:
   ```env
   PORT=8085
   ```

2. Or kill process using port 8084:
   ```bash
   # Find process
   lsof -ti:8084
   
   # Kill it
   lsof -ti:8084 | xargs kill -9
   ```

### Problem: Module Not Found

**Error:** `Cannot find module '@nestjs/...'`

**Solutions:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Or force clean install
npm ci
```

### Problem: Validation Errors

**Error:** `400 Bad Request` with validation messages

**Solutions:**
1. Check request body matches DTOs:
   ```json
   {
     "content": "string (required, non-empty)",
     "campaignId": 1  // number (required)
   }
   ```

2. Ensure Content-Type header:
   ```
   Content-Type: application/json
   ```

## 🚀 Production Deployment

### Environment Setup

1. **Create production .env**:
   ```env
   PORT=8084
   NODE_ENV=production
   MONGODB_URI=mongodb://your-mongo-host:27017/hand4pal_comments_db
   JWT_SECRET=your-production-secret
   AUTH_SERVICE_URL=https://your-auth-service.com
   ```

2. **Build application**:
   ```bash
   npm run build
   ```

3. **Start production server**:
   ```bash
   npm run start:prod
   ```

### Docker Deployment

1. **Build image**:
   ```bash
   docker build -t comment-service:latest .
   ```

2. **Run container**:
   ```bash
   docker run -d \
     --name comment-service \
     -p 8084:8084 \
     --env-file .env.production \
     comment-service:latest
   ```

### Using Docker Compose

```bash
# Production mode
docker-compose up -d

# View logs
docker-compose logs -f comment-service

# Stop
docker-compose down
```

## 📚 Additional Resources

- **README.md**: Comprehensive overview and features
- **API-DOCUMENTATION.md**: Detailed API endpoint documentation
- **MIGRATION-GUIDE.md**: Spring Boot to NestJS comparison
- **QUICK-START.md**: Fast-track setup guide
- **Postman Collection**: Complete API tests

## ✅ Final Checklist

- [ ] Node.js installed (v18+)
- [ ] MongoDB running
- [ ] Auth Service running on port 8081
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured
- [ ] Service starts without errors
- [ ] Can create comment via Postman
- [ ] Comments visible in MongoDB
- [ ] All Postman tests pass

## 🎉 You're Done!

Your Comment Service is fully set up and ready to use!

**Next steps:**
1. Test all endpoints with Postman
2. Integrate with your frontend application
3. Deploy to production when ready

**Need help?**
- Check documentation files
- Review error messages carefully
- Contact development team

---

**Happy coding! 🚀**
