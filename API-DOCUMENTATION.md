# API Documentation

## Overview
This document provides detailed information about the Comment Service API endpoints.

## Base URL
```
http://localhost:8084
```

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Create Comment

Creates a new comment for a campaign.

**Endpoint:** `POST /comments`

**Headers:**
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

**Request Body:**
```json
{
  "content": "string (required, non-empty)",
  "campaignId": "number (required)"
}
```

**Response:** `200 OK`
```json
{
  "commentId": "string (MongoDB ObjectId)",
  "content": "string",
  "publicationDate": "ISO 8601 date string",
  "lastModifiedDate": null,
  "campaignId": "number",
  "citizenId": "number (from JWT)"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid request body or missing required fields
- `401 Unauthorized` - Missing or invalid JWT token
- `500 Internal Server Error` - Server error

**Example:**
```bash
curl -X POST http://localhost:8084/comments \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is an amazing campaign!",
    "campaignId": 1
  }'
```

---

### 2. Get All Comments

Retrieves all comments from all campaigns.

**Endpoint:** `GET /comments`

**Headers:**
- `Authorization: Bearer <token>` (required)

**Response:** `200 OK`
```json
[
  {
    "commentId": "string",
    "content": "string",
    "publicationDate": "ISO 8601 date string",
    "lastModifiedDate": "ISO 8601 date string or null",
    "campaignId": "number",
    "citizenId": "number"
  }
]
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid JWT token

**Example:**
```bash
curl -X GET http://localhost:8084/comments \
  -H "Authorization: Bearer eyJhbGc..."
```

---

### 3. Get Comments by Campaign

Retrieves all comments for a specific campaign.

**Endpoint:** `GET /comments/campaign/:campaignId`

**Path Parameters:**
- `campaignId` (number, required) - The ID of the campaign

**Headers:**
- `Authorization: Bearer <token>` (required)

**Response:** `200 OK`
```json
[
  {
    "commentId": "string",
    "content": "string",
    "publicationDate": "ISO 8601 date string",
    "lastModifiedDate": "ISO 8601 date string or null",
    "campaignId": "number",
    "citizenId": "number"
  }
]
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid JWT token

**Example:**
```bash
curl -X GET http://localhost:8084/comments/campaign/1 \
  -H "Authorization: Bearer eyJhbGc..."
```

---

### 4. Update Comment

Updates the content of an existing comment.

**Endpoint:** `PUT /comments/:id`

**Path Parameters:**
- `id` (string, required) - The MongoDB ObjectId of the comment

**Headers:**
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

**Request Body:**
```json
{
  "content": "string (optional)"
}
```

**Response:** `200 OK`
```json
{
  "commentId": "string",
  "content": "string (updated)",
  "publicationDate": "ISO 8601 date string",
  "lastModifiedDate": "ISO 8601 date string (updated)",
  "campaignId": "number",
  "citizenId": "number"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid request body
- `401 Unauthorized` - Missing or invalid JWT token
- `404 Not Found` - Comment with specified ID not found

**Example:**
```bash
curl -X PUT http://localhost:8084/comments/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated comment text"
  }'
```

---

### 5. Delete Comment

Deletes a comment by its ID.

**Endpoint:** `DELETE /comments/:id`

**Path Parameters:**
- `id` (string, required) - The MongoDB ObjectId of the comment

**Headers:**
- `Authorization: Bearer <token>` (required)

**Response:** `204 No Content`

**Error Responses:**
- `401 Unauthorized` - Missing or invalid JWT token
- `404 Not Found` - Comment with specified ID not found

**Example:**
```bash
curl -X DELETE http://localhost:8084/comments/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## Data Models

### Comment
```typescript
{
  commentId: string;           // MongoDB ObjectId
  content: string;             // Comment text
  publicationDate: Date;       // When comment was created
  lastModifiedDate: Date | null; // When comment was last updated
  campaignId: number;          // ID of the related campaign
  citizenId: number;           // ID of the user who posted (from JWT)
}
```

### CreateCommentDto
```typescript
{
  content: string;    // Required, non-empty
  campaignId: number; // Required
}
```

### UpdateCommentDto
```typescript
{
  content?: string;   // Optional
}
```

### UserDto (from Auth Service)
```typescript
{
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "statusCode": number,
  "message": "string or array of strings",
  "error": "string (error type)"
}
```

**Common Error Codes:**
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication failed)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Validation Rules

### Create Comment
- `content`: Must be a non-empty string
- `campaignId`: Must be a number

### Update Comment
- `content`: If provided, must be a string

---

## Rate Limiting

Currently, there are no rate limits implemented. Consider adding rate limiting in production.

---

## Versioning

Current API version: v1 (no version prefix in URL)

---

## CORS

CORS is enabled for all origins in development. Configure appropriately for production.

---

## Authentication Flow

1. User logs in via Auth Service and receives JWT token
2. Client includes JWT in `Authorization: Bearer <token>` header
3. Comment Service validates JWT signature using shared secret
4. Comment Service extracts user info from JWT
5. For creating comments, citizenId is automatically set from JWT

---

## Testing

Use the included Postman collection: `Comment-Service-API.postman_collection.json`

Set these variables in Postman:
- `base_url`: http://localhost:8084
- `jwt_token`: Your valid JWT token
- `campaign_id`: Campaign ID for testing (e.g., 1)

---

## Support

For API support, contact the development team.
