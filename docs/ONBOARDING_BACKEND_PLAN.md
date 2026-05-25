# Provider Onboarding Backend Integration Plan

## Overview
This document outlines the backend architecture and implementation plan for integrating the provider onboarding workflow.

## Alignment Decisions

- Use UUID/string IDs, not integer `SERIAL` IDs.
- Use `service_providers` as the real provider profile table.
- Use `business_type` only for legal structure: `individual`, `company`, `franchise`.
- Use `category_id` or `primary_category` for Hotels, Restaurants, Transport, etc.
- Only registration and email verification should be public.
- Business info, services, verification, training, and activation should use authenticated provider routes.
- The frontend sends `password`; the backend hashes it with bcrypt.
- Service payloads should align with the provider service model: `title`, `category_id`, `price_type`, `base_price`, `duration`, `features`, `availability`.

## Database Schema Changes

### 1. Service Providers Table
```sql
CREATE TABLE service_providers (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(50) NOT NULL, -- individual, company, franchise
  primary_category VARCHAR(100),
  category_id VARCHAR(100),
  description TEXT,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Nigeria',
  postal_code VARCHAR(50),
  business_phone VARCHAR(50),
  business_email VARCHAR(255),
  website VARCHAR(255),
  onboarding_status VARCHAR(50) DEFAULT 'registered',
  verification_status VARCHAR(50) DEFAULT 'pending',
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Provider Verification Table
```sql
CREATE TABLE provider_verifications (
  id UUID PRIMARY KEY,
  provider_id UUID REFERENCES service_providers(id),
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, failed
  document_review_status VARCHAR(50) DEFAULT 'pending',
  business_verification_status VARCHAR(50) DEFAULT 'pending',
  identity_verification_status VARCHAR(50) DEFAULT 'pending',
  manual_review_status VARCHAR(50) DEFAULT 'pending',
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Provider Documents Table
```sql
CREATE TABLE provider_documents (
  id UUID PRIMARY KEY,
  provider_id UUID REFERENCES service_providers(id),
  document_type VARCHAR(100), -- business_registration, tax_id, proof_of_address, identity
  file_name VARCHAR(255),
  file_path VARCHAR(500),
  file_size INTEGER,
  mime_type VARCHAR(100),
  upload_status VARCHAR(50) DEFAULT 'pending', -- pending, uploaded, verified, rejected
  verification_notes TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP
);
```

### 4. Provider Training Progress Table
```sql
CREATE TABLE provider_training_progress (
  id UUID PRIMARY KEY,
  provider_id UUID REFERENCES service_providers(id),
  module_id VARCHAR(50), -- dashboard, bookings, services, communication
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Users Table Requirements
The registration endpoint should create or reuse an existing `users` row with provider role. The `users` table should support:

- `role = provider`
- `email_verified`
- `email_verification_token`
- `email_verified_at`
- bcrypt-hashed password storage

## API Endpoints

### Phase 1: Registration
**POST /api/v1/public/onboarding/register**
- Request body:
  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@company.com",
    "phone": "+2348000000000",
    "password": "SecurePassword123",
    "business_name": "Eko Hotels",
    "business_type": "company",
    "category_id": "cat_hotels"
  }
  ```
- Response:
  ```json
  {
    "success": true,
    "data": {
      "provider_id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440001",
      "email_verification_token": "token_string",
      "onboarding_status": "registered"
    },
    "message": "Registration successful. Please verify your email."
  }
  ```

**POST /api/v1/public/onboarding/verify-email**
- Request body:
  ```json
  {
    "token": "verification_token"
  }
  ```
- Response:
  ```json
  {
    "success": true,
    "data": { "verified": true },
    "message": "Email verified successfully"
  }
  ```

### Phase 2: Business Information
**PUT /api/v1/provider/onboarding/business-info**
- Request body (multipart/form-data):
  ```
  address: "123 Victoria Island"
  city: "Lagos"
  state: "Lagos State"
  country: "Nigeria"
  postal_code: "101241"
  business_phone: "+2348000000000"
  business_email: "info@eko-hotels.com"
  website: "https://eko-hotels.com"
  description: "Luxury hotel in Victoria Island"
  documents: [file1, file2, file3]
  ```
- Response:
  ```json
  {
    "success": true,
    "data": {
      "provider_id": "550e8400-e29b-41d4-a716-446655440000",
      "onboarding_status": "business_info",
      "documents_uploaded": 3
    },
    "message": "Business information saved successfully"
  }
  ```

### Phase 3: Service Setup
**POST /api/v1/provider/onboarding/services**
- Request body:
  ```json
  {
    "categories": ["cat_hotels", "cat_restaurants"],
    "services": [
      {
        "title": "Standard Room",
        "category_id": "cat_hotels",
        "description": "Comfortable room with amenities",
        "price_type": "fixed",
        "base_price": 50000,
        "duration": 1440,
        "features": ["WiFi", "Breakfast", "Pool"],
        "availability": [
          {
            "day_of_week": "monday",
            "open_time": "09:00",
            "close_time": "22:00"
          }
        ]
      }
    ]
  }
  ```
- Response:
  ```json
  {
    "success": true,
    "data": {
      "provider_id": "550e8400-e29b-41d4-a716-446655440000",
      "onboarding_status": "services",
      "services_created": 1
    },
    "message": "Services created successfully"
  }
  ```

### Phase 4: Verification
**GET /api/v1/provider/onboarding/verification**
- Response:
  ```json
  {
    "success": true,
    "data": {
      "provider_id": "550e8400-e29b-41d4-a716-446655440000",
      "overall_status": "in_progress",
      "steps": [
        {
          "id": "document_review",
          "name": "Document Review",
          "status": "completed",
          "completed_at": "2024-01-15T10:30:00Z"
        },
        {
          "id": "business_verification",
          "name": "Business Verification",
          "status": "in_progress",
          "completed_at": null
        },
        {
          "id": "identity_verification",
          "name": "Identity Verification",
          "status": "pending",
          "completed_at": null
        },
        {
          "id": "manual_review",
          "name": "Manual Review",
          "status": "pending",
          "completed_at": null
        }
      ]
    },
    "message": "Verification status retrieved"
  }
  ```

### Phase 5: Go-Live & Training
**POST /api/v1/provider/onboarding/training/:module_id**
- Request body:
  ```json
  {
    "completed": true
  }
  ```
- Response:
  ```json
  {
    "success": true,
    "data": {
      "module_id": "dashboard",
      "completed": true,
      "completed_at": "2024-01-15T11:00:00Z"
    },
    "message": "Training module completed"
  }
  ```

**POST /api/v1/provider/onboarding/activate**
- Request body is empty. Provider is inferred from authenticated user/session.
- Response:
  ```json
  {
    "success": true,
    "data": {
      "provider_id": "550e8400-e29b-41d4-a716-446655440000",
      "onboarding_status": "active",
      "activated_at": "2024-01-15T12:00:00Z"
    },
    "message": "Account activated successfully"
  }
  ```

## Verification Workflow

### Automated Checks
1. **Document Validation**
   - File type validation (PDF, JPG, PNG)
   - File size limits (max 10MB)
   - Basic format validation

2. **Business Registry Lookup**
   - Check against CAC (Corporate Affairs Commission) database
   - Validate tax ID with FIRS
   - Cross-reference business address

3. **Identity Verification**
   - Validate ID document format
   - Check against government databases (if available)
   - Face matching (optional, using third-party service)

### Manual Review
- Admin dashboard to review pending verifications
- Ability to approve/reject with notes
- Email notifications to providers

## Document Storage

### Storage Options
1. **Local File System** (Development)
   - Store in `/uploads/documents/` directory
   - Organized by provider ID

2. **Cloud Storage** (Production)
   - AWS S3 / Google Cloud Storage
   - CDN integration for fast access

### File Naming Convention
```
/documents/{provider_id}/{document_type}_{timestamp}_{original_name}
```

## Email Verification System

### Flow
1. User registers → Generate unique token
2. Send email with verification link
3. User clicks link → Verify token
4. Update provider record as verified
5. Allow user to continue onboarding

### Email Template
```
Subject: Verify Your Email Address

Dear {first_name},

Please verify your email address by clicking the link below:
{verification_link}

This link will expire in 24 hours.

If you did not create an account, please ignore this email.

Best regards,
TripsBook Team
```

## Implementation Priority

### Phase 1: Core Database & Auth
- Create database tables
- Implement registration endpoint
- Email verification system

### Phase 2: Business Information
- Document upload functionality
- Business info endpoint
- File storage setup

### Phase 3: Services
- Service creation endpoint
- Category management
- Availability scheduling

### Phase 4: Verification
- Automated checks
- Verification status tracking
- Admin review endpoints

### Phase 5: Go-Live
- Training completion tracking
- Account activation
- Dashboard redirect

## Frontend Integration

### API Service Methods
```typescript
// tripsbook-api.ts
class TripsBookAPI {
  async registerProvider(data: RegistrationData): Promise<RegistrationResponse>
  async verifyEmail(token: string): Promise<VerificationResponse>
  async saveBusinessInfo(data: BusinessInfoData, files: File[]): Promise<BusinessInfoResponse>
  async createServices(data: ServicesData): Promise<ServicesResponse>
  async getVerificationStatus(): Promise<VerificationStatus>
  async completeTraining(moduleId: string): Promise<TrainingResponse>
  async activateAccount(): Promise<ActivationResponse>
}
```

### Route Split

Public:

```txt
POST /api/v1/public/onboarding/register
POST /api/v1/public/onboarding/verify-email
```

Authenticated provider:

```txt
GET  /api/v1/provider/onboarding/status
PUT  /api/v1/provider/onboarding/business-info
POST /api/v1/provider/onboarding/documents
POST /api/v1/provider/onboarding/services
GET  /api/v1/provider/onboarding/verification
POST /api/v1/provider/onboarding/training/:module_id
POST /api/v1/provider/onboarding/activate
```

Admin:

```txt
GET  /api/v1/admin/providers/pending
GET  /api/v1/admin/providers/:id
POST /api/v1/admin/providers/:id/approve
POST /api/v1/admin/providers/:id/reject
PUT  /api/v1/admin/providers/:id/verification
PUT  /api/v1/admin/providers/:id/positioning
```

### Custom Hooks
```typescript
// useTripsBookAPI.ts
export function useOnboarding() {
  const [status, setStatus] = useState<OnboardingStatus>('not_started');
  const [error, setError] = useState<string | null>(null);
  // ... implementation
}
```

## Security Considerations

1. **Password Hashing**
   - Use bcrypt with salt rounds >= 10

2. **Token Security**
   - Use JWT for authentication tokens
   - Email verification tokens should expire in 24 hours

3. **File Upload Security**
   - Validate file types and sizes
   - Scan for malware
   - Store outside web root

4. **Rate Limiting**
   - Limit registration attempts
   - Limit email verification attempts

5. **Input Validation**
   - Sanitize all user inputs
   - Validate email formats
   - Validate phone numbers

## Testing Strategy

1. **Unit Tests**
   - Database operations
   - API endpoints
   - Verification logic

2. **Integration Tests**
   - Complete onboarding flow
   - Email verification
   - Document upload

3. **End-to-End Tests**
   - Full user journey
   - Admin review workflow
