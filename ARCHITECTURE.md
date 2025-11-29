# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  (Web App / Mobile App / Postman)                               │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTP Requests
                     │ Authorization: Bearer <JWT>
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Comment Service (NestJS)                        │
│                     Port: 8084                                   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              CommentController                            │  │
│  │  POST   /comments                                         │  │
│  │  GET    /comments                                         │  │
│  │  GET    /comments/campaign/:id                            │  │
│  │  PUT    /comments/:id                                     │  │
│  │  DELETE /comments/:id                                     │  │
│  └────────────┬─────────────────────────────────────────────┘  │
│               │                                                  │
│               │ Uses                                             │
│               ▼                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              JwtAuthGuard                                 │  │
│  │  - Validates JWT token                                    │  │
│  │  - Extracts user info                                     │  │
│  │  - Protects all routes                                    │  │
│  └────────────┬─────────────────────────────────────────────┘  │
│               │                                                  │
│               │ Calls                                            │
│               ▼                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              CommentService                               │  │
│  │  - Business logic                                         │  │
│  │  - Data validation                                        │  │
│  │  - Timestamp management                                   │  │
│  └────────┬────────────────────────┬────────────────────────┘  │
│           │                        │                            │
│           │                        │ HTTP Call                  │
│           │ Database Ops           └──────────────┐            │
│           ▼                                       ▼            │
│  ┌──────────────────┐                  ┌─────────────────┐   │
│  │  Mongoose Model  │                  │  AuthService    │   │
│  │  (Comment)       │                  │  - getCurrentUser│   │
│  └────────┬─────────┘                  └────────┬────────┘   │
└───────────┼──────────────────────────────────────┼────────────┘
            │                                      │
            │                                      │ HTTP GET
            │ MongoDB Protocol                     │ /auth/me
            ▼                                      ▼
┌─────────────────────┐              ┌─────────────────────┐
│     MongoDB         │              │   Auth Service      │
│  Port: 27017        │              │   Port: 8081        │
│                     │              │                     │
│  Database:          │              │  - User validation  │
│  hand4pal_comments  │              │  - JWT verification │
│                     │              │  - Returns UserDTO  │
│  Collection:        │              └─────────────────────┘
│  - comments         │
└─────────────────────┘
```

## Request Flow

### 1. Create Comment Flow

```
Client
  │
  │ POST /comments
  │ Authorization: Bearer <JWT>
  │ Body: { content, campaignId }
  ▼
CommentController
  │
  │ Extract token from header
  ▼
JwtAuthGuard
  │
  │ Validate JWT signature
  │ Decode payload
  ▼
CommentService.createComment()
  │
  ├─► AuthService.getCurrentUser(token)
  │     │
  │     └─► HTTP GET → Auth Service /auth/me
  │           │
  │           └─► Returns UserDTO { id, email, ... }
  │
  ├─► Create Comment document
  │   - content (from request)
  │   - campaignId (from request)
  │   - citizenId (from UserDTO)
  │   - publicationDate (auto)
  │
  └─► commentModel.save()
        │
        └─► MongoDB → Insert document
              │
              └─► Returns saved document
                    │
                    └─► Map to CommentResponseDto
                          │
                          └─► Return to client
```

### 2. Get Comments Flow

```
Client
  │
  │ GET /comments/campaign/1
  │ Authorization: Bearer <JWT>
  ▼
CommentController
  │
  ▼
JwtAuthGuard (validates token)
  │
  ▼
CommentService.findByCampaignId(1)
  │
  └─► commentModel.find({ campaignId: 1 })
        │
        └─► MongoDB → Query documents
              │
              └─► Returns array of documents
                    │
                    └─► Map each to CommentResponseDto
                          │
                          └─► Return array to client
```

## Module Architecture

```
AppModule (Root)
├── ConfigModule (Global)
│   └── Loads .env variables
│
├── MongooseModule (Global)
│   └── MongoDB connection
│
├── JwtModule (Global)
│   └── JWT configuration
│
├── AuthModule
│   ├── AuthService (Auth Service HTTP client)
│   ├── JwtStrategy (Passport strategy)
│   └── JwtAuthGuard (Route protection)
│
└── CommentModule
    ├── CommentController (REST endpoints)
    ├── CommentService (Business logic)
    └── Comment Schema (MongoDB model)
```

## Data Flow

### Comment Creation

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. POST /comments + JWT
       │
       ▼
┌─────────────────┐
│   Controller    │
└──────┬──────────┘
       │
       │ 2. Validate JWT
       │
       ▼
┌─────────────────┐
│   AuthGuard     │
└──────┬──────────┘
       │
       │ 3. Extract token
       │
       ▼
┌─────────────────┐
│   Service       │
└──────┬──────────┘
       │
       │ 4. Get user info
       │
       ▼
┌─────────────────┐
│  Auth Service   │
└──────┬──────────┘
       │
       │ 5. Return UserDTO
       │
       ▼
┌─────────────────┐
│   Service       │
└──────┬──────────┘
       │
       │ 6. Create comment with citizenId
       │
       ▼
┌─────────────────┐
│  Mongoose Model │
└──────┬──────────┘
       │
       │ 7. Save to MongoDB
       │
       ▼
┌─────────────────┐
│    MongoDB      │
└──────┬──────────┘
       │
       │ 8. Return saved document
       │
       ▼
┌─────────────────┐
│    Client       │
│ CommentResponseDto│
└─────────────────┘
```

