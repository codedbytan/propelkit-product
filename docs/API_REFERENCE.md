# 📡 PropelKit API Reference

Complete reference for all API endpoints in PropelKit.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Organizations](#organizations)
3. [Teams](#teams)
4. [Payments](#payments)
5. [Subscriptions](#subscriptions)
6. [Webhooks](#webhooks)
7. [Admin](#admin)
8. [Files & Uploads](#files--uploads)

---

## Base URL

```
# Development
http://localhost:3000/api

# Production
https://your-app.com/api
```

---

## Authentication

All protected endpoints require authentication via Supabase Auth.

### Headers

```typescript
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Get Current User

```typescript
GET /api/auth/me

// Response
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

## Organizations

### Create Organization

```typescript
POST /api/organizations

// Request Body
{
  "name": "Acme Corp",
  "slug": "acme-corp"  // Optional, auto-generated if not provided
}

// Response
{
  "organization": {
    "id": "uuid",
    "name": "Acme Corp",
    "slug": "acme-corp",
    "owner_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z"
  }
}

// Errors
400: { "error": "Organization name required" }
409: { "error": "Organization slug already exists" }
401: { "error": "Unauthorized" }
```

---

### Get Organizations

```typescript
GET /api/organizations

// Response
{
  "organizations": [
    {
      "id": "uuid",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "role": "owner",  // owner | admin | member
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### Get Organization by ID

```typescript
GET /api/organizations/[id]

// Response
{
  "organization": {
    "id": "uuid",
    "name": "Acme Corp",
    "slug": "acme-corp",
    "owner_id": "uuid",
    "members_count": 5,
    "created_at": "2024-01-01T00:00:00Z"
  },
  "role": "owner"
}

// Errors
404: { "error": "Organization not found" }
403: { "error": "Access denied" }
```

---

### Update Organization

```typescript
PATCH /api/organizations/[id]

// Request Body
{
  "name": "New Name",  // Optional
  "settings": {        // Optional
    "notifications": true
  }
}

// Response
{
  "organization": {
    "id": "uuid",
    "name": "New Name",
    // ... updated fields
  }
}

// Errors
403: { "error": "Only owners can update organization" }
400: { "error": "Invalid request body" }
```

---

### Delete Organization

```typescript
DELETE /api/organizations/[id]

// Response
{
  "success": true,
  "message": "Organization deleted"
}

// Errors
403: { "error": "Only owners can delete organization" }
404: { "error": "Organization not found" }
```

---

## Teams

### Invite Team Member

```typescript
POST /api/organizations/[id]/invites

// Request Body
{
  "email": "member@example.com",
  "role": "member"  // owner | admin | member
}

// Response
{
  "invite": {
    "id": "uuid",
    "email": "member@example.com",
    "role": "member",
    "expires_at": "2024-01-08T00:00:00Z",  // 7 days
    "created_at": "2024-01-01T00:00:00Z"
  }
}

// Errors
403: { "error": "Only owners and admins can invite" }
409: { "error": "User already a member" }
400: { "error": "Invalid email or role" }
```

---

### Get Team Members

```typescript
GET /api/organizations/[id]/members

// Response
{
  "members": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "role": "owner",
      "joined_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### Update Member Role

```typescript
PATCH /api/organizations/[id]/members/[memberId]

// Request Body
{
  "role": "admin"  // owner | admin | member
}

// Response
{
  "member": {
    "id": "uuid",
    "role": "admin",
    // ... updated fields
  }
}

// Errors
403: { "error": "Only owners can change roles" }
400: { "error": "Cannot change owner role" }
```

---

### Remove Member

```typescript
DELETE /api/organizations/[id]/members/[memberId]

// Response
{
  "success": true,
  "message": "Member removed"
}

// Errors
403: { "error": "Only owners and admins can remove members" }
400: { "error": "Cannot remove organization owner" }
```

---

## Payments

### Create Checkout Session

```typescript
POST /api/checkout

// Request Body
{
  "plan": "starter",  // starter | agency
  "organization_id": "uuid",  // Optional
  "coupon_code": "LAUNCH50"   // Optional
}

// Response
{
  "order": {
    "id": "order_xxxxx",
    "amount": 399900,  // In paise (₹3,999)
    "currency": "INR",
    "receipt": "receipt_123"
  },
  "razorpay_key_id": "rzp_test_xxxxx"
}

// Errors
400: { "error": "Invalid plan" }
404: { "error": "Coupon not found" }
401: { "error": "Unauthorized" }
```

---

### Verify Payment

```typescript
POST /api/checkout/verify

// Request Body
{
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "signature_hash",
  "plan": "starter",
  "organization_id": "uuid"  // Optional
}

// Response
{
  "success": true,
  "payment": {
    "id": "uuid",
    "status": "completed",
    "amount": 399900,
    "license_key": "xxxx-xxxx-xxxx-xxxx"
  }
}

// Errors
400: { "error": "Invalid signature" }
500: { "error": "Payment verification failed" }
```

---

## Subscriptions

### Create Subscription

```typescript
POST /api/subscriptions

// Request Body
{
  "plan_id": "plan_xxxxx",  // Razorpay plan ID
  "organization_id": "uuid"
}

// Response
{
  "subscription": {
    "id": "sub_xxxxx",
    "plan_id": "plan_xxxxx",
    "status": "created",
    "short_url": "https://rzp.io/l/xxxxx"  // Payment link
  }
}
```

---

### Get Subscriptions

```typescript
GET /api/subscriptions

// Query Parameters
?organization_id=uuid  // Optional filter

// Response
{
  "subscriptions": [
    {
      "id": "sub_xxxxx",
      "status": "active",
      "current_start": 1704067200,
      "current_end": 1706745600,
      "plan_id": "plan_xxxxx",
      "organization_id": "uuid"
    }
  ]
}
```

---

### Cancel Subscription

```typescript
DELETE /api/subscriptions/[id]

// Response
{
  "success": true,
  "subscription": {
    "id": "sub_xxxxx",
    "status": "cancelled",
    "ended_at": 1706745600
  }
}

// Errors
404: { "error": "Subscription not found" }
403: { "error": "Access denied" }
```

---

## Webhooks

### Razorpay Webhook

```typescript
POST /api/webhooks/razorpay

// Handled Events:
// - payment.captured
// - subscription.activated
// - subscription.charged
// - subscription.cancelled

// Request Headers (from Razorpay)
x-razorpay-signature: <webhook_signature>

// Request Body (varies by event)
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "id": "pay_xxxxx",
      "amount": 399900,
      "status": "captured"
    }
  }
}

// Response
{
  "success": true,
  "message": "Webhook processed"
}

// Errors
400: { "error": "Invalid signature" }
500: { "error": "Processing failed" }
```

**Note**: This endpoint verifies webhook signature automatically.

---

## Admin

### Get Dashboard Stats

```typescript
GET /api/admin/stats

// Requires: Admin role

// Response
{
  "users": {
    "total": 1250,
    "active": 980,
    "new_this_month": 45
  },
  "revenue": {
    "mrr": 125000,  // In paise
    "total": 500000,
    "this_month": 150000
  },
  "organizations": {
    "total": 420,
    "active": 350
  }
}

// Errors
403: { "error": "Admin access required" }
```

---

### Get All Users

```typescript
GET /api/admin/users

// Query Parameters
?page=1&limit=50&search=email@example.com

// Response
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "created_at": "2024-01-01T00:00:00Z",
      "last_sign_in": "2024-01-09T10:00:00Z",
      "organizations_count": 2
    }
  ],
  "total": 1250,
  "page": 1,
  "limit": 50
}
```

---

### Impersonate User

```typescript
POST /api/admin/impersonate

// Request Body
{
  "user_id": "uuid"
}

// Response
{
  "access_token": "temp_access_token",
  "expires_at": 3600  // 1 hour
}

// Use this token for subsequent requests to act as that user

// Errors
403: { "error": "Admin access required" }
404: { "error": "User not found" }
```

---

### Get Audit Logs

```typescript
GET /api/admin/audit-logs

// Query Parameters
?user_id=uuid&action=user_created&page=1&limit=50

// Response
{
  "logs": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "action": "user_created",
      "details": {
        "email": "user@example.com"
      },
      "ip_address": "192.168.1.1",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 5000,
  "page": 1,
  "limit": 50
}
```

---

## Files & Uploads

### Upload File

```typescript
POST /api/uploads

// Content-Type: multipart/form-data

// Request Body (FormData)
{
  "file": <File>,
  "folder": "avatars"  // Optional
}

// Response
{
  "file": {
    "id": "uuid",
    "url": "https://storage.com/file.jpg",
    "filename": "avatar.jpg",
    "size": 102400,  // bytes
    "mime_type": "image/jpeg"
  }
}

// Errors
400: { "error": "No file provided" }
413: { "error": "File too large (max 5MB)" }
415: { "error": "Invalid file type" }
```

---

### Delete File

```typescript
DELETE /api/uploads/[id]

// Response
{
  "success": true,
  "message": "File deleted"
}

// Errors
404: { "error": "File not found" }
403: { "error": "Access denied" }
```

---

## Error Responses

All error responses follow this format:

```typescript
{
  "error": "Error message",
  "code": "ERROR_CODE",  // Optional
  "details": {}          // Optional, validation errors
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (logged in but no permission)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `413` - Payload Too Large
- `415` - Unsupported Media Type
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Authentication | 5 requests | 1 minute |
| Payments | 10 requests | 1 minute |
| File Uploads | 20 requests | 1 minute |
| General API | 100 requests | 1 minute |

**Headers** (included in all responses):
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067260
```

---

## Webhooks Best Practices

### Signature Verification

Always verify webhook signatures before processing:

```typescript
import Razorpay from 'razorpay';

const signature = request.headers.get('x-razorpay-signature');
const body = await request.text();

const isValid = Razorpay.validateWebhookSignature(
  body,
  signature,
  process.env.RAZORPAY_WEBHOOK_SECRET
);

if (!isValid) {
  return NextResponse.json(
    { error: 'Invalid signature' },
    { status: 400 }
  );
}
```

### Idempotency

Webhooks may be sent multiple times. Always handle them idempotently:

```typescript
// Check if already processed
const existing = await supabase
  .from('webhook_events')
  .select('id')
  .eq('razorpay_event_id', eventId)
  .single();

if (existing) {
  return NextResponse.json({ success: true }); // Already processed
}

// Store event ID to prevent duplicates
await supabase.from('webhook_events').insert({
  razorpay_event_id: eventId,
  processed_at: new Date().toISOString(),
});
```

---

## API Client Example

### TypeScript/JavaScript

```typescript
class PropelKitAPI {
  private baseUrl: string;
  private accessToken: string;

  constructor(baseUrl: string, accessToken: string) {
    this.baseUrl = baseUrl;
    this.accessToken = accessToken;
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async createOrganization(name: string, slug?: string) {
    return this.request('/api/organizations', {
      method: 'POST',
      body: JSON.stringify({ name, slug }),
    });
  }

  async getOrganizations() {
    return this.request('/api/organizations');
  }

  // Add more methods as needed...
}

// Usage
const api = new PropelKitAPI(
  'https://your-app.com',
  'your_access_token'
);

const org = await api.createOrganization('Acme Corp');
```

---

## Testing APIs

### Using curl

```bash
# GET request
curl https://your-app.com/api/organizations \
  -H "Authorization: Bearer YOUR_TOKEN"

# POST request
curl -X POST https://your-app.com/api/organizations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Acme Corp"}'
```

### Using PowerShell (Windows)

```powershell
# GET request
$headers = @{
  "Authorization" = "Bearer YOUR_TOKEN"
}
Invoke-RestMethod -Uri "https://your-app.com/api/organizations" -Headers $headers

# POST request
$body = @{
  name = "Acme Corp"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://your-app.com/api/organizations" `
  -Method Post `
  -Headers $headers `
  -Body $body `
  -ContentType "application/json"
```

---

## Support

For API support:
- 📧 Email: support@propelkit.dev
- 📖 Docs: [propelkit.dev/docs](https://propelkit.dev/docs)
- 💬 Discord: [Join community](https://discord.gg/propelkit)

---

**Last Updated**: January 2026  
**API Version**: 1.0.0