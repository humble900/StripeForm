# API Documentation

## Overview

This document provides comprehensive documentation for the StripeForm API. The API follows RESTful principles and returns JSON responses.

## Base URL

```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

## Authentication

Most endpoints require authentication via Firebase JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <firebase-jwt-token>
```

For anonymous users, provide a device fingerprint in the request body or headers.

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **General API**: 500 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **Form Submission**: 10 submissions per minute
- **Stripe Webhooks**: 100 requests per minute

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Window reset time (Unix timestamp)

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "ErrorType",
  "message": "Human-readable error description",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation details if applicable"
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "unique-request-id"
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `AUTHENTICATION_ERROR`: Authentication required
- `AUTHORIZATION_ERROR`: Access denied
- `NOT_FOUND_ERROR`: Resource not found
- `RATE_LIMIT_ERROR`: Rate limit exceeded
- `FORM_LIMIT_EXCEEDED`: Anonymous user form limit reached
- `INTERNAL_SERVER_ERROR`: Server error

## Endpoints

### Forms

#### GET /api/forms

Get forms for a user with pagination and filtering.

**Query Parameters:**
- `userId` (required): User ID or device fingerprint
- `limit` (optional): Number of forms to return (1-100, default: 50)
- `offset` (optional): Pagination offset (default: 0)
- `status` (optional): Filter by status (`draft`, `published`, `archived`, `deleted`)

**Response:**
```json
{
  "success": true,
  "forms": [
    {
      "id": "form-uuid",
      "title": "Contact Form",
      "description": "Get in touch with us",
      "status": "published",
      "created_at": "2024-01-01T00:00:00.000Z",
      "submission_count": 25
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 100,
    "hasMore": true
  }
}
```

#### POST /api/forms

Create a new form.

**Request Body:**
```json
{
  "title": "Contact Form",
  "description": "Optional description",
  "userId": "user-id-or-fingerprint",
  "fields": [
    {
      "type": "text",
      "label": "Full Name",
      "placeholder": "Enter your name",
      "required": true,
      "validation": {
        "minLength": 2
      }
    },
    {
      "type": "email",
      "label": "Email Address",
      "required": true
    }
  ],
  "settings": {
    "allowAnonymous": true,
    "requireCaptcha": false,
    "maxSubmissions": 1000
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "form-uuid",
    "title": "Contact Form",
    "slug": "contact-form-abc123",
    "status": "draft",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "Form created successfully"
}
```

### Form Submissions

#### POST /api/forms/submit

Submit a form response.

**Request Body:**
```json
{
  "formId": "form-uuid",
  "fields": [
    {
      "id": "field-1",
      "value": "John Doe",
      "type": "text"
    },
    {
      "id": "field-2",
      "value": "john@example.com",
      "type": "email"
    }
  ],
  "userData": {
    "email": "john@example.com",
    "name": "John Doe"
  },
  "fingerprint": "device-fingerprint",
  "metadata": {
    "userAgent": "Mozilla/5.0...",
    "referrer": "https://example.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "submission_id": "submission-uuid",
    "status": "pending"
  },
  "message": "Form submitted successfully"
}
```

### User Management

#### GET /api/users/profile

Get user profile information.

**Query Parameters:**
- `userId` (required): User ID

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "avatarUrl": "https://example.com/avatar.jpg",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT /api/users/profile

Update user profile.

**Request Body:**
```json
{
  "userId": "user-uuid",
  "updates": {
    "fullName": "John Smith",
    "avatarUrl": "https://example.com/new-avatar.jpg"
  }
}
```

### Stripe Integration

#### POST /api/stripe/create-payment-intent

Create a Stripe payment intent.

**Request Body:**
```json
{
  "amount": 2000,
  "currency": "usd",
  "metadata": {
    "formId": "form-uuid",
    "userId": "user-uuid"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "id": "pi_xxx",
    "amount": 2000,
    "currency": "usd",
    "status": "requires_payment_method"
  }
}
```

#### POST /api/stripe/create-subscription

Create a Stripe subscription.

**Request Body:**
```json
{
  "customerId": "cus_xxx",
  "priceId": "price_xxx",
  "metadata": {
    "userId": "user-uuid"
  }
}
```

#### POST /api/stripe/webhook

Stripe webhook endpoint for processing payment events.

**Headers:**
- `stripe-signature`: Stripe webhook signature

### Analytics

#### GET /api/analytics

Get analytics data for a user.

**Query Parameters:**
- `userId` (required): User ID
- `period` (optional): Time period (`7d`, `30d`, `90d`, `1y`, default: `30d`)
- `timezone` (optional): User timezone

**Response:**
```json
{
  "success": true,
  "analytics": {
    "totalForms": 15,
    "totalSubmissions": 245,
    "publishedForms": 12,
    "draftForms": 3,
    "averageSubmissionsPerForm": "16.33",
    "topPerformingForms": [
      {
        "id": "form-uuid",
        "title": "Contact Form",
        "submissionCount": 45
      }
    ]
  },
  "period": "30d"
}
```

## Form Field Types

Supported form field types:

- `text`: Single-line text input
- `email`: Email address input with validation
- `number`: Numeric input
- `select`: Dropdown selection
- `textarea`: Multi-line text input
- `checkbox`: Boolean checkbox
- `radio`: Radio button group
- `file`: File upload

## Validation Rules

### Form Validation
- `title`: Required, 1-255 characters
- `description`: Optional, max 1000 characters
- `userId`: Required, minimum 1 character

### Field Validation
- `type`: Required, must be valid field type
- `label`: Required, minimum 1 character
- `required`: Boolean, default false

### Submission Validation
- `formId`: Required, valid UUID
- `fields`: Required array with field data
- `userData`: Optional object with user information

## Security Features

### Input Validation
All requests are validated using Zod schemas before processing.

### Spam Detection
Form submissions include automatic spam detection based on:
- Suspicious keywords
- Excessive links
- Content repetition patterns
- Bot detection in user agent

### Rate Limiting
Multiple rate limiting tiers protect against abuse.

### Security Headers
All responses include security headers:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

## SDKs and Examples

### JavaScript/TypeScript

```typescript
// Create a form
const response = await fetch('/api/forms', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${firebaseToken}`
  },
  body: JSON.stringify({
    title: 'Contact Form',
    userId: 'user-123',
    fields: [
      {
        type: 'text',
        label: 'Name',
        required: true
      }
    ]
  })
})

const result = await response.json()
```

### Form Submission

```typescript
// Submit a form
const response = await fetch('/api/forms/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    formId: 'form-uuid',
    fields: [
      { id: 'name', value: 'John Doe', type: 'text' }
    ],
    fingerprint: getDeviceFingerprint()
  })
})
```

## Changelog

### v1.0.0 (Current)
- Initial API release
- Form CRUD operations
- Form submission handling
- Stripe integration
- User management
- Analytics endpoints
- Rate limiting
- Comprehensive validation
- Spam detection
- Error handling

## Support

For API support, please contact:
- Email: support@stripeform.com
- Documentation: https://docs.stripeform.com
- Status Page: https://status.stripeform.com