## Security Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Client Request                         │
│  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...   │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│                   JwtAuthGuard                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 1. Extract token from Authorization header         │  │
│  │ 2. Decode JWT using JWT_SECRET                     │  │
│  │ 3. Verify signature (HS256)                        │  │
│  │ 4. Check expiration                                │  │
│  │ 5. Extract payload { sub, email, role }           │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
         Valid JWT            Invalid JWT
              │                     │
              ▼                     ▼
    ┌─────────────────┐    ┌──────────────┐
    │ Allow Request   │    │ 401 Response │
    │ Set user context│    │ Unauthorized │
    └─────────────────┘    └──────────────┘
```

## Database Schema

### Comment Document (MongoDB)

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),  // Auto-generated
  content: "This is a great campaign!",
  publicationDate: ISODate("2025-01-15T10:30:00.000Z"),
  lastModifiedDate: null,  // or ISODate when updated
  campaignId: 1,
  citizenId: 123,
  __v: 0  // Mongoose version key
}
```

### Indexes (for performance)

```javascript
// Recommended indexes
db.comments.createIndex({ campaignId: 1 })
db.comments.createIndex({ citizenId: 1 })
db.comments.createIndex({ publicationDate: -1 })

// Compound index for common queries
db.comments.createIndex({ campaignId: 1, publicationDate: -1 })
```

## API Endpoint Details

```
┌─────────────────────────────────────────────────────────────┐
│                    Comment Endpoints                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  POST /comments                                             │
│  ├─ Auth: Required                                          │
│  ├─ Body: CreateCommentDto                                  │
│  └─ Returns: CommentResponseDto                             │
│                                                              │
│  GET /comments                                              │
│  ├─ Auth: Required                                          │
│  └─ Returns: CommentResponseDto[]                           │
│                                                              │
│  GET /comments/campaign/:campaignId                         │
│  ├─ Auth: Required                                          │
│  ├─ Params: campaignId (number)                            │
│  └─ Returns: CommentResponseDto[]                           │
│                                                              │
│  PUT /comments/:id                                          │
│  ├─ Auth: Required                                          │
│  ├─ Params: id (MongoDB ObjectId)                          │
│  ├─ Body: UpdateCommentDto                                  │
│  └─ Returns: CommentResponseDto                             │
│                                                              │
│  DELETE /comments/:id                                       │
│  ├─ Auth: Required                                          │
│  ├─ Params: id (MongoDB ObjectId)                          │
│  └─ Returns: 204 No Content                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

### Development

```
┌──────────────┐
│ Developer PC │
│              │
│ - NestJS app │
│ - MongoDB    │
│ - Auth Svc   │
└──────────────┘
```

### Docker Compose

```
┌────────────────────────────────────────┐
│          Docker Host                   │
│                                        │
│  ┌─────────────────┐  ┌─────────────┐│
│  │ comment-service │  │   mongodb   ││
│  │   Container     │  │  Container  ││
│  │   Port: 8084    │◄─┤ Port: 27017 ││
│  └────────┬────────┘  └─────────────┘│
│           │                           │
│           │ HTTP                      │
│           ▼                           │
│  ┌─────────────────┐                 │
│  │  auth-service   │                 │
│  │  (external)     │                 │
│  │   Port: 8081    │                 │
│  └─────────────────┘                 │
└────────────────────────────────────────┘
```

### Production

```
┌────────────────────────────────────────────────────┐
│                 Load Balancer                       │
└────────────┬───────────────────────┬────────────────┘
             │                       │
    ┌────────▼────────┐     ┌───────▼─────────┐
    │ Comment Service │     │ Comment Service │
    │   Instance 1    │     │   Instance 2    │
    └────────┬────────┘     └────────┬────────┘
             │                       │
             └───────────┬───────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │   MongoDB Cluster      │
            │   (Replica Set)        │
            │                        │
            │  Primary ◄─► Secondary │
            └────────────────────────┘
```

## Error Handling Flow

```
Request
  │
  ▼
┌─────────────┐
│ Controller  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Service    │
└──────┬──────┘
       │
       ├─► Success
       │     └─► Return data
       │
       └─► Error
             │
             ├─► ValidationError (400)
             │     └─► Return validation messages
             │
             ├─► UnauthorizedException (401)
             │     └─► Return "Unauthorized"
             │
             ├─► NotFoundException (404)
             │     └─► Return "Not Found"
             │
             └─► InternalServerError (500)
                   └─► Return generic error
```

## Configuration Flow

```
.env file
  │
  ├─ PORT=8084
  ├─ MONGODB_URI=mongodb://...
  ├─ JWT_SECRET=...
  └─ AUTH_SERVICE_URL=...
      │
      ▼
  ConfigModule (global)
      │
      ├─► MongooseModule.forRootAsync()
      │     └─► MongoDB connection
      │
      ├─► JwtModule.registerAsync()
      │     └─► JWT configuration
      │
      └─► Services (via ConfigService)
            └─► Access config values
```

## Summary

This architecture provides:
- ✅ **Modularity**: Clear separation of concerns
- ✅ **Security**: JWT authentication on all routes
- ✅ **Scalability**: Stateless design, easy to scale horizontally
- ✅ **Maintainability**: Well-structured, documented code
- ✅ **Flexibility**: MongoDB for schema evolution
- ✅ **Integration**: Clean integration with Auth Service
- ✅ **Performance**: Async operations, efficient queries
- ✅ **Testability**: Modular design, easy to mock

---

**For more details, see:**
- README.md - Complete overview
- API-DOCUMENTATION.md - API reference
- MIGRATION-GUIDE.md - Spring Boot comparison
