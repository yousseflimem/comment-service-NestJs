# Comment Service - NestJS + MongoDB

A complete microservice for managing comments, rebuilt from Spring Boot to NestJS with MongoDB.

## 🚀 Features

- **CRUD Operations** for comments
- **JWT Authentication** with validation
- **MongoDB** database integration
- **Integration with Auth Service** via HTTP client
- **Campaign-based comment filtering**
- **Automatic timestamp management** (publicationDate, lastModifiedDate)
- **Input validation** using class-validator
- **RESTful API** endpoints
- **Postman collection** for API testing

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (running on localhost:27017 or remote)
- Auth Service (running on port 8081 for JWT validation)

## 🛠️ Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
   
Create a `.env` file in the root directory (or copy `.env.example`):

```env
# Application
PORT=8084
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/hand4pal_comments_db

# JWT Configuration
JWT_SECRET=VHJlcyBTZWNyZXQgS2V5IFBvdXIgSGFuZDRQYWwgUHJvamVjdCAyMDI1ICE=

# Auth Service
AUTH_SERVICE_URL=http://localhost:8081
```

3. **Start MongoDB:**
```bash
# If using local MongoDB
mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## 🏃 Running the Application

### Development mode
```bash
npm run start:dev
```

### Production mode
```bash
npm run build
npm run start:prod
```

### Debug mode
```bash
npm run start:debug
```

The service will be available at: `http://localhost:8084`

## 📁 Project Structure

```
src/
├── auth/
│   ├── dto/
│   │   └── user.dto.ts              # User data transfer object
│   ├── guards/
│   │   └── jwt-auth.guard.ts        # JWT authentication guard
│   ├── strategies/
│   │   └── jwt.strategy.ts          # Passport JWT strategy
│   ├── auth.module.ts               # Auth module
│   └── auth.service.ts              # Auth service (communicates with auth-service)
├── comment/
│   ├── dto/
│   │   ├── comment-response.dto.ts  # Response DTO
│   │   ├── create-comment.dto.ts    # Create comment DTO with validation
│   │   └── update-comment.dto.ts    # Update comment DTO
│   ├── schemas/
│   │   └── comment.schema.ts        # MongoDB schema
│   ├── comment.controller.ts        # REST API controller
│   ├── comment.module.ts            # Comment module
│   └── comment.service.ts           # Business logic
├── app.module.ts                     # Root module
└── main.ts                          # Application entry point
```

## 🔌 API Endpoints

### Authentication
All endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/comments` | Create a new comment |
| GET | `/comments` | Get all comments |
| GET | `/comments/campaign/:campaignId` | Get comments by campaign |
| PUT | `/comments/:id` | Update a comment |
| DELETE | `/comments/:id` | Delete a comment |

### Request/Response Examples

#### Create Comment
**Request:**
```json
POST /comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "This is a great campaign!",
  "campaignId": 1
}
```

**Response:**
```json
{
  "commentId": "507f1f77bcf86cd799439011",
  "content": "This is a great campaign!",
  "publicationDate": "2025-01-15T10:30:00.000Z",
  "lastModifiedDate": null,
  "campaignId": 1,
  "citizenId": 123
}
```

#### Get All Comments
**Request:**
```json
GET /comments
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "commentId": "507f1f77bcf86cd799439011",
    "content": "This is a great campaign!",
    "publicationDate": "2025-01-15T10:30:00.000Z",
    "lastModifiedDate": null,
    "campaignId": 1,
    "citizenId": 123
  }
]
```

#### Update Comment
**Request:**
```json
PUT /comments/507f1f77bcf86cd799439011
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Updated comment text"
}
```

**Response:**
```json
{
  "commentId": "507f1f77bcf86cd799439011",
  "content": "Updated comment text",
  "publicationDate": "2025-01-15T10:30:00.000Z",
  "lastModifiedDate": "2025-01-15T11:45:00.000Z",
  "campaignId": 1,
  "citizenId": 123
}
```

## 🧪 Testing with Postman

Import the Postman collection: `Comment-Service-API.postman_collection.json`

**Setup:**
1. Set the `jwt_token` variable with a valid JWT from your auth service
2. The collection includes tests for:
   - Creating comments
   - Retrieving all comments
   - Filtering by campaign
   - Updating comments
   - Deleting comments
   - Error cases (unauthorized, invalid data, not found)

## 🔑 JWT Token Format

The JWT token must contain:
```json
{
  "sub": 123,          // User ID (becomes citizenId)
  "email": "user@example.com",
  "role": "CITIZEN",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## 🗄️ Database Schema

### Comment Collection
```javascript
{
  _id: ObjectId,
  content: String (required),
  publicationDate: Date (auto-generated),
  lastModifiedDate: Date (nullable),
  campaignId: Number (required),
  citizenId: Number (required, from JWT)
}
```

## 🔄 Migration from Spring Boot

### Key Differences

| Spring Boot | NestJS |
|-------------|--------|
| JPA/Hibernate | Mongoose ODM |
| MySQL | MongoDB |
| @Entity | @Schema |
| @Repository | Model injection |
| Feign Client | Axios HTTP client |
| application.properties | .env file |
| @Autowired | Constructor injection |
| @RestController | @Controller |
| ResponseEntity | Direct return values |

### What's the Same

- ✅ Same API endpoints and behavior
- ✅ Same JWT authentication flow
- ✅ Same business logic
- ✅ Same DTOs structure
- ✅ Same validation rules
- ✅ Same integration with auth-service

## 🛡️ Security

- JWT tokens are validated on every request
- Secrets are stored in environment variables
- CORS is enabled (configure in `main.ts` as needed)
- Input validation prevents injection attacks
- citizenId is extracted from authenticated JWT (not from request body)

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 8084 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/hand4pal_comments_db |
| JWT_SECRET | JWT secret key (base64) | (see .env) |
| AUTH_SERVICE_URL | Auth service endpoint | http://localhost:8081 |

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh

# Or restart MongoDB service
sudo systemctl restart mongod
```

### JWT Validation Failed
- Ensure AUTH_SERVICE_URL is correct
- Verify the JWT_SECRET matches your auth service
- Check that the token is not expired

### Port Already in Use
```bash
# Change PORT in .env file or kill the process
lsof -ti:8084 | xargs kill -9
```

## 📦 Dependencies

### Core
- `@nestjs/common` - NestJS core
- `@nestjs/core` - NestJS core
- `@nestjs/platform-express` - Express platform
- `@nestjs/mongoose` - MongoDB integration
- `mongoose` - MongoDB ODM

### Authentication
- `@nestjs/jwt` - JWT utilities
- `@nestjs/passport` - Passport integration
- `passport-jwt` - Passport JWT strategy

### Validation
- `class-validator` - DTO validation
- `class-transformer` - Object transformation

### HTTP Client
- `axios` - HTTP requests to auth service

## 🚀 Deployment

### Docker Deployment (Optional)
Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 8084
CMD ["npm", "run", "start:prod"]
```

Build and run:
```bash
docker build -t comment-service .
docker run -p 8084:8084 --env-file .env comment-service
```

## 📄 License

This project is part of the Hand4Pal platform.

## 👥 Support

For issues or questions, please contact the development team.
